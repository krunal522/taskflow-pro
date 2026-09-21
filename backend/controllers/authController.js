// ============================================
// AUTH CONTROLLER — MongoDB Version
// Uses Mongoose User Model
// ============================================

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ============================================
// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
// ============================================
const register = async (req, res) => {
  try {
    // Validate request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(400).json({
        success: false,
        message: first.msg,
        field: first.path,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if email already exists in MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please sign in instead.',
        field: 'email',
      });
    }

    // Create user in MongoDB (password hashed via pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome to TaskFlow Pro 🚀`,
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
};

// ============================================
// @route   POST /api/auth/login
// @desc    Login user & return JWT token
// @access  Public
// ============================================
const login = async (req, res) => {
  try {
    // Validate request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(400).json({
        success: false,
        message: first.msg,
        field: first.path,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user & explicitly select password (select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    // Compare password using model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 👋`,
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
};

// ============================================
// @route   GET /api/auth/me
// @desc    Get logged in user info
// @access  Private (JWT required)
// ============================================
const getMe = async (req, res) => {
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

module.exports = { register, login, getMe };
