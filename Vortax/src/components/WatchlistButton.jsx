import React, { useEffect, useState } from 'react';
import styles from './WatchlistButton.module.css';

const WatchlistButton = ({ item, isAuthenticated, watchlist = [], onAddToWatchlist, refreshWatchlist }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item && (item._id || item.itemId)) {
      // For authenticated users, watchlist items have itemId, for unauthenticated they have _id
      const itemId = item._id || item.itemId;
      setIsInWatchlist(
        watchlist.some(i => 
          (i._id === itemId) || 
          (i.itemId && i.itemId.toString() === itemId)
        )
      );
    }
  }, [watchlist, item]);

  if (!item || !item.title || !item.thumbnail) {
    console.error('❌ Error: Missing required item data:', item);
    return null;
  }

  const handleClick = async (e) => {
    e.stopPropagation();

    if (isInWatchlist) {
      console.warn('⚠️ Item already in watchlist.');
      return;
    }

    const payload = {
      _id: item._id,
      title: item.title,
      thumbnail: item.thumbnail,
      type: item?.type?.toLowerCase?.() || (Array.isArray(item.seasons) && item.seasons.length > 0 ? 'tvshow' : 'movie'),
    };

    console.log('Adding to watchlist:', payload);

    try {
      // For unauthenticated users, we call onAddToWatchlist which handles localStorage
      // For authenticated users, we call onAddToWatchlist which makes API request
      onAddToWatchlist(payload);
      setIsInWatchlist(true);
    } catch (error) {
      console.error('❌ Error adding to watchlist:', error.message);
      setError(error.message);
    }
  };

  return (
    <div>
      {!isInWatchlist && (
        <button className={styles.addButton} onClick={handleClick}>
          Add to Watchlist
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default WatchlistButton;