import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { benchmarkSeedService } from './services/benchmarkSeedService.js';

const PORT = config.port;

// Start server and initialize MongoDB Atlas connection
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();
    // Ensure hardware benchmark database is populated
    await benchmarkSeedService.seedBenchmarksIfNeeded();
  } catch (error) {
    console.error('[PlayWise Backend] Database connection failed on startup:', error.message);
    console.log('[PlayWise Backend] Server will continue running; database operations will retry when connection is restored.');
  }

  const server = app.listen(PORT, () => {
    console.log(`[PlayWise Backend] Server running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`[PlayWise Backend] Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`[PlayWise Backend] Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`[PlayWise Backend] PC Profiles API: http://localhost:${PORT}/api/pc-profiles`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('[PlayWise Backend] SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('[PlayWise Backend] HTTP server closed');
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[PlayWise Backend] Unhandled Rejection at:', promise, 'reason:', reason);
  });
};

startServer();
