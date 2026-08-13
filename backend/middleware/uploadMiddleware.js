// ============================================
// MULTER MIDDLEWARE — Memory Storage for Cloud & Base64 Persistence
// Accepts: JPEG, PNG, WEBP
// Max size: 3 MB
// ============================================

const multer = require('multer');

// Memory storage keeps file in memory buffer (req.file.buffer)
// Allows converting to Base64 URI or streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
});

module.exports = upload;
