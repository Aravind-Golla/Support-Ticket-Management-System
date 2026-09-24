const { AppError } = require('./errorHandler');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You are not authorized to perform this action'));
    }
    return next();
  };
}

module.exports = { requireRole };
