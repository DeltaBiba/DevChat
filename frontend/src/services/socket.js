import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log(' Connected to server:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(' Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', chatId.toString());
      console.log(`📝 Joined chat room: ${chatId}`);
    }
  }

  sendMessage(chatId, text, userId, username) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        chatId: chatId.toString(),
        text,
        userId,
        username
      });
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  offMessage() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  startTyping(chatId, username) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { chatId: chatId.toString(), username });
    }
  }

  stopTyping(chatId, username) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_typing', { chatId: chatId.toString(), username });
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }
}

export const socketService = new SocketService();