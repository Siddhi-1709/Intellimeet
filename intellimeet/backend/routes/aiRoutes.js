const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  generateMeetingSummary,
  extractActionItemsFromMeeting,
  transcribeMeetingAudio
} = require('../controllers/aiController');

const upload = multer({ dest: 'uploads/' });

router.post('/summary/:meetingId', protect, generateMeetingSummary);
router.post('/action-items/:meetingId', protect, extractActionItemsFromMeeting);
router.post('/transcribe', protect, upload.single('audio'), transcribeMeetingAudio);

module.exports = router;