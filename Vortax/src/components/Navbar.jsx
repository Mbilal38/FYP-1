import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && <div className={styles.backdrop} onClick={handleCloseMenu}></div>}
      <nav className={styles.navbar}>
        <h1 className={styles.logo}>VORTAX</h1>

        <button className={styles.menuButton} onClick={handleToggleMenu}>
          ☰
        </button>

        <div className={`${styles.sideMenu} ${menuOpen ? styles.showMenu : ''}`}>
          <button className={styles.closeButton} onClick={handleToggleMenu}>
            ✖
          </button>
          <ul className={styles.navLinks}>
            <li><Link to="/" onClick={handleCloseMenu}>Home</Link></li>
            <li><Link to="/movies" onClick={handleCloseMenu}>Movies</Link></li>
            <li><Link to="/tvshows" onClick={handleCloseMenu}>Tv Shows</Link></li>
            <li><Link to="/watchlist" onClick={handleCloseMenu}>Watch List</Link></li>
            <li><Link to="/more" onClick={handleCloseMenu}>More</Link></li>

            {isAuthenticated ? (
              <li>
                <button onClick={() => { handleCloseMenu(); onLogout(); }} className={styles.logoutButton}>
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li><Link to="/login" onClick={handleCloseMenu}>Login</Link></li>
                <li><Link to="/signup" onClick={handleCloseMenu}>Signup</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
