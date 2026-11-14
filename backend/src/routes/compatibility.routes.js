import express from 'express';
import { compatibilityController } from '../controllers/compatibility.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/compatibility/evaluate - Public evaluation endpoint
router.post('/evaluate', compatibilityController.evaluateCompatibility);

// POST /api/compatibility/bottleneck - CPU vs GPU bottleneck calculation
router.post('/bottleneck', compatibilityController.calculateBottleneck);

// POST /api/compatibility/fps - Resolution-based FPS projections
router.post('/fps', compatibilityController.projectFPS);

// GET /api/compatibility/game/:gameId - Can work for guests with query params, or optional auth
// We create an optional auth middleware wrapper so guests can still use the endpoint without 401
const optionalAuth = (req, res, next) => {
  // Try protect middleware if cookies or auth header exists, otherwise proceed as guest
  if (req.cookies?.token || req.cookies?.jwt || req.headers.authorization?.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/game/:gameId', optionalAuth, compatibilityController.evaluateGameCompatibility);

export default router;
