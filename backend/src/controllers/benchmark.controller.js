import { benchmarkService } from '../services/benchmarkService.js';

export const benchmarkController = {
  /**
   * Search benchmark catalog by query
   * GET /api/benchmarks/search?q=&type=
   */
  searchHardware: async (req, res, next) => {
    try {
      const { q = '', type = 'all', limit = 10 } = req.query;
      const results = await benchmarkService.searchHardware(q, type, parseInt(limit, 10) || 10);
      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Match an arbitrary user hardware string to a benchmark profile
   * POST /api/benchmarks/match
   * Body: { name: string, type: 'cpu' | 'gpu' }
   */
  matchHardware: async (req, res, next) => {
    try {
      const rawName = req.body.name || req.body.hardware;
      const type = req.body.type || 'gpu';
      if (!rawName) {
        return res.status(400).json({
          success: false,
          message: 'Hardware component name is required (provide "name" or "hardware")',
        });
      }
      const matchResult = await benchmarkService.matchHardware(rawName, type);
      res.json({
        success: true,
        data: matchResult,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all performance tiers metadata
   * GET /api/benchmarks/tiers
   */
  getTiers: async (req, res, next) => {
    try {
      const tiers = benchmarkService.getTiers();
      res.json({
        success: true,
        data: tiers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get complete hardware benchmark catalog for dropdowns and selectors
   * GET /api/benchmarks/catalog?type=
   */
  getCatalog: async (req, res, next) => {
    try {
      const { type = 'all' } = req.query;
      const catalog = await benchmarkService.getCatalog(type);
      res.json({
        success: true,
        data: catalog,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default benchmarkController;
