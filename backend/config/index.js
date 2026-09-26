require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    if (process.env.NODE_ENV === 'test' && name === 'JWT_SECRET') {
      return 'test-only-jwt-secret-do-not-use-in-production';
    }
    if (fallback !== undefined) return fallback;
  }
  return value;
}

const config = {
  port: Number(required('PORT', '5000')),
  nodeEnv: required('NODE_ENV', 'development'),
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'test' ? 'test-only-jwt-secret-do-not-use-in-production' : undefined),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '7d'),
  bcryptRounds: Number(required('BCRYPT_ROUNDS', '10')),
  corsOrigin: required('CORS_ORIGIN', 'http://localhost:5173'),
  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(required('DB_PORT', '3306')),
    user: required('DB_USER', 'root'),
    password: required('DB_PASSWORD', ''),
    database: required('DB_NAME', 'support_tickets'),
    ssl: (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') ? { rejectUnauthorized: false } : undefined,
  },
};

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

module.exports = config;
