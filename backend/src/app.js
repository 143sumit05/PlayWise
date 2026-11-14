import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import healthRoutes from './routes/health.routes.js';
import gameRoutes from './routes/game.routes.js';
import authRoutes from './routes/auth.routes.js';
import pcProfileRoutes from './routes/pcProfile.routes.js';
import dealRoutes from './routes/deal.routes.js';
import benchmarkRoutes from './routes/benchmark.routes.js';
import compatibilityRoutes from './routes/compatibility.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'PlayWise API',
    tagline: 'Play smarter. Choose better.',
    status: 'online',
    phase: 'Phase 5 - Advanced PC Compatibility & Hardware Benchmarking',
    endpoints: {
      health: '/api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      pcProfiles: {
        list: 'GET /api/pc-profiles',
        create: 'POST /api/pc-profiles',
        getOne: 'GET /api/pc-profiles/:id',
        update: 'PUT /api/pc-profiles/:id',
        delete: 'DELETE /api/pc-profiles/:id',
        setDefault: 'PATCH /api/pc-profiles/:id/default',
      },
      games: {
        catalog: 'GET /api/games?page=1&page_size=20&genres=&ordering=-added',
        search: 'GET /api/games/search?q=query',
        details: 'GET /api/games/:id',
        genres: 'GET /api/games/genres',
        featured: 'GET /api/games/featured',
        overview: 'GET /api/games/overview',
      },
      deals: {
        deals: 'GET /api/deals?sortBy=Savings&pageSize=24&storeID=&pageNumber=0',
        search: 'GET /api/deals/search?q=query',
        gameObject: 'GET /api/deals/game/:gameId?title=title',
        stores: 'GET /api/deals/stores',
        currencies: 'GET /api/deals/currencies',
      },
      benchmarks: {
        search: 'GET /api/benchmarks/search?q=query&type=all|cpu|gpu',
        match: 'POST /api/benchmarks/match { hardware, type }',
        tiers: 'GET /api/benchmarks/tiers',
        catalog: 'GET /api/benchmarks/catalog?type=all|cpu|gpu',
      },
      compatibility: {
        evaluate: 'POST /api/compatibility/evaluate { userSpecs, game, gameId }',
        gameEvaluate: 'GET /api/compatibility/game/:gameId',
        bottleneck: 'POST /api/compatibility/bottleneck { cpu, gpu, resolution }',
        fps: 'POST /api/compatibility/fps { userSpecs, gameReqs }',
      },
    },
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pc-profiles', pcProfileRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/compatibility', compatibilityRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
