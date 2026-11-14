import express from 'express';
import {
  getGames,
  searchGames,
  getGameById,
  getGenres,
  getFeaturedGames,
  getGamesOverview,
} from '../controllers/game.controller.js';

const router = express.Router();

// Specific routes first
router.get('/overview', getGamesOverview);
router.get('/search', searchGames);
router.get('/genres', getGenres);
router.get('/featured', getFeaturedGames);

// General catalog list
router.get('/', getGames);

// Dynamic game details route by slug/id
router.get('/:id', getGameById);

export default router;
