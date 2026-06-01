const Message = require('../models/Message');
const Meeting = require('../models/Meeting');
const logger = require('../utils/logger');

const socketService = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);
    
    // Join meeting room
    socket.on('join-meeting', async (data) => {
      const { meetingId, userId, userName } = data;
      
      socket.join(meetingId);
      socket.meetingId = meetingId;
      socket.userId = userId;
      
      // Notify others in the meeting
      socket.to(meetingId).emit('user-joined', {
        userId,
        userName,
        timestamp: new Date()
      });
      
      // Send recent messages
      try {
        const recentMessages = await Message.find({ meetingId })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'name avatar');
        
        socket.emit('recent-messages', recentMessages.reverse());
      } catch (error) {
        logger.error('Error fetching recent messages:', error);
      }
    });
    
    // Handle chat messages
    socket.on('send-message', async (data) => {
      const { meetingId, message, senderId, senderName, type = 'text' } = data;
      
      try {
        const newMessage = await Message.create({
          meetingId,
          sender: senderId,
          senderName,
          content: message,
          type
        });
        
        const populatedMessage = await newMessage.populate('sender', 'name avatar');
        
        io.to(meetingId).emit('new-message', populatedMessage);
      } catch (error) {
        logger.error('Error saving message:', error);
      }
    });
    
    // WebRTC signaling
    socket.on('offer', (data) => {
      socket.to(data.meetingId).emit('offer', {
        offer: data.offer,
        from: socket.id,
        fromUserId: data.userId
      });
    });
    
    socket.on('answer', (data) => {
      socket.to(data.meetingId).emit('answer', {
        answer: data.answer,
        from: socket.id
      });
    });
    
    socket.on('ice-candidate', (data) => {
      socket.to(data.meetingId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });
    
    // Screen sharing
    socket.on('screen-share-start', (data) => {
      socket.to(data.meetingId).emit('screen-share-started', {
        userId: data.userId,
        streamId: data.streamId
      });
    });
    
    socket.on('screen-share-stop', (data) => {
      socket.to(data.meetingId).emit('screen-share-stopped', {
        userId: data.userId
      });
    });
    
    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.meetingId).emit('user-typing', {
        userId: data.userId,
        userName: data.userName
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
      
      if (socket.meetingId && socket.userId) {
        socket.to(socket.meetingId).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });
};

module.exports = socketService;