const socketService = require('../services/socketService');

const socketManager = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  
  // Initialize socket service
  socketService(io);
  
  // Health check for socket connections
  io.on('connection', (socket) => {
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
};

module.exports = { socketManager };