const Movie = require('../models/Movie');
const TVShow = require('../models/TVShow');

exports.searchContent = async (req, res) => {
  const { q, type } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    const searchRegex = new RegExp(q, 'i');
    let results = [];

    if (type === 'movies' || type === 'all') {
      const movies = await Movie.find({ title: { $regex: searchRegex } })
        .select('title thumbnail _id')
        .limit(5)
        .lean();

      const typedMovies = movies.map((m) => ({ ...m, type: 'movie' }));
      results = results.concat(typedMovies);
    }

    if (type === 'tvshows' || type === 'all') {
      const tvShows = await TVShow.find({ title: { $regex: searchRegex } })
        .select('title thumbnail _id')
        .limit(5)
        .lean();

      const typedShows = tvShows.map((s) => ({ ...s, type: 'tv' }));
      results = results.concat(typedShows);
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
