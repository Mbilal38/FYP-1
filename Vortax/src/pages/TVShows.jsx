import React, { useState, useEffect } from 'react';
import TVShowCard from '../components/TVShowCard';
import SearchBar from '../components/SearchBar';
import { fetchTVShows } from '../api/api';
import styles from './TVShows.module.css';

const TVShows = ({ watchlist = [], onAddToWatchlist }) => {
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const loadTVShows = async () => {
      try {
        setLoading(true);
        const tvShowsData = await fetchTVShows();
        setTVShows(tvShowsData);
      } catch (error) {
        console.error('Error loading TV shows:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTVShows();
  }, []);

  const handleSearch = (query) => {
    const results = tvShows.filter((tvShow) =>
      tvShow.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResults(results);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const displayContent = filteredResults.length > 0 ? filteredResults : tvShows;

  return (
    <div className={styles.tvShowsPage}>
      <h1>TV Shows</h1>
      <SearchBar
        type="tvshows"
        placeholder="Search TV shows..."
        onSearch={handleSearch}
      />
      <div className={styles.cardsContainer}>
        {displayContent.map((show) => (
          <TVShowCard
            key={show._id}
            show={show}
            watchlist={watchlist}
            onAddToWatchlist={onAddToWatchlist}
          />
        ))}
      </div>
    </div>
  );
};

export default TVShows;
