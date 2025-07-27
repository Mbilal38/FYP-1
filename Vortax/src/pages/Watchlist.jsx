import React, { useEffect, useState } from 'react';
import WatchlistItem from '../components/WatchlistItem';
import styles from './Watchlist.module.css';

const Watchlist = ({ watchlist, onRemoveFromWatchlist, loading }) => {
  const [localWatchlist, setLocalWatchlist] = useState([]);

  useEffect(() => {
    console.log('Watchlist updated:', watchlist);
    // Reverse to show newest items first
    setLocalWatchlist([...watchlist].reverse());
  }, [watchlist]);

  const handleRemoveItem = async (item) => {
    try {
      // Call the parent's remove function
      await onRemoveFromWatchlist(item);
      
      // Update local state immediately for better UX
      setLocalWatchlist(prev => 
        prev.filter(watchlistItem => {
          const watchlistItemId = watchlistItem.itemId || watchlistItem._id;
          const itemId = item.itemId || item._id;
          return watchlistItemId !== itemId;
        })
      );
      
      console.log('Item removed from watchlist:', item);
    } catch (error) {
      console.error('Error removing from watchlist:', error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.watchlistPage}>
        <h1>Your Watchlist</h1>
        <div className={styles.loading}>Loading your watchlist...</div>
      </div>
    );
  }

  return (
    <div className={styles.watchlistPage}>
      <h1>Your Watchlist</h1>
      {localWatchlist.length === 0 ? (
        <div className={styles.emptyWatchlist}>
          <p>Your watchlist is empty.</p>
          <p>Start adding movies and TV shows to build your personal collection!</p>
        </div>
      ) : (
        <div className={styles.watchlistContainer}>
          {localWatchlist.map((item) => {
            // Create a unique key using both type and ID
            const uniqueKey = `${item.type || 'unknown'}-${item._id || item.itemId || Math.random()}`;
            
            return (
              <WatchlistItem
                key={uniqueKey}
                item={item}
                onRemoveFromWatchlist={() => handleRemoveItem(item)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;