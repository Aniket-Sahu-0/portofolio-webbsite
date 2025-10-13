const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const config = require('../config');

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let logMessage = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    logMessage += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return logMessage;
});

// Create logger instance
const logger = createLogger({
  level: config.env === 'production' ? 'info' : 'debug', // Log more verbosely in development
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.env === 'production' ? json() : combine(colorize(), consoleFormat)
  ),
  defaultMeta: { service: 'photographer-portfolio' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to `combined.log`
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, also log to the console
if (config.env !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    ),
  }));
}

// Create a stream for morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
