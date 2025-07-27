import axios from 'axios';

class RecommendationEngine {
  constructor(userId) {
    this.userId = userId;
  }

  async getRecommendations(query) {
    try {
      const response = await axios.post('/api/recommendations', { 
        query,
        userId: this.userId
      });
      
      // Ensure we have at least some results
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        return response.data.recommendations;
      }
      
      // Fallback to default recommendations if no results
      const fallback = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY,
          sort_by: 'popularity.desc',
          page: 1
        }
      });
      
      return fallback.data.results.slice(0, 5).map(item => ({
        id: item.id,
        title: item.title,
        overview: item.overview,
        poster_path: item.poster_path,
        type: 'movie',
        source: 'tmdb'
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
}

export default RecommendationEngine;