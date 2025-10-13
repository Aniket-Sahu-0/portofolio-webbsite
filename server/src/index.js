const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Security middleware
if (config.helmet.enabled) {
  app.use(helmet());
}

// Enable CORS
if (config.cors.enabled) {
  app.use(
    cors({
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

// Request logging
app.use(require('morgan')(config.morgan.format, { stream: logger.stream }));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static media files
const mediaRoot = path.join(__dirname, '../../media');
if (!fs.existsSync(mediaRoot)) {
  fs.mkdirSync(mediaRoot, { recursive: true });
}
app.use('/media', express.static(mediaRoot, {
  maxAge: '1h',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api', apiRoutes);

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// Start the server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`Server is running in ${config.env} mode on port ${PORT}`);
  
  // Log the environment configuration (without sensitive data)
  const safeConfig = { ...config };
  if (safeConfig.email && safeConfig.email.auth) {
    safeConfig.email.auth = { 
      ...safeConfig.email.auth,
      pass: safeConfig.email.auth.pass ? '***' : undefined,
    };
  }
  logger.debug('Server configuration:', safeConfig);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM (for Docker, Kubernetes, etc.)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;
