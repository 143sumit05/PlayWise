import mongoose from 'mongoose';

export const getHealthStatus = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'PlayWise Backend API is operational',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'playwise',
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};
