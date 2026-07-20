// ============================================
// AUTH ROUTES
// Base: /api/auth
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', register);   // POST /api/auth/register
router.post('/login', login);         // POST /api/auth/login

// Private Routes (JWT required)
router.get('/me', protect, getMe);    // GET /api/auth/me

module.exports = router;
