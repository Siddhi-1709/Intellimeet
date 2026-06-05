import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(meetingId, userId, userName) {
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      query: { meetingId, userId, userName }
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();