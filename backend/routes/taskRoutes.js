const express = require('express');
const { body } = require('express-validator');
const router = express.Router({ mergeParams: true });
const {
  getProjectTasks,
  getMyTasks,
  getDashboardStats,
  createTask,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../Middleware/auth');

router.use(protect);

// Dashboard routes (no projectId)
router.get('/my', getMyTasks);
router.get('/stats', getDashboardStats);

// Task CRUD under project
router.route('/')
  .get(getProjectTasks)
  .post(
    [body('title').trim().notEmpty().withMessage('Task title is required')],
    createTask
  );

router.route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;
