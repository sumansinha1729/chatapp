const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Store active socket connections
const activeUsers = new Map();

const socketHandler = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Store active user
    activeUsers.set(socket.userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Broadcast online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      isOnline: true
    });

    // Handle sending messages
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, receiverId, content } = data;

        // Create message
        const message = new Message({
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
          isDelivered: activeUsers.has(receiverId)
        });

        await message.save();
        await message.populate('sender', '-password');
        await message.populate('receiver', '-password');

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date()
        });

        // Send to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:new', message);
        }

        // Send confirmation to sender
        if (callback) {
          callback({ success: true, message });
        }
      } catch (error) {
        console.error('Send message error:', error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      const { receiverId, conversationId } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', {
          userId: socket.userId,
          conversationId
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const { receiverId, conversationId } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', {
          userId: socket.userId,
          conversationId
        });
      }
    });

    // Handle message read receipts
    socket.on('message:read', async (data) => {
      try {
        const { messageId, conversationId } = data;

        // Update message as read
        const message = await Message.findByIdAndUpdate(
          messageId,
          { isRead: true, readAt: new Date() },
          { new: true }
        );

        if (message) {
          // Notify sender
          const senderSocketId = activeUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:read', {
              messageId,
              conversationId,
              readAt: message.readAt
            });
          }
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle message delivered receipts
    socket.on('message:delivered', async (data) => {
      try {
        const { messageId, conversationId } = data;

        // Update message as delivered
        const message = await Message.findByIdAndUpdate(
          messageId,
          { isDelivered: true },
          { new: true }
        );

        if (message) {
          // Notify sender
          const senderSocketId = activeUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:delivered', {
              messageId,
              conversationId
            });
          }
        }
      } catch (error) {
        console.error('Message delivered error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });
};

module.exports = socketHandler;
