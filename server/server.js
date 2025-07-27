const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const userRecommendationsRoutes = require('./routes/user-recommendations');
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/movies', require('./routes/movies'));
app.use('/api/tvshows', require('./routes/tvshows'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/watch-history', require('./routes/watch-history'));
app.use('/api/search', require('./routes/search'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/user-recommendations', userRecommendationsRoutes);

// Test Route
app.get('/', (req, res) => res.send('Vortax OTT API Running'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));