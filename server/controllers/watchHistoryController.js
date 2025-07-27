const User = require('../models/User');
const Movie = require('../models/Movie');
const TVShow = require('../models/TVShow');

// Add item to watch history
const addToWatchHistory = async (req, res) => {
  const { itemId, type } = req.body;
  const userId = req.user.id;

  if (!itemId || !type) {
    return res.status(400).json({ message: 'Item ID and type are required' });
  }
  if (!['movie', 'tvshow'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type: must be "movie" or "tvshow"' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAlreadyWatched = user.watchHistory.some(
      (item) => item.itemId.toString() === itemId && item.type === type
    );

    if (isAlreadyWatched) {
      return res.status(400).json({ message: 'Item already in watch history' });
    }

    user.watchHistory.push({ itemId, type, watchedAt: new Date() });
    await user.save();

    res.status(200).json({ message: 'Added to watch history' });
  } catch (error) {
    console.error('Error adding to watch history:', error.message);
    res.status(500).json({ message: `Failed to add to watch history: ${error.message}` });
  }
  console.log("✅ Received in backend:", req.body);
};



// Get watch history
const getWatchHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('watchHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const detailedHistory = await Promise.all(
      user.watchHistory.map(async (entry) => {
        const model = entry.type === 'movie' ? Movie : TVShow;
        const item = await model.findById(entry.itemId).select('title thumbnail');
        return {
          _id: entry.itemId,
          type: entry.type,
          title: item?.title || 'Unknown',
          thumbnail: item?.thumbnail || '',
          watchedAt: entry.watchedAt,
        };
      })
    );
    res.status(200).json(detailedHistory);
  } catch (error) {
    console.error('Error fetching watch history:', error.message);
    res.status(500).json({ message: `Failed to fetch watch history: ${error.message}` });
  }
};

// Remove item from watch history
const removeFromWatchHistory = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.watchHistory = user.watchHistory.filter(
      (item) => item.itemId.toString() !== itemId
    );
    await user.save();

    res.status(200).json({ message: 'Item removed from watch history' });
  } catch (error) {
    console.error('Error removing from watch history:', error.message);
    res.status(500).json({ message: `Failed to remove from watch history: ${error.message}` });
  }
};

// Clear watch history
const clearWatchHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.watchHistory = [];
    await user.save();

    res.status(200).json({ message: 'Watch history cleared' });
  } catch (error) {
    console.error('Error clearing watch history:', error.message);
    res.status(500).json({ message: `Failed to clear watch history: ${error.message}` });
  }
};

// Export all functions
module.exports = {
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
};