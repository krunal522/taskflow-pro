// ============================================
// AUTH ROUTES
// Base: /api/auth
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Enterprise Validation Rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Name should only contain letters and spaces'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Public Routes (Rate limited to prevent brute force)
router.post('/register', authLimiter, registerValidation, register);   // POST /api/auth/register
router.post('/login', authLimiter, loginValidation, login);               // POST /api/auth/login

// Private Routes (JWT required)
router.get('/me', protect, getMe);    // GET /api/auth/me

module.exports = router;
