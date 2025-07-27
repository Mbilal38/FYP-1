import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './More.module.css';

const More = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!isAuthenticated) {
        setError('Please log in to view watch history');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/watch-history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch watch history: ${text}`);
        }
        const data = await response.json();
        // Sort watchHistory by watchedAt in descending order (newest first)
        const sortedData = data.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
        setWatchHistory(sortedData);
      } catch (error) {
        setError(error.message);
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, [navigate, isAuthenticated]);

  const handleRemoveFromWatchHistory = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`http://localhost:5000/api/watch-history/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to remove item from watch history');
      setWatchHistory((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      setError(error.message);
      console.error('Remove from watch history error:', error);
    }
  };

  const handleClearWatchHistory = async () => {
    if (!isAuthenticated) return;
    if (!window.confirm('Are you sure you want to clear your watch history?')) return;
    try {
      const response = await fetch('http://localhost:5000/api/watch-history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to clear watch history');
      setWatchHistory([]);
    } catch (error) {
      setError(error.message);
      console.error('Clear watch history error:', error);
    }
  };

  return (
    <div className={styles.moreContainer}>
      <h1 className={styles.heading}>Watch History</h1>
      {isAuthenticated && watchHistory.length > 0 && (
        <button className={styles.clearButton} onClick={handleClearWatchHistory}>
          Clear Watch History
        </button>
      )}
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : watchHistory.length === 0 ? (
        <p className={styles.emptyMessage}>No items in watch history</p>
      ) : (
        <div className={styles.historyList}>
          {watchHistory.map((item) => (
            <div
              key={item._id}
              className={styles.historyItem}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/${item.type}/${item._id}`)}
              onKeyPress={(e) => e.key === 'Enter' && navigate(`/${item.type}/${item._id}`)}
              aria-label={`View ${item.title} ${item.type === 'movie' ? 'movie' : 'TV show'}`}
            >
              <div className={styles.thumbnailContainer}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className={styles.thumbnail}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.png'; // Fallback image
                    e.target.classList.add(styles.thumbnailPlaceholder);
                  }}
                />
              </div>
              <div className={styles.info}>
                <h3>{item.title}</h3>
                <p>{item.type === 'movie' ? 'Movie' : 'TV Show'}</p>
                <p>Watched on: {new Date(item.watchedAt).toLocaleDateString()}</p>
                {isAuthenticated && (
                  <button
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWatchHistory(item._id);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default More;