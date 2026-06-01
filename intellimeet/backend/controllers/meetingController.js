const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
  try {
    const { title, description, startTime, settings } = req.body;
    
    const meeting = await Meeting.create({
      title,
      description,
      host: req.user._id,
      startTime: startTime || new Date(),
      meetingId: uuidv4().substring(0, 8),
      participants: [{
        user: req.user._id,
        joinTime: new Date(),
        isActive: true
      }],
      settings: settings || {
        allowRecording: true,
        allowScreenShare: true,
        maxParticipants: 100
      }
    });
    
    // Cache meeting in Redis for quick access
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.setex(`meeting:${meeting.meetingId}`, 3600, JSON.stringify(meeting));
    }
    
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get meeting by ID
// @route   GET /api/meetings/:meetingId
// @access  Private
const getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Check Redis cache first
    const redisClient = getRedisClient();
    let meeting = null;
    
    if (redisClient) {
      const cached = await redisClient.get(`meeting:${meetingId}`);
      if (cached) {
        meeting = JSON.parse(cached);
      }
    }
    
    if (!meeting) {
      meeting = await Meeting.findOne({ meetingId })
        .populate('host', 'name email avatar')
        .populate('participants.user', 'name email avatar');
    }
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join meeting
// @route   POST /api/meetings/:meetingId/join
// @access  Private
const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if user already in meeting
    const existingParticipant = meeting.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    
    if (!existingParticipant) {
      meeting.participants.push({
        user: req.user._id,
        joinTime: new Date(),
        isActive: true
      });
    } else {
      existingParticipant.joinTime = new Date();
      existingParticipant.isActive = true;
    }
    
    await meeting.save();
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave meeting
// @route   POST /api/meetings/:meetingId/leave
// @access  Private
const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const participant = meeting.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    
    if (participant) {
      participant.leaveTime = new Date();
      participant.isActive = false;
      await meeting.save();
    }
    
    res.json({ message: 'Left meeting successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's meetings
// @route   GET /api/meetings/my-meetings
// @access  Private
const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { host: req.user._id },
        { 'participants.user': req.user._id }
      ]
    })
    .sort({ startTime: -1 })
    .populate('host', 'name email');
    
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update meeting transcription
// @route   PUT /api/meetings/:meetingId/transcription
// @access  Private
const updateTranscription = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { text, segments } = req.body;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    meeting.transcription = { text, segments };
    await meeting.save();
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMeeting,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  getMyMeetings,
  updateTranscription
};