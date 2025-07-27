// src/components/MovieCard.jsx
import React from 'react';
import styles from './MovieCard.module.css';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movie/${movie._id}`} className={styles.movieCard}>
      <img src={movie.thumbnail} alt={movie.title} className={styles.thumbnail} />
      <h3 className={styles.title}>{movie.title}</h3>
    </Link>
  );
};

export default MovieCard;