// ============================================
// TASK ROUTES
// Base: /api/tasks
// All routes are PRIVATE (JWT required)
// ============================================

const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to ALL task routes
router.use(protect);

// GET /api/tasks          → Get all tasks (with filters: ?status=todo&priority=high)
// POST /api/tasks         → Create new task
router.route('/')
  .get(getTasks)
  .post(createTask);

// GET /api/tasks/:id      → Get single task
// PUT /api/tasks/:id      → Update task
// DELETE /api/tasks/:id   → Delete task
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// PATCH /api/tasks/:id/status → Quick status update (for drag & drop)
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
