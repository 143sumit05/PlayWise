import api from './api.js';
import { mockGames, allGenres } from '../data/mockGames.js';

export const gameService = {
  // Get paginated catalog with search, genre, and ordering
  getGames: async ({
    page = 1,
    pageSize = 20,
    search = '',
    genre = 'All',
    sortBy = 'popularity',
  } = {}) => {
    // Map UI sort options to backend/RAWG ordering
    let ordering = '-added';
    if (sortBy === 'rating') ordering = '-rating';
    else if (sortBy === 'releaseDate') ordering = '-released';
    else if (sortBy === 'name') ordering = 'name';

    try {
      const response = await api.get('/games', {
        params: {
          page,
          page_size: pageSize,
          search: search.trim(),
          genres: genre !== 'All' ? genre : undefined,
          ordering,
        },
      });

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Invalid response structure from games API');
    } catch (error) {
      console.warn('[PlayWise Game Service] Games API unavailable, falling back to local dataset:', error.message);
      // Fallback to local mock data
      let filtered = [...mockGames];
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.developer.toLowerCase().includes(q) ||
            g.genres.some((genreName) => genreName.toLowerCase().includes(q))
        );
      }
      if (genre && genre !== 'All') {
        filtered = filtered.filter((g) => g.genres.includes(genre));
      }
      if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
      else if (sortBy === 'releaseDate') filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

      return {
        count: filtered.length,
        page: 1,
        pageSize,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        results: filtered,
      };
    }
  },

  // Get single game details by ID or slug
  getGameById: async (id) => {
    try {
      const response = await api.get(`/games/${encodeURIComponent(id)}`);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Game not found');
    } catch (error) {
      console.warn(`[PlayWise Game Service] Game details API unavailable for "${id}", checking fallback:`, error.message);
      const fallback = mockGames.find((g) => g.id === id || g.slug === id);
      if (fallback) return fallback;
      throw error;
    }
  },

  // Get all genres
  getGenres: async () => {
    try {
      const response = await api.get('/games/genres');
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Genres API unavailable');
    } catch (error) {
      console.warn('[PlayWise Game Service] Genres API unavailable, using standard genres:', error.message);
      return allGenres.map((g, idx) => ({ id: idx, name: g, slug: g.toLowerCase() }));
    }
  },

  // Get curated homepage sections (featured, trending, popular, recently released)
  getFeaturedSections: async () => {
    try {
      const response = await api.get('/games/featured');
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Featured sections unavailable');
    } catch (error) {
      console.warn('[PlayWise Game Service] Featured games API unavailable, using fallback:', error.message);
      return {
        featured: mockGames.filter((g) => g.featured),
        trending: mockGames.filter((g) => g.trending),
        popular: mockGames.filter((g) => g.popular),
        recent: mockGames.filter((g) => g.recent),
      };
    }
  },
};

export default gameService;
