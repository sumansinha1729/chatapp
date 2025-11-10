import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { conversationAPI } from '../services/api';
import socketService from '../services/socket';

const ChatScreen = ({ route, navigation }) => {
  const { conversation, otherUser } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: otherUser.username,
    });

    loadMessages();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageDelivered(handleMessageDelivered);
    socketService.onMessageRead(handleMessageRead);
    socketService.onTypingStart(handleTypingStart);
    socketService.onTypingStop(handleTypingStop);
  };

  const cleanupSocketListeners = () => {
    socketService.removeListener('message:new');
    socketService.removeListener('message:delivered');
    socketService.removeListener('message:read');
    socketService.removeListener('typing:start');
    socketService.removeListener('typing:stop');
  };

  const loadMessages = async () => {
    try {
      const response = await conversationAPI.getMessages(conversation._id);
      setMessages(response.messages || []);

      // Mark messages as delivered
      response.messages.forEach((msg) => {
        if (msg.receiver._id === user._id && !msg.isDelivered) {
          socketService.markAsDelivered({
            messageId: msg._id,
            conversationId: conversation._id,
          });
        }
      });
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.conversationId === conversation._id) {
      setMessages((prev) => [...prev, message]);

      // Mark as delivered
      socketService.markAsDelivered({
        messageId: message._id,
        conversationId: conversation._id,
      });

      // Mark as read if chat is open
      setTimeout(() => {
        socketService.markAsRead({
          messageId: message._id,
          conversationId: conversation._id,
        });
      }, 500);
    }
  };

  const handleMessageDelivered = (data) => {
    if (data.conversationId === conversation._id) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isDelivered: true } : msg
        )
      );
    }
  };

  const handleMessageRead = (data) => {
    if (data.conversationId === conversation._id) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    }
  };

  const handleTypingStart = (data) => {
    if (data.conversationId === conversation._id && data.userId === otherUser._id) {
      setIsTyping(true);
    }
  };

  const handleTypingStop = (data) => {
    if (data.conversationId === conversation._id && data.userId === otherUser._id) {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || sending) {
      return;
    }

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Stop typing indicator
    socketService.stopTyping({
      receiverId: otherUser._id,
      conversationId: conversation._id,
    });

    socketService.sendMessage(
      {
        conversationId: conversation._id,
        receiverId: otherUser._id,
        content: messageText,
      },
      (response) => {
        setSending(false);
        if (response.success) {
          setMessages((prev) => [...prev, response.message]);
        }
      }
    );
  };

  const handleInputChange = (text) => {
    setInputText(text);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.trim()) {
      // Send typing start
      socketService.startTyping({
        receiverId: otherUser._id,
        conversationId: conversation._id,
      });

      // Set timeout to send typing stop
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping({
          receiverId: otherUser._id,
          conversationId: conversation._id,
        });
      }, 2000);
    } else {
      socketService.stopTyping({
        receiverId: otherUser._id,
        conversationId: conversation._id,
      });
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender._id === user._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
              ]}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isMyMessage && (
              <Text style={styles.tickMark}>
                {item.isRead ? '✓✓' : item.isDelivered ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{otherUser.username} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}>
          <Text style={styles.sendButtonText}>
            {sending ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: '#999',
  },
  tickMark: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingContainer: {
    padding: 10,
    paddingLeft: 15,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});

export default ChatScreen;
