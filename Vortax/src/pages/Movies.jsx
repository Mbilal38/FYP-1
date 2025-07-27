import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { fetchMovies } from '../api/api';
import styles from './Movies.module.css';

const Movies = ({ watchlist = [], onAddToWatchlist }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const moviesData = await fetchMovies();
        // Ensure sorting in frontend (optional, double-checking)
        const sortedMovies = moviesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);
 
  
  const handleSearch = (query) => {
    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResults(results);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const displayContent = filteredResults.length > 0 ? filteredResults : movies;

  return (
    <div className={styles.moviesPage}>
      <h1>Movies</h1>
      <SearchBar
        type="movies"
        placeholder="Search movies..."
        onSearch={handleSearch}
      />
      <div className={styles.cardsContainer}>
        {displayContent.map((movie) => (
          <MovieCard
            key={movie._id}
            movie={movie}
            watchlist={watchlist}
            onAddToWatchlist={onAddToWatchlist}
          />
        ))}
      </div>
    </div>
  );
};

export default Movies;
