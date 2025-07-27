const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
  },
  username: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple users without Google ID
  },
  watchlist: {
    type: [
      {
        itemId: { type: String, required: true },
        type: { type: String, enum: ['movie', 'tvshow'], required: true },
      },
    ],
    default: [],
  },
  watchHistory: {
    type: [
      {
        itemId: { type: String, required: true },
        type: { type: String, enum: ['movie', 'tvshow'], required: true },
        watchedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);