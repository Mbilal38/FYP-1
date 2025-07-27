const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const TVShow = require('../models/TVShow');

// Add item to watchlist
const addToWatchlist = async (req, res) => {
  const { itemId, type } = req.body;
  const userId = req.user?.id;

  console.log('Received watchlist add request for user:', userId, 'item:', itemId, type);

  if (!itemId || !type) {
    return res.status(400).json({ message: 'Item ID and type are required' });
  }
  if (!['movie', 'tvshow'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type: must be "movie" or "tvshow"' });
  }
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    // For authenticated users
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const model = type === 'movie' ? Movie : TVShow;
      const itemExists = await model.findById(itemId);
      if (!itemExists) {
        return res.status(404).json({ message: `${type} not found` });
      }

      const alreadyExists = user.watchlist.some(
        (item) => item.itemId.toString() === itemId && item.type === type
      );

      if (alreadyExists) {
        return res.status(400).json({ message: 'Item already in watchlist' });
      }

      user.watchlist.push({ itemId, type });
      await user.save();
      return res.status(200).json({ message: 'Item added to watchlist', item: { itemId, type } });
    }
    
    // For unauthenticated users
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const alreadyExists = watchlist.some(
      (item) => item.itemId === itemId && item.type === type
    );

    if (alreadyExists) {
      return res.status(400).json({ message: 'Item already in watchlist' });
    }

    watchlist.push({ itemId, type });
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    return res.status(200).json({ message: 'Item added to watchlist', item: { itemId, type } });
    
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: `Failed to add to watchlist: ${error.message}` });
  }
};

// Get watchlist
const getWatchlist = async (req, res) => {
  const userId = req.user?.id;

  console.log('Fetching watchlist for user:', userId);

  try {
    // For authenticated users
    if (userId) {
      const user = await User.findById(userId).select('watchlist');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const detailedWatchlist = await Promise.all(
        user.watchlist.map(async (entry) => {
          const model = entry.type === 'movie' ? Movie : TVShow;
          const item = await model.findById(entry.itemId).select('title thumbnail');
          return {
            _id: entry.itemId,
            type: entry.type,
            title: item?.title || 'Unknown',
            thumbnail: item?.thumbnail || '',
          };
        })
      );

      return res.status(200).json(detailedWatchlist);
    }
    
    // For unauthenticated users
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const detailedWatchlist = await Promise.all(
      watchlist.map(async (entry) => {
        const model = entry.type === 'movie' ? Movie : TVShow;
        const item = await model.findById(entry.itemId).select('title thumbnail');
        return {
          _id: entry.itemId,
          type: entry.type,
          title: item?.title || 'Unknown',
          thumbnail: item?.thumbnail || '',
        };
      })
    );

    return res.status(200).json(detailedWatchlist);
    
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: `Failed to fetch watchlist: ${error.message}` });
  }
};

// Remove item from watchlist
const removeFromWatchlist = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?.id;

  console.log('Removing from watchlist for user:', userId, 'item ID:', itemId);

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    // For authenticated users
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.watchlist = user.watchlist.filter(
        (item) => item.itemId.toString() !== itemId
      );
      await user.save();
      return res.status(200).json({ message: 'Item removed from watchlist' });
    }
    
    // For unauthenticated users
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const newWatchlist = watchlist.filter(item => item.itemId !== itemId);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
    return res.status(200).json({ message: 'Item removed from watchlist' });
    
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: `Failed to remove from watchlist: ${error.message}` });
  }
};

// Clear watchlist
const clearWatchlist = async (req, res) => {
  const userId = req.user?.id;

  console.log('Clearing watchlist for user:', userId);

  try {
    // For authenticated users
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.watchlist = [];
      await user.save();
      return res.status(200).json({ message: 'Watchlist cleared' });
    }
    
    // For unauthenticated users
    localStorage.setItem('watchlist', JSON.stringify([]));
    return res.status(200).json({ message: 'Watchlist cleared' });
    
  } catch (error) {
    console.error('Error clearing watchlist:', error);
    res.status(500).json({ message: `Failed to clear watchlist: ${error.message}` });
  }
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  clearWatchlist,
};