import api from './api.js';

export const dealService = {
  /**
   * Get popular / filtered game deals
   */
  getDeals: async (params = {}) => {
    try {
      const response = await api.get('/deals', { params });
      return response.data?.data;
    } catch (error) {
      console.error('[DealService] Failed to fetch deals:', error);
      throw error;
    }
  },

  /**
   * Search deals by title query
   */
  searchDeals: async (query, params = {}) => {
    try {
      const response = await api.get('/deals/search', {
        params: { q: query, ...params },
      });
      return response.data?.data;
    } catch (error) {
      console.error('[DealService] Failed to search deals:', error);
      throw error;
    }
  },

  /**
   * Get live store offers for a specific game
   * @param {string|number} gameId - CheapShark gameID or RAWG slug/ID
   * @param {string} [title] - Optional game title to aid matching
   */
  getGameOffers: async (gameId, title = '') => {
    try {
      const response = await api.get(`/deals/game/${encodeURIComponent(gameId)}`, {
        params: title ? { title } : {},
      });
      return response.data?.data;
    } catch (error) {
      console.error(`[DealService] Failed to fetch offers for game ${gameId}:`, error);
      throw error;
    }
  },

  /**
   * Get list of supported digital stores
   */
  getStores: async () => {
    try {
      const response = await api.get('/deals/stores');
      return response.data?.data || [];
    } catch (error) {
      console.error('[DealService] Failed to fetch stores:', error);
      return [];
    }
  },

  /**
   * Get currency exchange rates
   */
  getCurrencies: async () => {
    try {
      const response = await api.get('/deals/currencies');
      return response.data?.data;
    } catch (error) {
      console.error('[DealService] Failed to fetch currencies:', error);
      throw error;
    }
  },
};

export default dealService;
