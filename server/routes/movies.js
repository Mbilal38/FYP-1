// /routes/movies.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Movie = require('../models/Movie');

// Helper function
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single movie by ID
router.get('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new movie
router.post('/', async (req, res) => {
  try {
    const { title, description, genres, cast, isTrending, isLatest, url, videoUrl, thumbnail } = req.body;

    if (!title || !description || !genres || !url) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const movie = new Movie({
      title,
      description,
      genres: genres || [],
      cast: cast || [],
      isTrending: isTrending || false,
      isLatest: isLatest || false,
      url,
      videoUrl: videoUrl || '',
      thumbnail: thumbnail || '',
    });

    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a movie by ID
router.put('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a movie by ID
router.delete('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
