import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Watchlist from './pages/Watchlist';
import More from './pages/More';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MovieDetails from './components/MovieDetails';
import TVShowDetails from './components/TVShowDetails';
import Video from './pages/Video';
import SplashScreen from './components/SplashScreen';

const App = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(
    isAuthenticated ? { 
      _id: localStorage.getItem('userId'),
      token: localStorage.getItem('token')
    } : null
  );
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const fetchWatchlist = async () => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/watchlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch watchlist.');
        const data = await response.json();
        setWatchlist(data || []);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    } else {
      const storedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
      setWatchlist(storedWatchlist);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isAuthenticated]);

  const addToWatchlist = async (item) => {
    if (!item || !item._id) {
      console.error('Invalid item data:', item);
      return;
    }
    
    const contentType = item.type || (item.seasons ? 'tvshow' : 'movie');
    
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemId: item._id, type: contentType }),
        });
        if (!response.ok) throw new Error('Failed to add to watchlist.');
        await fetchWatchlist();
      } catch (error) {
        console.error('Error adding to watchlist:', error);
      }
    } else {
      const storedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
      const exists = storedWatchlist.some(i => i._id === item._id);
      
      if (!exists) {
        const updatedWatchlist = [
          ...storedWatchlist, 
          { 
            _id: item._id, 
            title: item.title, 
            thumbnail: item.thumbnail, 
            type: contentType 
          }
        ];
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        setWatchlist(updatedWatchlist);
      }
    }
  };

  const removeFromWatchlist = async (item) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/watchlist/${item._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: item.type }),
        });
        if (!response.ok) throw new Error('Failed to remove from backend watchlist');
        await fetchWatchlist();
      } catch (error) {
        console.error('Error removing from watchlist:', error);
      }
    } else {
      const storedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
      const updatedWatchlist = storedWatchlist.filter(i => i._id !== item._id);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setWatchlist(updatedWatchlist);
    }
  };

  const recordWatchHistory = async (item) => {
    if (!isAuthenticated || !item?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          itemId: item._id, 
          type: item.type || (item.seasons ? 'tvshow' : 'movie')
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record watch history');
      }
    } catch (error) {
      console.error('Error recording watch history:', error);
    }
  };

  return (
    <div className="app-container">
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <>
          <Navbar
            isAuthenticated={isAuthenticated}
            onLogout={() => {
              setIsAuthenticated(false);
              setUser(null);
              setWatchlist([]);
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('watchlist');
              navigate('/');
            }}
          />
          <main className="content">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    onAddToWatchlist={addToWatchlist} 
                    watchlist={watchlist} 
                    user={user}
                  />
                } 
              />
              <Route 
                path="/movies" 
                element={
                  <Movies 
                    onAddToWatchlist={addToWatchlist} 
                    watchlist={watchlist} 
                  />
                } 
              />
              <Route 
                path="/tvshows" 
                element={
                  <TVShows 
                    onAddToWatchlist={addToWatchlist} 
                    watchlist={watchlist} 
                  />
                } 
              />
              <Route
                path="/watchlist"
                element={
                  <Watchlist
                    watchlist={watchlist}
                    onRemoveFromWatchlist={removeFromWatchlist}
                    refreshWatchlist={fetchWatchlist}
                  />
                }
              />
              <Route path="/more" element={<More />} />
              <Route
                path="/login"
                element={
                  <LoginPage
                    onLoginSuccess={(token, userId) => {
                      setIsAuthenticated(true);
                      localStorage.setItem('token', token);
                      localStorage.setItem('userId', userId);
                      setUser({ _id: userId, token });
                      fetchWatchlist();
                      navigate('/');
                    }}
                  />
                }
              />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/movie/:id"
                element={
                  <MovieDetails
                    watchlist={watchlist}
                    onAddToWatchlist={addToWatchlist}
                    isAuthenticated={isAuthenticated}
                    refreshWatchlist={fetchWatchlist}
                  />
                }
              />
              <Route
                path="/tvshow/:id"
                element={
                  <TVShowDetails
                    watchlist={watchlist}
                    onAddToWatchlist={addToWatchlist}
                    isAuthenticated={isAuthenticated}
                    refreshWatchlist={fetchWatchlist}
                  />
                }
              />
              <Route 
                path="/video/:id" 
                element={
                  <Video 
                    recordWatchHistory={recordWatchHistory} 
                  />
                } 
              />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;