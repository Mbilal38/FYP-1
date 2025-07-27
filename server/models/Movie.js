// models/Movie.js - Fixed version

const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    genres: { type: [String], default: [], index: true }, // Indexed for faster queries
    cast: { type: [String], default: [] },
    isTrending: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    url: { type: String, required: true },
    videoUrl: { type: String },
    thumbnail: { type: String },
    type: { type: String, default: 'movie', enum: ['movie'], immutable: true },
  },
  { timestamps: true }
);
// Create compound index for efficient queries
MovieSchema.index({ genres: 1, createdAt: -1 });
MovieSchema.index({ isTrending: 1 });
MovieSchema.index({ isLatest: 1 });

module.exports = mongoose.model('Movie', MovieSchema);