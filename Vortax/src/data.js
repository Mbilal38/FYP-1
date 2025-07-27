export const movies = [
   {
    id: 1,
    title: 'Inception',
    thumbnail: '', // Placeholder, will be replaced dynamically
    type: 'movie',
    isTrending: true,
    isLatest: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 2,
    title: 'Interstellar',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 3,
    title: 'The Dark Knight',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 4,
    title: 'Avengers: Endgame',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 5,
    title: 'The Matrix',
    thumbnail: '/assets/matrix.jpg',
    type: 'movie',
    isTrending: false,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 6,
    title: 'The Godfather',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 7,
    title: 'The Lord of the Rings: The Return of the King',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 8,
    title: 'Forrest Gump',
    thumbnail: '',
    type: 'movie',
    isTrending: false,
    isLatest: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 9,
    title: 'Titanic',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 10,
    title: 'The Shawshank Redemption',
    thumbnail: '',
    type: 'movie',
    isTrending: true,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 11,
    title: 'The Avengers',
    thumbnail: '',
    type: 'movie',
    isTrending: false,
    isLatest: false,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  }
];

export const tvShows = [
  {
    id: 1,
    title: 'Breaking Bad',
    thumbnail: '', // Placeholder, will be replaced dynamically
    type: 'tvshow',
    isTrending: true,
    isLatest: true,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Pilot' },
          { episodeNumber: 2, title: 'Cat\'s in the Bag' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Stranger Things',
    thumbnail: '/assets/strangerthings.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Chapter One: The Vanishing of Will Byers' },
          { episodeNumber: 2, title: 'Chapter Two: The Weirdo on Maple Street' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Game of Thrones',
    thumbnail: '/assets/gameofthrones.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Winter Is Coming' },
          { episodeNumber: 2, title: 'The Kingsroad' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'The Mandalorian',
    thumbnail: '/assets/mandalorian.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Chapter 1: The Mandalorian' },
          { episodeNumber: 2, title: 'Chapter 2: The Child' },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'The Witcher',
    thumbnail: '/assets/witcher.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'The End\'s Beginning' },
          { episodeNumber: 2, title: 'Four Marks' },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'The Office',
    thumbnail: '/assets/theoffice.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Pilot' },
          { episodeNumber: 2, title: 'Diversity Day' },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Friends',
    thumbnail: '/assets/friends.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'The One Where Monica Gets a Roommate' },
          { episodeNumber: 2, title: 'The One with the Sonogram at the End' },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Sherlock',
    thumbnail: '/assets/sherlock.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'A Study in Pink' },
          { episodeNumber: 2, title: 'The Blind Banker' },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'The Crown',
    thumbnail: '/assets/thecrown.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Wolferton Splash' },
          { episodeNumber: 2, title: 'Hyde Park Corner' },
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Peaky Blinders',
    thumbnail: '/assets/peakyblinders.jpg',
    type: 'tvshow',
    isTrending: true,
    isLatest: false,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: 'Episode 1' },
          { episodeNumber: 2, title: 'Episode 2' },
        ],
      },
    ],
  }
];
