// models/TVShow.js - Fixed version

const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
  episodeNumber: Number,
  title: String,
  url: { type: String, required: true },
});

const SeasonSchema = new mongoose.Schema({
  seasonNumber: Number,
  episodes: [EpisodeSchema],
});

const TVShowSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    genres: { type: [String], default: [], index: true }, // Indexed for faster queries
    isTrending: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    url: { type: String, required: true },
    thumbnail: { type: String },
    seasons: [SeasonSchema],
    cast: [String],
    type: { type: String, default: 'tvshow', enum: ['tvshow'], immutable: true },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
TVShowSchema.index({ genres: 1, createdAt: -1 });
TVShowSchema.index({ isTrending: 1 });
TVShowSchema.index({ isLatest: 1 });

module.exports = mongoose.model('TVShow', TVShowSchema);