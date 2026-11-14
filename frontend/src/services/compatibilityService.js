import api from './api.js';

export const compatibilityService = {
  /**
   * Evaluate full compatibility between user PC specs and a game
   * @param {Object} userSpecs - { cpu, gpu, ram, storageSpace, storageType, os }
   * @param {Object} [game] - Game object containing requirements
   * @param {string|number} [gameId] - RAWG game ID or slug
   */
  evaluate: async (userSpecs, game = null, gameId = null) => {
    try {
      const response = await api.post('/compatibility/evaluate', {
        userSpecs,
        game,
        gameId,
      });
      return response.data?.data;
    } catch (error) {
      console.warn('[CompatibilityService] Evaluate error:', error.message);
      return null;
    }
  },

  /**
   * Calculate CPU vs. GPU bottleneck and resolution dynamics
   * @param {string|Object} cpu
   * @param {string|Object} gpu
   * @param {string} resolution - '1080p' | '1440p' | '4k'
   */
  calculateBottleneck: async (cpu, gpu, resolution = '1080p') => {
    try {
      const response = await api.post('/compatibility/bottleneck', {
        cpu,
        gpu,
        resolution,
      });
      return response.data?.data;
    } catch (error) {
      console.warn('[CompatibilityService] Bottleneck error:', error.message);
      return null;
    }
  },

  /**
   * Calculate resolution-based FPS projections across presets
   * @param {Object} userSpecs
   * @param {Object} gameReqs
   */
  projectFPS: async (userSpecs, gameReqs) => {
    try {
      const response = await api.post('/compatibility/fps', {
        userSpecs,
        gameReqs,
      });
      return response.data?.data;
    } catch (error) {
      console.warn('[CompatibilityService] FPS projection error:', error.message);
      return null;
    }
  },

  /**
   * Evaluate compatibility for a game by ID (supports authenticated user or specs override)
   */
  evaluateGame: async (gameId, userSpecs = null) => {
    try {
      const params = {};
      if (userSpecs) {
        if (userSpecs.cpu) params.cpu = userSpecs.cpu;
        if (userSpecs.gpu) params.gpu = userSpecs.gpu;
        if (userSpecs.ram) params.ram = userSpecs.ram;
        if (userSpecs.storageSpace) params.storage = userSpecs.storageSpace;
        if (userSpecs.storageType) params.storageType = userSpecs.storageType;
        if (userSpecs.os) params.os = userSpecs.os;
      }
      const response = await api.get(`/compatibility/game/${encodeURIComponent(gameId)}`, { params });
      return response.data?.data;
    } catch (error) {
      console.warn(`[CompatibilityService] Evaluate game ${gameId} error:`, error.message);
      return null;
    }
  },
};

export default compatibilityService;
