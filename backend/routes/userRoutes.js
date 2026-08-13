// ============================================
// USER ROUTES
// Base: /api/users
// All routes are PRIVATE (JWT required)
// ============================================

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserStats, deleteAccount, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply protect to all user rouates
router.use(protect);

// GET  /api/users/me        → Get my profile
// PUT  /api/users/me        → Update my profile (name, email, bio, phone, password)
// DELETE /api/users/me      → Delete my account + all tasks (cascade)
router.route('/me')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteAccount);

// POST /api/users/me/avatar → Upload profile picture (multipart/form-data, field: "avatar")
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

// GET /api/users/stats      → Get task statistics
router.get('/stats', getUserStats);

module.exports = router;
