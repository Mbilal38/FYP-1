import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import { fetchMovies, fetchTVShows } from '../api/api';
import MovieCard from '../components/MovieCard';
import TVShowCard from '../components/TVShowCard';
import SearchBar from '../components/SearchBar';
import Carousel from '../components/Carousel';
import UserRecommendations from '../components/UserRecommendations';
import Chatbot from '../components/Chatbot';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Home = ({ watchlist = [], onAddToWatchlist, user }) => {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Log user prop for debugging
  console.log('Home: Received user prop:', user);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const moviesData = await fetchMovies();
        const sortedMovies = moviesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const tvShowsData = await fetchTVShows();
        setMovies(sortedMovies);
        setTVShows(tvShowsData);
      } catch (error) {
        console.error('Home: Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setSearchResults(null);
      setShowAll(false);
      return;
    }
    const results = [
      ...movies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      ),
      ...tvShows.filter((tvShow) =>
        tvShow.title.toLowerCase().includes(query.toLowerCase())
      ),
    ];
    setSearchResults(results);
    setShowAll(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  if (loading) {
    return <p className={styles.loading}>Loading...</p>;
  }

  return (
    <div className={styles.homeContainer}>
      <SearchBar
        type="all"
        placeholder="Search movies or TV shows..."
        onSearch={handleSearch}
      />
      <Carousel />

      {/* User Recommendations Section */}
      <UserRecommendations 
        watchlist={watchlist}
        onAddToWatchlist={onAddToWatchlist}
        user={user}
      />

      {searchResults && !showAll && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Search Results</h2>
          <div className={styles.cardsContainer}>
            {searchResults.slice(0, 5).map((item) =>
              item.type === 'movie' ? (
                <MovieCard
                  key={item._id}
                  movie={item}
                  watchlist={watchlist}
                  onAddToWatchlist={onAddToWatchlist}
                />
              ) : (
                <TVShowCard
                  key={item._id}
                  show={item}
                  watchlist={watchlist}
                  onAddToWatchlist={onAddToWatchlist}
                />
              )
            )}
          </div>
          {searchResults.length > 5 && (
            <button onClick={handleShowAll} className={styles.showAllButton}>
              Show All Results
            </button>
          )}
        </section>
      )}
      {showAll && searchResults && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>All Search Results</h2>
          <div className={styles.cardsContainer}>
            {searchResults.map((item) =>
              item.type === 'movie' ? (
                <MovieCard
                  key={item._id}
                  movie={item}
                  watchlist={watchlist}
                  onAddToWatchlist={onAddToWatchlist}
                />
              ) : (
                <TVShowCard
                  key={item._id}
                  show={item}
                  watchlist={watchlist}
                  onAddToWatchlist={onAddToWatchlist}
                />
              )
            )}
          </div>
        </section>
      )}
      {!searchResults && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Trending Movies</h2>
            <Swiper
              modules={[Navigation]}
              slidesPerView={5}
              spaceBetween={10}
              navigation
              className={styles.swiper}
              breakpoints={{
                320: { slidesPerView: 3 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {movies
                .filter((movie) => movie.isTrending)
                .map((movie) => (
                  <SwiperSlide key={movie._id} className={styles.swiperSlide}>
                    <MovieCard
                      movie={movie}
                      watchlist={watchlist}
                      onAddToWatchlist={onAddToWatchlist}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Trending TV Shows</h2>
            <Swiper
              modules={[Navigation]}
              slidesPerView={5}
              spaceBetween={10}
              navigation
              className={styles.swiper}
              breakpoints={{
                320: { slidesPerView: 3 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {tvShows
                .filter((show) => show.isTrending)
                .map((show) => (
                  <SwiperSlide key={show._id} className={styles.swiperSlide}>
                    <TVShowCard
                      show={show}
                      watchlist={watchlist}
                      onAddToWatchlist={onAddToWatchlist}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Latest Movies</h2>
            <Swiper
              modules={[Navigation]}
              slidesPerView={5}
              spaceBetween={10}
              navigation
              className={styles.swiper}
              breakpoints={{
                320: { slidesPerView: 3 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {movies
                .filter((movie) => movie.isLatest)
                .map((movie) => (
                  <SwiperSlide key={movie._id} className={styles.swiperSlide}>
                    <MovieCard
                      movie={movie}
                      watchlist={watchlist}
                      onAddToWatchlist={onAddToWatchlist}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Latest TV Shows</h2>
            <Swiper
              modules={[Navigation]}
              slidesPerView={5}
              spaceBetween={10}
              navigation
              className={styles.swiper}
              breakpoints={{
                320: { slidesPerView: 3 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {tvShows
                .filter((show) => show.isLatest)
                .map((show) => (
                  <SwiperSlide key={show._id} className={styles.swiperSlide}>
                    <TVShowCard
                      show={show}
                      watchlist={watchlist}
                      onAddToWatchlist={onAddToWatchlist}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
          </section>
        </>
      )}
      
      <div 
        className={`${styles.chatbotIcon} ${isChatbotOpen ? styles.open : ''}`}
        onClick={toggleChatbot}
        aria-label="Chat with assistant"
      >
        {isChatbotOpen ? (
          <span className={styles.closeIcon}>✕</span>
        ) : (
          <img 
            src="/assets/Vortax.jpg" 
            alt="Vortax Assistant" 
            className={styles.vortaxImage}
          />
        )}
      </div>
      
      {isChatbotOpen && <Chatbot userId={user?._id} />}
    </div>
  );
};

export default Home;