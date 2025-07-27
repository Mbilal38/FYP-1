// /routes/watchlist.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
} = require('../controllers/watchlistController');

router.get('/', auth, getWatchlist);
router.post('/', auth, addToWatchlist);
router.delete('/:itemId', auth, removeFromWatchlist);  // Fixed: dynamic route param
router.delete('/clear/all', auth, clearWatchlist);     // Added: clear all

module.exports = router;
