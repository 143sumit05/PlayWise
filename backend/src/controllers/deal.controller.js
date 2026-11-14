import { cheapsharkService } from '../services/cheapsharkService.js';

export const dealController = {
  /**
   * GET /api/deals
   * Retrieve curated / filtered PC game deals
   */
  getDeals: async (req, res, next) => {
    try {
      const {
        storeID,
        pageNumber = 0,
        pageSize = 24,
        sortBy = 'Savings',
        desc = 0,
        lowerPrice,
        upperPrice,
        title,
      } = req.query;

      const dealsData = await cheapsharkService.getDeals({
        storeID,
        pageNumber: parseInt(pageNumber, 10) || 0,
        pageSize: parseInt(pageSize, 10) || 24,
        sortBy,
        desc: parseInt(desc, 10) || 0,
        lowerPrice,
        upperPrice,
        title,
      });

      res.json({
        success: true,
        data: dealsData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/deals/search?q=
   * Search deals by title query
   */
  searchDeals: async (req, res, next) => {
    try {
      const query = (req.query.q || req.query.query || '').trim();
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required for deal searches.',
        });
      }

      const {
        storeID,
        pageNumber = 0,
        pageSize = 24,
        sortBy = 'Savings',
        desc = 0,
        lowerPrice,
        upperPrice,
      } = req.query;

      const dealsData = await cheapsharkService.searchDeals(query, {
        storeID,
        pageNumber: parseInt(pageNumber, 10) || 0,
        pageSize: parseInt(pageSize, 10) || 24,
        sortBy,
        desc: parseInt(desc, 10) || 0,
        lowerPrice,
        upperPrice,
      });

      res.json({
        success: true,
        query,
        data: dealsData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/deals/game/:gameId
   * Retrieve all live retailer offers for a specific game
   */
  getGameOffers: async (req, res, next) => {
    try {
      const { gameId } = req.params;
      const { title } = req.query;

      const offersData = await cheapsharkService.getGameOffers(gameId, {
        rawgTitle: title || '',
      });

      res.json({
        success: true,
        data: offersData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/deals/stores
   * Retrieve all supported digital PC stores
   */
  getStores: async (req, res, next) => {
    try {
      const storesData = await cheapsharkService.getStores();
      res.json({
        success: true,
        data: storesData.list,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/deals/currencies
   * Retrieve active currency conversion rates and supported currencies
   */
  getCurrencies: async (req, res, next) => {
    try {
      const currenciesData = await cheapsharkService.getExchangeRates();
      res.json({
        success: true,
        data: currenciesData,
      });
    } catch (error) {
      next(error);
    }
  },
};
