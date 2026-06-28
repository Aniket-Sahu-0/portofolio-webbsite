require('dotenv').config();

// In development, accept any localhost/127.0.0.1 origin regardless of port.
// Vite picks a different port when 3000 is taken (e.g. 3001), and a hardcoded
// allowlist would silently break CORS for that origin — causing fetches to fail
// and the client to fall back to placeholder (Unsplash) imagery.
const devOrigins = (origin, callback) => {
  if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return callback(null, true);
  }
  return callback(null, false);
};

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // CORS Configuration
  // CLIENT_URL may be a comma-separated list (apex + www + vercel preview),
  // which the cors package accepts as an array of allowed origins.
  cors: {
    enabled: process.env.CORS_ENABLED
      ? process.env.CORS_ENABLED === 'true'
      : (process.env.NODE_ENV !== 'production'),
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean)
      : (process.env.NODE_ENV === 'production' ? false : devOrigins),
  },
  
  // Rate Limiting (per IP, per window). Two separate caps — see server/src/index.js:
  //   max      -> /api routes (contact form, data). Strict; abuse-sensitive.
  //   mediaMax -> /media photos. Generous, because one page pulls ~30 images, so a
  //               visitor browsing several pages legitimately makes hundreds of
  //               image requests. ~1500/15min ≈ 50 page views before any throttling.
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : (process.env.NODE_ENV === 'development' ? 1000 : 100), // Higher limit in dev for HMR
    mediaMax: process.env.RATE_LIMIT_MEDIA_MAX ? parseInt(process.env.RATE_LIMIT_MEDIA_MAX) : (process.env.NODE_ENV === 'development' ? 20000 : 1500),
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

// Warn about missing SMTP vars but don't crash — email is optional
if (process.env.NODE_ENV === 'production') {
  const smtpVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_TO'];
  const missing = smtpVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`SMTP not configured (${missing.join(', ')} missing) — contact form emails will be disabled`);
  }
}

module.exports = config;
