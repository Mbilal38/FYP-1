import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vortax-edcba725ebd5.herokuapp.com'
  : 'http://localhost:5000';

// Fetch all movies
export const fetchMovies = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/movies`);
  return response.data;
};

// Fetch all TV shows
export const fetchTVShows = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/tvshows`);
  return response.data;
};

// Fetch recommendations
export const fetchRecommendations = async ({ type, query }) => {
  return fetch(`${API_BASE_URL}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, type }),
  });
};

// Fetch user recommendations
export const fetchUserRecommendations = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/api/user-recommendations`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    throw error;
  }
};