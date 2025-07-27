// src/components/TVShowCard.jsx
import React from 'react';
import styles from './TVShowCard.module.css';
import { Link } from 'react-router-dom';

const TVShowCard = ({ show }) => {
  return (
    <Link to={`/tvshow/${show._id}`} className={styles.tvShowCard}>
      <img src={show.thumbnail} alt={show.title} className={styles.thumbnail} />
      <h3 className={styles.title}>{show.title}</h3>
    </Link>
  );
};

export default TVShowCard;
