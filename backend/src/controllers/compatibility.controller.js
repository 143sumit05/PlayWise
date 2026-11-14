import { compatibilityService } from '../services/compatibilityService.js';
import { bottleneckService } from '../services/bottleneckService.js';
import PCProfile from '../models/PCProfile.js';

export const compatibilityController = {
  /**
   * Evaluate compatibility between provided userSpecs and game requirements
   * POST /api/compatibility/evaluate
   * Body: { userSpecs, game, gameId }
   */
  evaluateCompatibility: async (req, res, next) => {
    try {
      const { userSpecs, game, gameId } = req.body;
      const result = await compatibilityService.evaluateCompatibility(userSpecs, game || gameId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Calculate hardware bottleneck between CPU and GPU
   * POST /api/compatibility/bottleneck
   * Body: { cpu, gpu, resolution }
   */
  calculateBottleneck: async (req, res, next) => {
    try {
      const { cpu, gpu, resolution = '1080p' } = req.body;
      const result = await bottleneckService.calculateBottleneck(cpu, gpu, resolution);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Project resolution-based FPS estimates
   * POST /api/compatibility/fps
   * Body: { userSpecs, gameReqs }
   */
  projectFPS: async (req, res, next) => {
    try {
      const { userSpecs, gameReqs } = req.body;
      const result = await bottleneckService.projectFPS(userSpecs, gameReqs);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Evaluate compatibility for a specific game against user's default rig
   * GET /api/compatibility/game/:gameId
   */
  evaluateGameCompatibility: async (req, res, next) => {
    try {
      const { gameId } = req.params;
      let userSpecs = null;

      // If user is authenticated, retrieve default profile from MongoDB
      if (req.user) {
        const defaultProfile = await PCProfile.findOne({ userId: req.user._id, isDefault: true }).lean();
        if (defaultProfile) {
          userSpecs = {
            cpu: defaultProfile.cpu,
            gpu: defaultProfile.gpu,
            ram: defaultProfile.ram,
            storage: defaultProfile.storage,
            storageType: defaultProfile.storageType,
            operatingSystem: defaultProfile.operatingSystem,
          };
        }
      }

      // Allow overriding or passing specs via query string for guests
      if (!userSpecs && req.query.cpu && req.query.gpu) {
        userSpecs = {
          cpu: req.query.cpu,
          gpu: req.query.gpu,
          ram: parseInt(req.query.ram, 10) || 16,
          storage: parseInt(req.query.storage, 10) || 500,
          storageType: req.query.storageType || 'NVMe SSD',
          operatingSystem: req.query.os || 'Windows 11 64-bit',
        };
      }

      const result = await compatibilityService.evaluateCompatibility(userSpecs, gameId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default compatibilityController;
