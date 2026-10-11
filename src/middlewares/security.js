const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
};

const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        cleanObj[key] = sanitizeValue(val[key]);
      }
    }
    return cleanObj;
  }
  return val;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  next();
};

module.exports = {
  securityHeaders,
  sanitizeInput
};
