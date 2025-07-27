import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WatchlistItem.module.css';

const WatchlistItem = ({ item, onRemoveFromWatchlist }) => {
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFromWatchlist(item);
  };

  // For authenticated users, item has itemId, for unauthenticated it has _id
  const itemId = item._id || item.itemId;
  const detailLink = `/${item.type || (item.seasons ? 'tvshow' : 'movie')}/${itemId}`;

  return (
    <Link to={detailLink} className={styles.linkWrapper}>
      <div className={styles.watchlistItem}>
        <img src={item.thumbnail} alt={item.title} className={styles.thumbnail} />
        <div className={styles.info}>
          <h3>{item.title}</h3>
          <button className={styles.removeButton} onClick={handleRemove}>
            Remove from Watchlist
          </button>
        </div>
      </div>
    </Link>
  );
};

export default WatchlistItem;