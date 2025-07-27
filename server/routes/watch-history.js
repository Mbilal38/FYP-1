const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addToWatchHistory, getWatchHistory, removeFromWatchHistory, clearWatchHistory } = require('../controllers/watchHistoryController');

// Add item to watch history
router.post('/', authMiddleware, async (req, res) => {
  const { itemId, type } = req.body;

  // Validate input
  if (!itemId || !type) {
    return res.status(400).json({ message: 'Item ID and type are required' });
  }
  if (!['movie', 'tvshow'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type: must be "movie" or "tvshow"' });
  }

  try {
    await addToWatchHistory(req, res);
  } catch (error) {
    console.error('Error in POST /watch-history:', error.message);
    res.status(500).json({ message: `Failed to add to watch history: ${error.message}` });
  }
});

// Get watch history
router.get('/', authMiddleware, async (req, res) => {
  try {
    await getWatchHistory(req, res);
  } catch (error) {
    console.error('Error in GET /watch-history:', error.message);
    res.status(500).json({ message: `Failed to fetch watch history: ${error.message}` });
  }
});

// Remove item from watch history
router.delete('/:itemId', authMiddleware, async (req, res) => {
  try {
    await removeFromWatchHistory(req, res);
  } catch (error) {
    console.error('Error in DELETE /watch-history/:itemId:', error.message);
    res.status(500).json({ message: `Failed to remove from watch history: ${error.message}` });
  }
});

// Clear watch history
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await clearWatchHistory(req, res);
  } catch (error) {
    console.error('Error in DELETE /watch-history:', error.message);
    res.status(500).json({ message: `Failed to clear watch history: ${error.message}` });
  }
});

module.exports = router;