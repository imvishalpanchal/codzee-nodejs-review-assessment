const { errors: apiErrors } = require('../config/api/errorHandler');

const validateRequest = (schema) => async (req, res, next) => {
  try {
    const validated = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    req.body = validated;
    next();
  } catch (err) {
    if (err.inner && err.inner.length > 0) {
      const errorDetails = err.inner.map((e) => ({
        field: e.path,
        message: e.message
      }));
      return next(apiErrors.unprocessable('Validation Error', errorDetails));
    }
    return next(apiErrors.unprocessable(err.message));
  }
};

module.exports = { validateRequest };
