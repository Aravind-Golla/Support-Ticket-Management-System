process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-jwt-secret-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:5173';

require('dotenv').config();

if (!process.env.TEST_DB_NAME) {
  process.env.TEST_DB_NAME = 'support_tickets_test';
}
process.env.DB_NAME = process.env.TEST_DB_NAME;
