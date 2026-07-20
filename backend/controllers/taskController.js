// ============================================
// TASK CONTROLLER — MongoDB Version
// Full CRUD using Mongoose Task Model
// ============================================

const Task = require('../models/Task');

// ============================================
// @route   GET /api/tasks
// @desc    Get all tasks for logged in user
// @access  Private
// ============================================
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;

    // Build query filter
    const filter = { user: req.user.id };

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch tasks from MongoDB (newest first)
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude __v field

    // Get stats using static method
    const stats = await Task.getStats(req.user.id);

    res.json({
      success: true,
      count: tasks.length,
      stats,
      tasks,
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

// ============================================
// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
// ============================================
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    // Invalid MongoDB ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   POST /api/tasks
// @desc    Create new task — saved in MongoDB
// @access  Private
// ============================================
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    // Create task in MongoDB
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
      user: req.user.id, // Link to logged-in user
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully! ✅',
      task,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
};

// ============================================
// @route   PUT /api/tasks/:id
// @desc    Update existing task in MongoDB
// @access  Private
// ============================================
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    // Find and update in ONE MongoDB query
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Filter: only owner can update
      { title, description, status, priority, category, dueDate },
      {
        new: true,        // Return updated document
        runValidators: true, // Run schema validations
      }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task updated successfully! ✏️',
      task,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

// ============================================
// @route   DELETE /api/tasks/:id
// @desc    Delete task from MongoDB
// @access  Private
// ============================================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // Only owner can delete
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully! 🗑️',
      taskId: task._id,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

// ============================================
// @route   PATCH /api/tasks/:id/status
// @desc    Quick status update (for Kanban drag & drop)
// @access  Private
// ============================================
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'inprogress', 'done'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: `Task moved to "${status}"!`,
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
