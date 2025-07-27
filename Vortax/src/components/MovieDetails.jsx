import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MovieDetails.module.css';
import WatchlistButton from '../components/WatchlistButton';

const MovieDetails = ({ watchlist, onAddToWatchlist, isAuthenticated, refreshWatchlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/movies/${id}`);
        if (!response.ok) throw new Error('Failed to fetch movie details.');
        const data = await response.json();
        console.log('Fetched movie data:', data);
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError(error.message);
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    if (movie) {
      const isInList = isAuthenticated 
        ? watchlist.some(item => item.itemId === movie._id)
        : watchlist.some(item => item._id === movie._id);
        
       setIsInWatchlist(isInList);
     }
   }, [watchlist, movie, isAuthenticated]);

   const handleAddToWatchlist = () => {
       onAddToWatchlist({
          ...movie,
         type: 'movie'
       });
       setIsInWatchlist(true);
   };

  const handleWatchNow = async () => {
    if (!movie || !movie.url) {
      console.error('Movie or URL is undefined:', movie);
      return;
    }
    if (isAuthenticated) {
      try {
        const response = await fetch('http://localhost:5000/api/watch-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ itemId: movie._id, type: 'movie' }),
        });
        if (!response.ok) throw new Error('Failed to add to watch history.');
      } catch (error) {
        console.error('Error adding to watch history:', error);
      }
    }
    console.log('Navigating to video with ID:', movie._id, 'URL:', movie.url);
    navigate(`/video/${movie._id}`, { state: { videoUrl: movie.url } });
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!movie) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={movie.thumbnail} alt={movie.title} className={styles.thumbnail} />
        <div className={styles.details}>
          <h1 className={styles.title}>{movie.title}</h1>
          <p className={styles.description}>{movie.description}</p>
          <div className={styles.genres}>
            <h3>Genres:</h3>
            <ul>
              {movie.genres.map((genre, index) => (
                <li key={index}>{genre}</li>
              ))}
            </ul>
          </div>
          <div className={styles.cast}>
            <h3>Cast:</h3>
            <div className={styles.castList}>
              {movie.cast.map((actor, index) => (
                <span key={index} className={styles.castItem}>{actor}</span>
              ))}
            </div>
          </div>
          <div className={styles.buttonsContainer}>
            {movie.url ? (
              <button className={styles.watchButton} onClick={handleWatchNow}>
                Watch Now
              </button>
            ) : (
              <button className={styles.watchButton} disabled>
                Watch Now (Unavailable)
              </button>
            )}
            {!isInWatchlist && movie._id && (
              <WatchlistButton
                item={{ _id: movie._id, title: movie.title, thumbnail: movie.thumbnail, type: 'movie' }}
                isAuthenticated={isAuthenticated}
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
                refreshWatchlist={refreshWatchlist}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;