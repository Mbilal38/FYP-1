const axios = require('axios');
const nlp = require('compromise');
const Movie = require('../models/Movie');
const TVShow = require('../models/TVShow');

// List of all direct genre names we recognize
const directGenres = [
  'action', 'adventure', 'animation', 'comedy', 'crime',
  'documentary', 'drama', 'family', 'fantasy', 'history',
  'horror', 'music', 'mystery', 'romance', 'science fiction',
  'thriller', 'war', 'western'
];

// Enhanced mood-to-genre mapping
const moodToGenres = {
  happy: ['comedy', 'family', 'animation', 'musical'],
  cheerful: ['comedy', 'family', 'animation'],
  sad: ['drama', 'romance'],
  melancholic: ['drama', 'romance'],
  depressing: ['drama'],
  exciting: ['action', 'adventure', 'thriller'],
  thrilled: ['thriller', 'action', 'mystery'],
  thrilling: ['thriller', 'action', 'suspense'],
  funny: ['comedy', 'parody'],
  hilarious: ['comedy'],
  humor: ['comedy'],
  humorous: ['comedy'],
  scary: ['horror', 'thriller'],
  frightening: ['horror'],
  terrifying: ['horror'],
  romantic: ['romance', 'drama'],
  love: ['romance'],
  mysterious: ['mystery', 'thriller', 'crime'],
  adventurous: ['adventure', 'action', 'fantasy'],
  fantasy: ['fantasy', 'adventure'],
  scifi: ['science fiction', 'action'],
  'sci-fi': ['science fiction'],
  sf: ['science fiction'],
  relaxed: ['drama', 'romance', 'documentary'],
  calm: ['drama', 'documentary'],
  energetic: ['action', 'adventure', 'sport'],
  thoughtful: ['drama', 'documentary', 'biography'],
  nostalgic: ['drama', 'history', 'family'],
  thriller: ['thriller'],
  suspense: ['thriller'],
  suspenseful: ['thriller'],
  'edge-of-your-seat': ['thriller'],
  animated: ['animation'],
  cartoon: ['animation'],
  anime: ['animation'],
  doc: ['documentary'],
  'non-fiction': ['documentary'],
  'real-life': ['documentary']
};

// Enhanced genre mapping with more comprehensive aliases
const genreAliases = {
  'action': ['action-packed', 'fight', 'battle', 'explosive'],
  'adventure': ['quest', 'journey', 'expedition'],
  'animation': ['animated', 'cartoon', 'anime'],
  'comedy': ['funny', 'humorous', 'humor', 'hilarious', 'laugh', 'satire'],
  'crime': ['gangster', 'mafia', 'heist', 'police'],
  'documentary': ['doc', 'non-fiction', 'real-life', 'biography', 'historical'],
  'drama': ['emotional', 'serious', 'melodrama'],
  'family': ['kids', 'children', 'child-friendly'],
  'fantasy': ['magic', 'mythical', 'fairy tale'],
  'history': ['historical', 'period piece'],
  'horror': ['scary', 'frightening', 'terrifying', 'ghost', 'haunted'],
  'music': ['musical', 'concert', 'rock', 'pop'],
  'mystery': ['whodunit', 'detective', 'crime solver'],
  'romance': ['romantic', 'love', 'relationship', 'dating'],
  'science fiction': ['scifi', 'sci-fi', 'sf', 'futuristic', 'space', 'alien'],
  'thriller': ['suspense', 'suspenseful', 'edge-of-your-seat', 'tense'],
  'war': ['military', 'soldier', 'battlefield'],
  'western': ['cowboy', 'frontier', 'wild west']
};

const tmdbGenreIds = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science fiction': 878,
  thriller: 53,
  war: 10752,
  western: 37
};

// Function to detect direct genre mentions in the query
const detectDirectGenre = (query) => {
  const queryLower = query.toLowerCase();
  
  // Check for direct genre mentions
  for (const genre of directGenres) {
    // Match whole words only to avoid false positives
    const regex = new RegExp(`\\b${genre}\\b`, 'i');
    if (regex.test(queryLower)) {
      return genre;
    }
  }
  
  return null;
};

// Enhanced term mapping with stemming and lemmatization
const mapTermsToGenres = (terms) => {
  const genres = new Set();
  
  terms.forEach(term => {
    term = term.toLowerCase().trim();
    
    // Check direct genre first
    if (directGenres.includes(term)) {
      genres.add(term);
      return;
    }
    
    // Check direct mood mapping
    if (moodToGenres[term]) {
      moodToGenres[term].forEach(g => genres.add(g));
      return;
    }
    
    // Check genre aliases
    for (const [genre, aliases] of Object.entries(genreAliases)) {
      if (aliases.includes(term) || term === genre) {
        genres.add(genre);
        return;
      }
    }
    
    // Check if it's a known genre
    if (Object.keys(tmdbGenreIds).includes(term)) {
      genres.add(term);
      return;
    }
    
    // Special handling for common variations
    if (term.startsWith('thrill')) genres.add('thriller');
    if (term.startsWith('funn')) genres.add('comedy');
    if (term.startsWith('horr')) genres.add('horror');
    if (term.startsWith('roman')) genres.add('romance');
    if (term.startsWith('actio')) genres.add('action');
    if (term.startsWith('advent')) genres.add('adventure');
  });
  
  return Array.from(genres);
};

// Enhanced query processing with better NLP
const processQuery = (query) => {
  // First check for direct genre mention
  const directGenre = detectDirectGenre(query);
  if (directGenre) {
    return { 
      terms: [directGenre], 
      negatedTerms: new Set() 
    };
  }

  const doc = nlp(query.toLowerCase());
  
  // Extract all meaningful words with better NLP processing
  const terms = [
    ...doc.nouns().toSingular().out('array'),
    ...doc.adjectives().out('array'),
    ...doc.verbs().toInfinitive().out('array')
  ].map(t => t.toLowerCase().trim())
   .filter(t => t.length > 2);
  
  // Add special handling for common patterns
  if (query.includes('make me laugh') || query.includes('cheer me up')) {
    terms.push('comedy', 'funny');
  }
  
  if (query.includes('scare me') || query.includes('frighten me')) {
    terms.push('horror', 'scary');
  }
  
  // Handle negation more robustly
  const negatedTerms = new Set();
  const negationWords = ['not', 'no', 'without', "don't", "doesn't"];
  
  negationWords.forEach(negWord => {
    if (query.includes(negWord)) {
      const negated = doc.match(`${negWord} #Adjective`).adjectives().out('array') || 
                     doc.match(`${negWord} #Noun`).nouns().out('array') || [];
      negated.forEach(t => negatedTerms.add(t.toLowerCase().trim()));
    }
  });
  
  return { terms, negatedTerms };
};

// Enhanced content type detection
const detectContentType = (query) => {
  const queryLower = query.toLowerCase();
  
  const movieTerms = ['movie', 'film', 'movies', 'films', 'cinema', 'feature'];
  const showTerms = ['show', 'tv', 'series', 'shows', 'episode', 'season'];
  
  const hasMovie = movieTerms.some(t => queryLower.includes(t));
  const hasShow = showTerms.some(t => queryLower.includes(t));
  
  if (hasMovie && !hasShow) return 'movie';
  if (hasShow && !hasMovie) return 'tv';
  if (hasMovie && hasShow) return null; // Ambiguous
  
  // Default to movie but can be changed based on your preference
  return 'movie';
};

// Enhanced TMDB API call with better error handling
const fetchFromTMDB = async (contentType, params) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/discover/${contentType}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        sort_by: 'popularity.desc',
        page: 1,
        ...params
      },
      timeout: 5000 // 5 second timeout
    });
    return response.data.results.slice(0, 5);
  } catch (error) {
    console.error('TMDB API error:', error.message);
    return [];
  }
};

// Enhanced local database query
const fetchFromLocalDB = async (Model, genres) => {
  try {
    const regexPatterns = genres.map(g => new RegExp(g, 'i'));
    return await Model.find({
      $or: [
        { genres: { $in: regexPatterns } },
        { title: { $regex: genres.join('|'), $options: 'i' } },
        { description: { $regex: genres.join('|'), $options: 'i' } }
      ]
    })
    .limit(5)
    .lean();
  } catch (error) {
    console.error('Local DB error:', error.message);
    return [];
  }
};

exports.getRecommendations = async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Please tell me what you\'re looking for!' });
  }

  try {
    // Detect content type
    const contentType = detectContentType(query);
    if (!contentType) {
      return res.status(400).json({ error: 'Do you want a movie or a TV show? Please specify one.' });
    }

    // Process query with enhanced NLP
    const { terms, negatedTerms } = processQuery(query);
    
    // Map terms to genres with better handling
    let genres = mapTermsToGenres(terms);
    
    // Remove negated genres more effectively
    if (negatedTerms.size > 0) {
      genres = genres.filter(genre => {
        const aliases = genreAliases[genre] || [];
        return ![...aliases, genre].some(alias => negatedTerms.has(alias));
      });
    }

    // Fallback to keyword search if no genres found
    let fallbackToKeyword = genres.length === 0;
    if (fallbackToKeyword) {
      genres = terms.filter(t => t.length > 3); // Only use longer terms for keywords
    }

    // Convert to TMDB genre IDs
    const tmdbGenres = genres
      .map(g => tmdbGenreIds[g])
      .filter(id => id !== undefined);

    // Fetch recommendations in parallel
    const [tmdbResults, localResults] = await Promise.all([
      (tmdbGenres.length > 0 || fallbackToKeyword) 
        ? fetchFromTMDB(contentType, {
            with_genres: tmdbGenres.join(','),
            ...(fallbackToKeyword && { with_keywords: genres.join(',') })
          })
        : [],
      genres.length > 0 
        ? fetchFromLocalDB(contentType === 'movie' ? Movie : TVShow, genres)
        : []
    ]);

    // Format results with better deduplication
    const recommendations = [
      ...tmdbResults.map(item => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        poster_path: item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        type: contentType,
        source: 'tmdb',
        popularity: item.popularity || 0
      })),
      ...localResults.map(item => ({
        id: item._id,
        title: item.title,
        overview: item.description,
        poster_path: item.posterUrl,
        type: contentType,
        source: 'local',
        popularity: item.views || 0
      }))
    ];

    // Remove duplicates and sort by popularity
    const uniqueRecs = recommendations
      .filter((v, i, a) => a.findIndex(t => t.title === v.title) === i)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8);

    res.json({
      query,
      contentType,
      detectedTerms: terms,
      detectedGenres: genres,
      recommendations: uniqueRecs
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      error: 'Oops, something went wrong!',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};