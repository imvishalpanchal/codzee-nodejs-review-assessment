const { ApiError, errors } = require('../config/api/errorHandler');
const messages = require('../utils/messages');

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  if (err.code === 'P2002') {
    const conflictErr = errors.conflict('A record with that unique field already exists');
    return res.status(conflictErr.statusCode).json(conflictErr.toJSON());
  }

  if (err.code === 'P2025') {
    const notFoundErr = errors.notFound('Record not found or already deleted');
    return res.status(notFoundErr.statusCode).json(notFoundErr.toJSON());
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? messages.INTERNAL_SERVER_ERROR : (err.message || 'An unexpected error occurred');

  const apiError = errors.fromError(err, status, 'SERVER');
  apiError.message = message;

  return res.status(apiError.statusCode).json(apiError.toJSON());
};

module.exports = errorHandler;
