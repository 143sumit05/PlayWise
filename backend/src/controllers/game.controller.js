import rawgService from '../services/rawgService.js';

// @desc    Get paginated game catalog with filters & ordering
// @route   GET /api/games
// @access  Public
export const getGames = async (req, res, next) => {
  try {
    const { page, page_size, search, genres, ordering } = req.query;

    const data = await rawgService.getGames({
      page: page ? Number(page) : 1,
      pageSize: page_size ? Number(page_size) : 20,
      search: search || '',
      genres: genres || '',
      ordering: ordering || '-added',
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[PlayWise Games Controller] Error fetching games from RAWG:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to retrieve games catalog from RAWG.',
    });
  }
};

// @desc    Search games by text query
// @route   GET /api/games/search
// @access  Public
export const searchGames = async (req, res, next) => {
  try {
    const { q, page, page_size } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required.',
      });
    }

    const data = await rawgService.getGames({
      search: q.trim(),
      page: page ? Number(page) : 1,
      pageSize: page_size ? Number(page_size) : 20,
      ordering: '-relevance',
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[PlayWise Games Controller] Search error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message || 'Game search failed.',
    });
  }
};

// @desc    Get single game details by ID or slug
// @route   GET /api/games/:id
// @access  Public
export const getGameById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const game = await rawgService.getGameDetails(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Game with ID or slug "${id}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: `Game "${req.params.id}" not found in RAWG database.`,
      });
    }
    console.error(`[PlayWise Games Controller] Error fetching game details (${req.params.id}):`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve game details from RAWG.',
    });
  }
};

// @desc    Get all available game genres
// @route   GET /api/games/genres
// @access  Public
export const getGenres = async (req, res, next) => {
  try {
    const genres = await rawgService.getGenres();
    res.status(200).json({
      success: true,
      count: genres.length,
      data: genres,
    });
  } catch (error) {
    console.error('[PlayWise Games Controller] Error fetching genres:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve genres.',
    });
  }
};

// @desc    Get curated homepage sections (featured, trending, popular, recently released)
// @route   GET /api/games/featured
// @access  Public
export const getFeaturedGames = async (req, res, next) => {
  try {
    const sections = await rawgService.getFeaturedSections();
    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('[PlayWise Games Controller] Error fetching featured games:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve featured games.',
    });
  }
};

// @desc    Games overview metadata
// @route   GET /api/games/overview
// @access  Public
export const getGamesOverview = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PlayWise RAWG Game Discovery Service (Phase 3 Active)',
    data: {
      provider: 'RAWG Video Games Database API',
      database: '500,000+ PC Games',
      features: ['Search', 'Genre Filtering', 'System Requirements', 'Screenshots', 'Ratings'],
      phase: 'Phase 3 - Real Game Discovery',
    },
  });
};
