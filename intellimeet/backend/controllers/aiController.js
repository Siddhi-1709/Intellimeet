const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const { generateSummary, extractActionItems, transcribeAudio } = require('../services/aiService');

// @desc    Generate meeting summary
// @route   POST /api/ai/summary/:meetingId
// @access  Private
const generateMeetingSummary = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    if (!meeting.transcription || !meeting.transcription.text) {
      return res.status(400).json({ message: 'No transcription available for this meeting' });
    }
    
    const summary = await generateSummary(meeting.transcription.text);
    
    meeting.summary = {
      text: summary.summary,
      keyPoints: summary.keyPoints,
      decisions: summary.decisions
    };
    
    await meeting.save();
    
    res.json(meeting.summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Extract action items from meeting
// @route   POST /api/ai/action-items/:meetingId
// @access  Private
const extractActionItemsFromMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    if (!meeting.transcription || !meeting.transcription.text) {
      return res.status(400).json({ message: 'No transcription available for this meeting' });
    }
    
    const actionItems = await extractActionItems(meeting.transcription.text);
    
    // Create tasks from action items
    const createdTasks = [];
    for (const item of actionItems) {
      const task = await Task.create({
        title: item.title,
        description: item.description,
        assignedTo: req.user._id, // Default to current user, should be parsed from AI
        assignedBy: req.user._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
        meetingId: meeting.meetingId,
        priority: item.priority || 'medium'
      });
      
      meeting.actionItems.push({
        task: task._id,
        description: item.description
      });
      
      createdTasks.push(task);
    }
    
    await meeting.save();
    
    res.json({ actionItems: createdTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Transcribe meeting audio
// @route   POST /api/ai/transcribe
// @access  Private
const transcribeMeetingAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }
    
    const transcription = await transcribeAudio(req.file.path);
    
    res.json({ transcription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateMeetingSummary,
  extractActionItemsFromMeeting,
  transcribeMeetingAudio
};