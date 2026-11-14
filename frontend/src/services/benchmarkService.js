import api from './api.js';

export const benchmarkService = {
  /**
   * Search hardware components by query string
   * @param {string} query
   * @param {string} type - 'all' | 'cpu' | 'gpu'
   * @param {number} limit
   */
  searchHardware: async (query, type = 'all', limit = 10) => {
    try {
      const response = await api.get('/benchmarks/search', {
        params: { q: query, type, limit },
      });
      return response.data?.data;
    } catch (error) {
      console.warn('[BenchmarkService] Search error:', error.message);
      return { cpus: [], gpus: [] };
    }
  },

  /**
   * Match an arbitrary user hardware string to a verified benchmark profile
   * @param {string} hardware
   * @param {string} type - 'cpu' | 'gpu'
   */
  matchHardware: async (hardware, type = 'gpu') => {
    try {
      const response = await api.post('/benchmarks/match', {
        hardware,
        name: hardware,
        type,
      });
      return response.data?.data;
    } catch (error) {
      console.warn('[BenchmarkService] Match error:', error.message);
      return null;
    }
  },

  /**
   * Get all benchmark tier metadata
   */
  getTiers: async () => {
    try {
      const response = await api.get('/benchmarks/tiers');
      return response.data?.data;
    } catch (error) {
      console.warn('[BenchmarkService] Get tiers error:', error.message);
      return null;
    }
  },

  /**
   * Get complete hardware benchmark catalog
   * @param {string} type - 'all' | 'cpu' | 'gpu'
   */
  getCatalog: async (type = 'all') => {
    try {
      const response = await api.get('/benchmarks/catalog', { params: { type } });
      return response.data?.data;
    } catch (error) {
      console.warn('[BenchmarkService] Get catalog error:', error.message);
      return null;
    }
  },
};

export default benchmarkService;
