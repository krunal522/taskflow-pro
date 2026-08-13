// ============================================
// MULTER MIDDLEWARE — Avatar Upload
// Stores files in: backend/uploads/avatars/
// Accepts: JPEG, PNG, WEBP
// Max size: 2 MB
// ============================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Storage Engine ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, _file, cb) => {
    // Format: avatar-<userId>-<timestamp>.ext  (overwrites old avatar)
    const ext = path.extname(_file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

// ── File Filter ───────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

// ── Multer Instance ───────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

module.exports = upload;
