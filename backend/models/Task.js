// ============================================
// TASK MODEL — Mongoose Schema
// Collection: tasks
// ============================================

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'inprogress', 'done'],
        message: 'Status must be: todo, inprogress, or done',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be: low, medium, or high',
      },
      default: 'medium',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [30, 'Category cannot exceed 30 characters'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // Reference to User who owns this task
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Auto adds createdAt, updatedAt
  }
);

// ============================================
// INDEX: Speed up queries by user + status
// ============================================
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// ============================================
// STATIC METHOD: Get stats for a user
// ============================================
taskSchema.statics.getStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Format stats
  const result = { total: 0, todo: 0, inprogress: 0, done: 0, highPriority: 0 };
  stats.forEach((s) => {
    result[s._id] = s.count;
    result.total += s.count;
  });

  // Get high priority count
  result.highPriority = await this.countDocuments({
    user: userId,
    priority: 'high',
  });

  return result;
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
