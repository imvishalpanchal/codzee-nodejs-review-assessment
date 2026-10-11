const jwt = require('jsonwebtoken');
const { errors } = require('../config/api/errorHandler');
const messages = require('../utils/messages');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errors.unauthorized(messages.TOKEN_MISSING));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(errors.unauthorized(messages.TOKEN_MISSING));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_codzee_jwt_key_2026_dev_env'
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(errors.unauthorized(messages.TOKEN_EXPIRED));
    }
    return next(errors.unauthorized(messages.TOKEN_INVALID));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(errors.forbidden(messages.FORBIDDEN));
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRole
};
