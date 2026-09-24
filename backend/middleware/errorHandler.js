class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (status >= 500) {
    console.error(err);
  }

  let message = err.message || 'Internal server error';
  if (status >= 500 && isProd) {
    message = 'Internal server error';
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with that value already exists' });
  }

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
