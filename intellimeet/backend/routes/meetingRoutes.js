const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createMeeting,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  getMyMeetings,
  updateTranscription
} = require('../controllers/meetingController');
const { meetingLimiter } = require('../middleware/rateLimiter');

router.route('/')
  .post(protect, meetingLimiter, createMeeting)
  .get(protect, getMyMeetings);

router.get('/my-meetings', protect, getMyMeetings);
router.get('/:meetingId', protect, getMeeting);
router.post('/:meetingId/join', protect, joinMeeting);
router.post('/:meetingId/leave', protect, leaveMeeting);
router.put('/:meetingId/transcription', protect, updateTranscription);

module.exports = router;