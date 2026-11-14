import express from 'express';
import { benchmarkController } from '../controllers/benchmark.controller.js';

const router = express.Router();

// GET /api/benchmarks/search?q=&type=&limit=
router.get('/search', benchmarkController.searchHardware);

// POST /api/benchmarks/match - Body: { name, type }
router.post('/match', benchmarkController.matchHardware);

// GET /api/benchmarks/tiers - Performance tier definitions
router.get('/tiers', benchmarkController.getTiers);

// GET /api/benchmarks/catalog?type= - Full catalog for selectors
router.get('/catalog', benchmarkController.getCatalog);

export default router;
