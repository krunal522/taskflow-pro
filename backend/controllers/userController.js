// ============================================
// USER CONTROLLER — MongoDB Version
// Uses Mongoose User + Task Models
// ============================================

const User = require('../models/User');
const Task = require('../models/Task');

// ============================================
// @route   GET /api/users/me
// @desc    Get current user profile from MongoDB
// @access  Private
// ============================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// @route   PUT /api/users/me
// @desc    Update user profile in MongoDB
// @access  Private
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update name if provided
    if (name) user.name = name.trim();

    // Update password if provided (pre-save hook will hash it)
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }
      user.password = password;
    }

    // Save triggers pre-save hook (avatar update + password hashing)
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully! 👤',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// ============================================
// @route   GET /api/users/stats
// @desc    Get task statistics from MongoDB
// @access  Private
// ============================================
const getUserStats = async (req, res) => {
  try {
    // Use Task model's static aggregation method
    const stats = await Task.getStats(req.user.id);

    const completionRate =
      stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

    // Priority breakdown
    const priorityStats = await Task.aggregate([
      { $match: { user: req.user._id || req.user.id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const byPriority = { high: 0, medium: 0, low: 0 };
    priorityStats.forEach((p) => { byPriority[p._id] = p.count; });

    res.json({
      success: true,
      stats: {
        ...stats,
        completionRate,
        byPriority,
      },
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

module.exports = { getProfile, updateProfile, getUserStats };
