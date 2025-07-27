import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SearchBar = ({ type = 'all', placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&type=${type}`
        );
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query, type]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleResultClick = (result) => {
    setShowDropdown(false);

    // Log the result to debug the type and structure
    console.log('Clicked result:', result);

    // Determine navigation path based on result type
    // Use /tvshow/:id to match the route defined in App.jsx for TV shows
    const path = result.type === 'tv' ? `/tvshow/${result._id}` : `/movie/${result._id}`;
    console.log('Navigating to:', path); // Debug the navigation path
    navigate(path);
  };

  const getTypeLabel = (type) => {
    return type === 'tv' ? 'TV' : 'Movie';
  };

  return (
    <div className={styles.searchBar} ref={dropdownRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        className={styles.searchInput}
      />
      {loading && <div className={styles.spinner}></div>}
      {showDropdown && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((result) => (
            <li
              key={result._id}
              onClick={() => handleResultClick(result)}
              className={styles.dropdownItem}
            >
              <img src={result.thumbnail} alt={result.title} className={styles.thumbnail} />
              <div className={styles.resultInfo}>
                <span className={styles.resultTitle}>{result.title}</span>
                <span className={styles.resultTag}>{getTypeLabel(result.type)}</span>
              </div>
            </li>
          ))}
          <li
            className={styles.showAllItem}
            onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`)}
          >
            Show All Results
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchBar;