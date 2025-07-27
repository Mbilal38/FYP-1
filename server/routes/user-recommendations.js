const express = require('express');
const router = express.Router();
const { getUserRecommendations } = require('../controllers/userRecommendationController');
const jwt = require('jsonwebtoken');

// Optional authentication for recommendations
router.get('/', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignore invalid token
    }
  }
  next();
}, getUserRecommendations);

module.exports = router;