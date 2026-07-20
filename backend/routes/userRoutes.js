// ============================================
// USER ROUTES
// Base: /api/users
// All routes are PRIVATE (JWT required)
// ============================================

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect to all user routes
router.use(protect);

// GET /api/users/me        → Get my profile
// PUT /api/users/me        → Update my profile
router.route('/me')
  .get(getProfile)
  .put(updateProfile);

// GET /api/users/stats     → Get task statistics
router.get('/stats', getUserStats);

module.exports = router;
