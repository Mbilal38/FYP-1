// /routes/tvshows.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const tvShowController = require('../controllers/tvShowController');

// Helper function
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Routes
router.get('/', tvShowController.getAllTVShows);

router.get('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid TV Show ID' });
  }

  return tvShowController.getTVShowById(req, res);
});

router.post('/', tvShowController.addTVShow);

router.put('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid TV Show ID' });
  }

  return tvShowController.updateTVShow(req, res);
});

router.delete('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid TV Show ID' });
  }

  return tvShowController.deleteTVShow(req, res);
});

module.exports = router;
