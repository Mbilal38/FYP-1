// server/routes/search.js

const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController');

// GET /api/search?q=...&type=all|movies|tvshows
router.get('/', searchContent);

module.exports = router;
