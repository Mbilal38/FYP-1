//Carousel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Carousel.module.css';
import { fetchMovies, fetchTVShows } from '../api/api';

const Carousel = () => {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const touchStartX = useRef(null);

   useEffect(() => {
    const loadData = async () => {
      try {
        const movies = await fetchMovies();
        const tvShows = await fetchTVShows();
        
        // Get last 5 movies (from bottom of the list)
        const lastMovies = movies.slice(-5);
        
        // Get first 5 TV shows (from top of the list)
        const topTVShows = tvShows.slice(0, 5);
        
        // Interleave movies and TV shows
        const popularItems = [];
        for (let i = 0; i < 5; i++) {
          popularItems.push(lastMovies[i]);
          popularItems.push(topTVShows[i]);
        }
        
        setItems(popularItems);
      } catch (error) {
        console.error("Error loading carousel data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [items]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const handleWatchNow = (item) => {
    if (item.seasons) {
      navigate(`/tvshow/${item._id}`);
    } else {
      navigate(`/movie/${item._id}`);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;

    if (deltaX > 50) {
      handleNext();
    } else if (deltaX < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className={styles.carousel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.carouselInner}>
        {items.map((item, index) => {
          const position =
            index === currentIndex
              ? 'center'
              : index === (currentIndex - 1 + items.length) % items.length
              ? 'left'
              : index === (currentIndex + 1) % items.length
              ? 'right'
              : 'hidden';

          return (
            <div
              key={index}
              className={`${styles.carouselItem} ${styles[position]}`}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className={styles.carouselImage}
              />
              <div className={styles.carouselContent}>
                <h2>{item.title}</h2>
                <button
                  className={styles.watchNowButton}
                  onClick={() => handleWatchNow(item)}
                >
                  Watch Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
