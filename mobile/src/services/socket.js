import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

class SocketService {
  socket = null;
  connected = false;

  connect(token) {
    if (this.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Message events
  sendMessage(data, callback) {
    if (this.socket) {
      this.socket.emit('message:send', data, callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('message:new', callback);
    }
  }

  onMessageDelivered(callback) {
    if (this.socket) {
      this.socket.on('message:delivered', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message:read', callback);
    }
  }

  markAsDelivered(data) {
    if (this.socket) {
      this.socket.emit('message:delivered', data);
    }
  }

  markAsRead(data) {
    if (this.socket) {
      this.socket.emit('message:read', data);
    }
  }

  // Typing events
  startTyping(data) {
    if (this.socket) {
      this.socket.emit('typing:start', data);
    }
  }

  stopTyping(data) {
    if (this.socket) {
      this.socket.emit('typing:stop', data);
    }
  }

  onTypingStart(callback) {
    if (this.socket) {
      this.socket.on('typing:start', callback);
    }
  }

  onTypingStop(callback) {
    if (this.socket) {
      this.socket.on('typing:stop', callback);
    }
  }

  // User status events
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user:online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user:offline', callback);
    }
  }

  // Remove listeners
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
