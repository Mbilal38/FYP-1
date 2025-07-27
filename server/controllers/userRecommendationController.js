const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const TVShow = require('../models/TVShow');
const User = require('../models/User');

const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    // This endpoint is now only for logged-in users
    // If no user ID, return error instead of fallback content
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User recommendations are only available for logged-in users' 
      });
    }

    let recommendedMovies = [];
    let recommendedTVShows = [];
    const sectionTitle = "Recommendations"; // Fixed title for all logged-in users

    // Find user with populated watchlist and watch history
    const user = await User.findById(userId)
      .populate({
        path: 'watchlist.itemId',
        select: 'genres type title',
        options: { lean: true }
      })
      .populate({
        path: 'watchHistory.itemId',
        select: 'genres type title',
        options: { lean: true }
      })
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasWatchHistory = user.watchHistory?.length > 0;
    const hasWatchlist = user.watchlist?.length > 0;

    // For logged-in users with no history: recent content (not random anymore)
    if (!hasWatchHistory && !hasWatchlist) {
      // Show recent content as starting recommendations
      recommendedMovies = await Movie.find().sort({ createdAt: -1 }).limit(8).lean();
      recommendedTVShows = await TVShow.find().sort({ createdAt: -1 }).limit(8).lean();
      
      // Add some variety by shuffling recent content
      recommendedMovies = recommendedMovies
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      recommendedTVShows = recommendedTVShows
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
        
      return res.json({ 
        movies: recommendedMovies, 
        tvShows: recommendedTVShows,
        sectionTitle
      });
    }

    // Extract genres and watched item IDs from both watchlist and watch history
    const genreFrequency = new Map();
    const watchedIds = new Set();

    const processItem = (item) => {
      if (item?.itemId) {
        // Add to watched IDs
        watchedIds.add(item.itemId._id.toString());
        
        // Process genres
        if (item.itemId.genres && Array.isArray(item.itemId.genres)) {
          item.itemId.genres.forEach(genre => {
            genreFrequency.set(genre, (genreFrequency.get(genre) || 0) + 1);
          });
        }
      }
    };

    // Process both watchlist and watch history
    if (Array.isArray(user.watchlist)) {
      user.watchlist.forEach(processItem);
    }
    if (Array.isArray(user.watchHistory)) {
      user.watchHistory.forEach(processItem);
    }

    // Get top 3 genres by frequency
    const topGenres = [...genreFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    // Convert watchedIds to proper ObjectIds for MongoDB queries
    const watchedObjectIds = [...watchedIds]
      .map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (error) {
          return null;
        }
      })
      .filter(id => id !== null);

    // Get genre-based recommendations with enhanced randomization
    if (topGenres.length > 0 && watchedObjectIds.length > 0) {
      try {
        // Get more movies than needed and randomly select for variety
        const genreMovies = await Movie.find({ 
          genres: { $in: topGenres },
          _id: { $nin: watchedObjectIds }
        }).lean();
        
        const genreTVShows = await TVShow.find({ 
          genres: { $in: topGenres },
          _id: { $nin: watchedObjectIds }
        }).lean();
        
        // Randomly shuffle and select 4
        recommendedMovies = genreMovies
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
          
        recommendedTVShows = genreTVShows
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
          
      } catch (error) {
        console.error('Genre-based recommendation error:', error);
        
        // Fallback to basic queries
        recommendedMovies = await Movie.find({
          genres: { $in: topGenres },
          _id: { $nin: watchedObjectIds }
        }).limit(8).lean();
        
        recommendedTVShows = await TVShow.find({
          genres: { $in: topGenres },
          _id: { $nin: watchedObjectIds }
        }).limit(8).lean();
        
        // Shuffle the results
        recommendedMovies = recommendedMovies
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        recommendedTVShows = recommendedTVShows
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
      }
    } else if (topGenres.length > 0) {
      // User has genres but no valid watched IDs - recommend by genres only
      const genreMovies = await Movie.find({
        genres: { $in: topGenres }
      }).lean();
      
      const genreTVShows = await TVShow.find({
        genres: { $in: topGenres }
      }).lean();
      
      recommendedMovies = genreMovies
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      recommendedTVShows = genreTVShows
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    }

    // Fill missing recommendations with randomized recent content
    const movieLimit = 4 - recommendedMovies.length;
    const tvShowLimit = 4 - recommendedTVShows.length;

    if (movieLimit > 0) {
      const additionalMoviesQuery = watchedObjectIds.length > 0
        ? { _id: { $nin: watchedObjectIds } }
        : {};
        
      const additionalMovies = await Movie.find(additionalMoviesQuery)
        .limit(movieLimit * 3) // Get more to have variety
        .lean();
        
      const randomizedAdditional = additionalMovies
        .sort(() => 0.5 - Math.random())
        .slice(0, movieLimit);
          
      recommendedMovies = [...recommendedMovies, ...randomizedAdditional];
    }

    if (tvShowLimit > 0) {
      const additionalTVShowsQuery = watchedObjectIds.length > 0
        ? { _id: { $nin: watchedObjectIds } }
        : {};
        
      const additionalTVShows = await TVShow.find(additionalTVShowsQuery)
        .limit(tvShowLimit * 3) // Get more to have variety
        .lean();
        
      const randomizedAdditional = additionalTVShows
        .sort(() => 0.5 - Math.random())
        .slice(0, tvShowLimit);
          
      recommendedTVShows = [...recommendedTVShows, ...randomizedAdditional];
    }

    // Final shuffle to ensure different order each time
    const finalMovies = recommendedMovies
      .slice(0, 4)
      .sort(() => 0.5 - Math.random());
      
    const finalTVShows = recommendedTVShows
      .slice(0, 4)
      .sort(() => 0.5 - Math.random());

    res.json({
      movies: finalMovies,
      tvShows: finalTVShows,
      sectionTitle,
      timestamp: Date.now() // Add timestamp to ensure cache busting
    });

  } catch (error) {
    console.error('User recommendation error:', error);
    
    // Fallback response with randomization
    try {
      const fallbackMovies = await Movie.find()
        .limit(12)
        .lean();
      const fallbackTVShows = await TVShow.find()
        .limit(12)
        .lean();
      
      const randomMovies = fallbackMovies
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      const randomTVShows = fallbackTVShows
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
        
      res.json({
        movies: randomMovies,
        tvShows: randomTVShows,
        sectionTitle: "Recommendations", // Keep consistent title
        timestamp: Date.now()
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      res.status(500).json({ 
        error: 'Failed to generate recommendations',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

module.exports = {
  getUserRecommendations
};