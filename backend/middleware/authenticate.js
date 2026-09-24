const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./errorHandler');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (!payload || !payload.id || !payload.role) {
      return next(new AppError(401, 'Invalid token'));
    }
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Token expired'));
    }
    return next(new AppError(401, 'Invalid token'));
  }
}

module.exports = { authenticate };
