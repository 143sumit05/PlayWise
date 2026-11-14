import axios from 'axios';
import { config } from '../config/index.js';
import { normalizeGame } from '../utils/rawgNormalizer.js';

const RAWG_BASE_URL = 'https://api.rawg.io/api';

// In-memory cache for RAWG responses to respect rate limits and boost performance
const cache = new Map();

const getCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key, data, ttlSeconds = 600) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

const rawgClient = axios.create({
  baseURL: RAWG_BASE_URL,
  timeout: 20000,
});

export const rawgService = {
  // Fetch paginated game catalog with filters & ordering
  getGames: async ({
    page = 1,
    pageSize = 20,
    search = '',
    genres = '',
    ordering = '-added',
  } = {}) => {
    const cacheKey = `games_${page}_${pageSize}_${search}_${genres}_${ordering}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const params = {
      key: config.rawgApiKey,
      page,
      page_size: pageSize,
      parent_platforms: 1, // Filter to PC platforms
    };

    if (search.trim()) params.search = search.trim();
    if (genres.trim() && genres !== 'All') params.genres = genres.toLowerCase().trim();
    // Do not pass default '-added' when searching so RAWG sorts by relevance
    if (ordering && (!search.trim() || ordering !== '-added')) {
      params.ordering = ordering;
    }

    const response = await rawgClient.get('/games', { params });
    const { count, next, previous, results } = response.data;

    const normalizedResults = results.map((g) => normalizeGame(g));

    const resultPayload = {
      count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / pageSize),
      hasNext: Boolean(next),
      hasPrevious: Boolean(previous),
      results: normalizedResults,
    };

    setCache(cacheKey, resultPayload, 600); // 10 minutes cache
    return resultPayload;
  },

  // Fetch complete details for a single game including screenshots
  getGameDetails: async (idOrSlug) => {
    const cacheKey = `game_details_${idOrSlug}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    // Fetch game details & screenshots concurrently
    const [gameRes, screenshotsRes] = await Promise.all([
      rawgClient.get(`/games/${encodeURIComponent(idOrSlug)}`, {
        params: { key: config.rawgApiKey },
      }),
      rawgClient
        .get(`/games/${encodeURIComponent(idOrSlug)}/screenshots`, {
          params: { key: config.rawgApiKey },
        })
        .catch(() => ({ data: { results: [] } })),
    ]);

    const screenshots = screenshotsRes.data.results || [];
    const normalized = normalizeGame(gameRes.data, screenshots);

    setCache(cacheKey, normalized, 900); // 15 minutes cache
    return normalized;
  },

  // Fetch available genres from RAWG
  getGenres: async () => {
    const cacheKey = 'rawg_genres';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const response = await rawgClient.get('/genres', {
      params: { key: config.rawgApiKey },
    });

    const genres = [
      { id: 'all', name: 'All', slug: 'all' },
      ...response.data.results.map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        image: g.image_background,
        gamesCount: g.games_count,
      })),
    ];

    setCache(cacheKey, genres, 86400); // 24 hours cache
    return genres;
  },

  // Fetch curated homepage sections (featured, trending, popular, recently released)
  getFeaturedSections: async () => {
    const cacheKey = 'rawg_featured_sections';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Fetch featured (high-rated AAA PC games), trending, popular, and recent
    const [featuredRes, trendingRes, popularRes, recentRes] = await Promise.all([
      rawgClient.get('/games', {
        params: {
          key: config.rawgApiKey,
          parent_platforms: 1,
          dates: `${lastYear}-01-01,${currentYear}-12-31`,
          ordering: '-rating',
          page_size: 6,
        },
      }),
      rawgClient.get('/games', {
        params: {
          key: config.rawgApiKey,
          parent_platforms: 1,
          ordering: '-added',
          page_size: 8,
        },
      }),
      rawgClient.get('/games', {
        params: {
          key: config.rawgApiKey,
          parent_platforms: 1,
          metacritic: '85,100',
          ordering: '-metacritic',
          page_size: 8,
        },
      }),
      rawgClient.get('/games', {
        params: {
          key: config.rawgApiKey,
          parent_platforms: 1,
          dates: `${lastYear}-06-01,${currentYear}-12-31`,
          ordering: '-released',
          page_size: 8,
        },
      }),
    ]);

    const payload = {
      featured: featuredRes.data.results.map((g) => normalizeGame(g)),
      trending: trendingRes.data.results.map((g) => normalizeGame(g)),
      popular: popularRes.data.results.map((g) => normalizeGame(g)),
      recent: recentRes.data.results.map((g) => normalizeGame(g)),
    };

    setCache(cacheKey, payload, 900); // 15 minutes cache
    return payload;
  },
};

export default rawgService;

