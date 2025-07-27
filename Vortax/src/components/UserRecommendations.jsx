import React, { useState, useEffect, useCallback } from 'react';
import styles from './UserRecommendations.module.css';
import { fetchUserRecommendations } from '../api/api';
import MovieCard from './MovieCard';
import TVShowCard from './TVShowCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const UserRecommendations = ({ user, watchlist, onAddToWatchlist }) => {
  // Early return if user is not logged in - don't render anything
  if (!user || !user.token) {
    return null;
  }

  const [recommendations, setRecommendations] = useState({ 
    movies: [], 
    tvShows: [],
    sectionTitle: "Recommendations" // Fixed title for logged-in users
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Add key to force refresh

  const loadRecommendations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      // Add timestamp to API call to ensure fresh data
      const data = await fetchUserRecommendations(user?.token, { 
        refresh: Date.now(),
        key: refreshKey 
      });
      setRecommendations(data);
    } catch (err) {
      console.error('Recommendation load failed:', err);
      
      
      // Fallback to latest content with random offset for variety
      try {
        const randomOffset = Math.floor(Math.random() * 10); // Random offset for variety
        
        const moviesRes = await fetch(`/api/movies?offset=${randomOffset}&limit=8`);
        const moviesData = await moviesRes.json();
        const tvShowsRes = await fetch(`/api/tvshows?offset=${randomOffset}&limit=8`);
        const tvShowsData = await tvShowsRes.json();
        
        // Randomly select 4 from the 8 returned
        const shuffledMovies = moviesData.sort(() => 0.5 - Math.random()).slice(0, 4);
        const shuffledTVShows = tvShowsData.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        setRecommendations({
          movies: shuffledMovies,
          tvShows: shuffledTVShows,
          sectionTitle: "Recommendations" // Keep consistent title
        });
      } catch (fallbackError) {
        console.error('Fallback data loading failed:', fallbackError);
        setError('Unable to load recommendations at this time.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshKey]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); // Update key to trigger fresh data
    loadRecommendations(true);
  };

  // Create mixed array of movies and TV shows (alternating)
  const createMixedRecommendations = () => {
    const mixed = [];
    const maxLength = Math.max(recommendations.movies.length, recommendations.tvShows.length);
    
    for (let i = 0; i < maxLength; i++) {
      // Add movie if available
      if (i < recommendations.movies.length) {
        mixed.push({
          ...recommendations.movies[i],
          type: 'movie',
          id: `movie-${recommendations.movies[i]._id}`
        });
      }
      
      // Add TV show if available
      if (i < recommendations.tvShows.length) {
        mixed.push({
          ...recommendations.tvShows[i],
          type: 'tvshow',
          id: `tvshow-${recommendations.tvShows[i]._id}`
        });
      }
    }
    
    return mixed;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  const mixedRecommendations = createMixedRecommendations();

  if (mixedRecommendations.length === 0) {
    return (
      <section className={styles.recommendationSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recommendations</h2>
          <button 
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={refreshing}
            title="Get fresh recommendations"
          >
            {refreshing ? '🔄' : '↻'}
          </button>
        </div>
        <div className={styles.noContent}>
          <p>No recommendations available at the moment.</p>
          <p className={styles.noContentSubtext}>
            Start watching movies and shows to get personalized recommendations!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.recommendationSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recommendations</h2>
        <button 
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={refreshing}
          title="Get fresh recommendations"
        >
          {refreshing ? '🔄' : '↻'}
        </button>
      </div>
      
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.mixedContent}>
        <Swiper
          key={refreshKey} // Force Swiper to re-render with new content
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={15}
          navigation
          className={styles.swiper}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            576: { slidesPerView: 3, spaceBetween: 12 },
            768: { slidesPerView: 4, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 15 },
            1200: { slidesPerView: 6, spaceBetween: 15 },
          }}
        >
          {mixedRecommendations.map((item) => (
            <SwiperSlide key={item.id} className={styles.swiperSlide}>
              {item.type === 'movie' ? (
                <MovieCard
                  movie={item}
                  watchlist={watchlist}
                  onAddToWatchlist={onAddToWatchlist}
                />
              ) : (
                <TVShowCard
                  show={item}
                  watchlist={watchlist}
                  onAddToWatchlist={onAddToWatchlist}
                />
              )}
              <div className={styles.typeIndicator}>
                {item.type === 'movie' ? '🎬' : '📺'}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default UserRecommendations;