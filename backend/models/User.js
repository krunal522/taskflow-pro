// ============================================
// USER MODEL — Mongoose Schema
// Collection: users
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },
    avatar: {
      type: String,
      default: 'US', // Initials fallback (e.g. "KS")
    },
    avatarUrl: {
      type: String,
      default: null, // Null = use initials, otherwise URL to uploaded image
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [160, 'Bio cannot exceed 160 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // Auto adds createdAt, updatedAt
  }
);

// ============================================
// PRE-SAVE HOOK: Hash password before saving
// Mongoose v7+ async hooks don't need next()
// ============================================
userSchema.pre('save', async function () {
  // Auto-generate avatar initials from name (always update if name changed)
  if (this.isModified('name') || this.isNew) {
    const nameParts = this.name.trim().split(' ');
    this.avatar =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();
  }

  // Only hash if password is new or modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// ============================================
// INSTANCE METHOD: Compare passwords
// ============================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================
// INSTANCE METHOD: Get public profile (no password)
// ============================================
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    avatarUrl: this.avatarUrl || null,
    role: this.role,
    bio: this.bio,
    phone: this.phone,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
