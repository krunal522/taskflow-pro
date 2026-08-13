// ============================================
// AUTH ROUTES
// Base: /api/auth
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { authLimiter } = require('../middleware/rateLimiter');

// Public Routes (Rate limited to prevent brute force)
router.post('/register', authLimiter, register);   // POST /api/auth/register
router.post('/login', authLimiter, login);         // POST /api/auth/login

// Private Routes (JWT required)
router.get('/me', protect, getMe);    // GET /api/auth/me

module.exports = router;
