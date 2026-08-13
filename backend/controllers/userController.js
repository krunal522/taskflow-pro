// ============================================
// USER CONTROLLER — MongoDB Version
// Uses Mongoose User + Task Models
// ============================================

const User = require('../models/User');
const Task = require('../models/Task');
const path = require('path');
const fs   = require('fs');

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
//          Supports: name, email, password (with currentPassword), bio, phone
// @access  Private
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, phone, currentPassword, password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update name if provided
    if (name && name.trim()) user.name = name.trim();

    // Update bio if provided (allow empty string to clear)
    if (bio !== undefined) user.bio = bio.trim();

    // Update phone if provided (allow empty string to clear)
    if (phone !== undefined) user.phone = phone.trim();

    // Update email if provided
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account',
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Update password — requires currentPassword verification
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to change it',
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
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
    console.error('Update Profile Error:', error);
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

// ============================================
// @route   DELETE /api/users/me
// @desc    Delete account + cascade delete all tasks
// @access  Private
// ============================================
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm account deletion',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify password before deletion
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Account deletion cancelled.',
      });
    }

    // Cascade: delete all tasks belonging to this user
    await Task.deleteMany({ user: req.user.id });

    // Delete the user
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting account' });
  }
};

// ============================================
// @route   POST /api/users/me/avatar
// @desc    Upload / replace profile avatar image
// @access  Private
// ============================================
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert image buffer to Base64 Data URI
    // Persists directly in MongoDB Atlas so avatars NEVER break on Vercel/Serverless deployments!
    const base64Avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    user.avatarUrl = base64Avatar;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully! 📸',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Upload Avatar Error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading avatar' });
  }
};

module.exports = { getProfile, updateProfile, getUserStats, deleteAccount, uploadAvatar };
