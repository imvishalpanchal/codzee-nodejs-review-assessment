const rateLimit = require('express-rate-limit');
const { errors } = require('../config/api/errorHandler');

const createLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || 'Too many requests, please try again later';

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(errors.tooManyRequests(message));
    },
    skip: () => process.env.NODE_ENV === 'test' && !options.enableInTest
  });
};

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  enableInTest: false
});

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again later.',
  enableInTest: false
});

const testLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Test rate limit reached',
  enableInTest: true
});

module.exports = {
  createLimiter,
  authLimiter,
  apiLimiter,
  testLimiter
};
