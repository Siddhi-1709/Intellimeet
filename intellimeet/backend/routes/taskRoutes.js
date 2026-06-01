const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask,
  getMyTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.route('/')
  .post(protect, createTask)
  .get(protect, getMyTasks);

router.get('/my-tasks', protect, getMyTasks);
router.put('/:taskId/status', protect, updateTaskStatus);
router.route('/:taskId')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;