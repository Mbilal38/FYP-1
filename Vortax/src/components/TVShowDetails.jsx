import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TVShowDetails.module.css';
import WatchlistButton from './WatchlistButton';

const TVShowDetails = ({ watchlist, onAddToWatchlist, isAuthenticated, refreshWatchlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tvShow, setTVShow] = useState(null);
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTVShow = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tvshows/${id}`);
        if (!response.ok) throw new Error('Failed to fetch TV show details.');
        const data = await response.json();
        console.log('Fetched TV show data:', data);
        setTVShow(data);
      } catch (error) {
        console.error('Error fetching TV show:', error);
        setError(error.message);
      }
    };
    fetchTVShow();
  }, [id]);

  useEffect(() => {
    if (tvShow) {
      // For authenticated users, watchlist items have itemId, for unauthenticated they have _id
      const isInList = isAuthenticated 
        ? watchlist.some(item => item.itemId === tvShow._id)
        : watchlist.some(item => item._id === tvShow._id);
        
      setIsInWatchlist(isInList);
    }
  }, [watchlist, tvShow, isAuthenticated]);

  const handleAddToWatchlist = () => {
    onAddToWatchlist({
      ...tvShow,
      type: 'tvshow'
    });
    setIsInWatchlist(true);
  };

  const handleEpisodeClick = async (episode) => {
    if (!episode || !episode.url) {
      console.error('Episode or URL is undefined:', episode);
      return;
    }
    if (isAuthenticated) {
      try {
        const response = await fetch('http://localhost:5000/api/watch-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ itemId: tvShow._id, type: 'tvshow' }),
        });
        if (!response.ok) throw new Error('Failed to add to watch history.');
      } catch (error) {
        console.error('Error adding to watch history:', error);
      }
    }
    console.log('Navigating to video with ID:', episode._id, 'URL:', episode.url);
    navigate(`/video/${episode._id}`, { state: { videoUrl: episode.url } });
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!tvShow) {
    return <p>Loading...</p>;
  }

  const firstEpisode = tvShow.seasons[0]?.episodes[0];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={tvShow.thumbnail} alt={tvShow.title} className={styles.thumbnail} />
        <div className={styles.details}>
          <h1 className={styles.title}>{tvShow.title}</h1>
          <p className={styles.description}>{tvShow.description}</p>
          <div className={styles.genres}>
            <h3>Genres:</h3>
            <ul>
              {tvShow.genres.map((genre, index) => (
                <li key={index}>{genre}</li>
              ))}
            </ul>
          </div>
          {tvShow.cast && (
            <div className={styles.cast}>
              <h3>Cast:</h3>
              <div className={styles.castList}>
                {tvShow.cast.map((actor, index) => (
                  <span key={index} className={styles.castItem}>{actor}</span>
                ))}
              </div>
            </div>
          )}
          <div className={styles.buttonsContainer}>
            {firstEpisode && firstEpisode.url ? (
              <button
                className={styles.watchButton}
                onClick={() => handleEpisodeClick(firstEpisode)}
              >
                Watch Now
              </button>
            ) : (
              <button className={styles.watchButton} disabled>
                Watch Now (No episodes available)
              </button>
            )}
            {!isInWatchlist && tvShow._id && (
              <WatchlistButton
                item={{ _id: tvShow._id, title: tvShow.title, thumbnail: tvShow.thumbnail, type: 'tvshow' }}
                isAuthenticated={isAuthenticated}
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
                refreshWatchlist={refreshWatchlist}
              />
            )}
          </div>
        </div>
      </div>
      <div className={styles.seasons}>
        <h2>Seasons</h2>
        {tvShow.seasons.map((season) => (
          <div key={season.seasonNumber} className={styles.season}>
            <div className={styles.seasonHeader} onClick={() => setExpandedSeason(season.seasonNumber)}>
              <h3>Season {season.seasonNumber}</h3>
              <span>{expandedSeason === season.seasonNumber ? '-' : '+'}</span>
            </div>
            {expandedSeason === season.seasonNumber && (
              <div className={styles.episodes}>
                {season.episodes.map((episode) => (
                  <a
                    key={episode.episodeNumber}
                    className={styles.episodeButton}
                    onClick={() => handleEpisodeClick(episode)}
                    disabled={!episode.url}
                  >
                    Episode {episode.episodeNumber}: {episode.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVShowDetails;