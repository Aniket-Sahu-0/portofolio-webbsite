require('dotenv').config();

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // CORS Configuration
  cors: {
    enabled: process.env.CORS_ENABLED
      ? process.env.CORS_ENABLED === 'true'
      : (process.env.NODE_ENV !== 'production'),
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100, // limit each IP to 100 requests per windowMs
  },
  
  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@theweddingshade.com',
    to: process.env.EMAIL_TO,
  },
  
  // Security
  helmet: {
    enabled: process.env.HELMET_ENABLED !== 'false',
  },
  
  // Logging
  morgan: {
    format: process.env.MORGAN_FORMAT || 'dev',
  },
};

// Validate required environment variables
const requiredVars = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_TO',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

module.exports = config;
