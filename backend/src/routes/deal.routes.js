import express from 'express';
import { dealController } from '../controllers/deal.controller.js';

const router = express.Router();

// GET /api/deals/stores - supported stores
router.get('/stores', dealController.getStores);

// GET /api/deals/currencies - supported currency exchange rates
router.get('/currencies', dealController.getCurrencies);

// GET /api/deals/search?q= - search deals
router.get('/search', dealController.searchDeals);

// GET /api/deals/game/:gameId - offers for a specific game
router.get('/game/:gameId', dealController.getGameOffers);

// GET /api/deals - curated popular game deals
router.get('/', dealController.getDeals);

export default router;
