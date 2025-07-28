import axios from 'axios';

const API_URL = "https://vortax.herokuapp.com/api";  // Heroku backend URL

// Fetch all movies
export const fetchMovies = async () => {
  const response = await axios.get(`${API_BASE_URL}/movies`);
  return response.data;
};

// Fetch all TV shows
export const fetchTVShows = async () => {
  const response = await axios.get(`${API_BASE_URL}/tvshows`);
  return response.data;
};
//fetch recommendations
export const fetchRecommendations = async ({ type, query }) => {
  return fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, type }),
  });
};
// User Recommendation
// Add to existing API functions
export const fetchUserRecommendations = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get('/api/user-recommendations', config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    throw error;
  }
};
