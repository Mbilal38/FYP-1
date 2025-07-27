const TVShow = require('../models/TVShow');

// Get all TV shows
exports.getAllTVShows = async (req, res) => {
  try {
    const tvShows = await TVShow.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(tvShows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single TV show by ID
exports.getTVShowById = async (req, res) => {
  try {
    const tvShow = await TVShow.findById(req.params.id);
    if (!tvShow) return res.status(404).json({ msg: 'TV show not found' });
    res.json(tvShow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new TV show
exports.addTVShow = async (req, res) => {
  try {
    const newTVShow = new TVShow(req.body);
    const tvShow = await newTVShow.save();
    res.status(201).json(tvShow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a TV show by ID
exports.updateTVShow = async (req, res) => {
  try {
    const tvShow = await TVShow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!tvShow) return res.status(404).json({ msg: 'TV show not found' });
    res.json(tvShow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a TV show by ID
exports.deleteTVShow = async (req, res) => {
  try {
    const tvShow = await TVShow.findByIdAndDelete(req.params.id);
    if (!tvShow) return res.status(404).json({ msg: 'TV show not found' });
    res.json({ msg: 'TV show deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
