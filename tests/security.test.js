const request = require('supertest');
const express = require('express');
const app = require('../src/server');
const { testLimiter } = require('../src/middlewares/rateLimiter');

describe('Security & Protection Middleware Suite', () => {
  describe('Security Headers', () => {
    it('should set secure headers on HTTP responses and remove X-Powered-By', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-xss-protection']).toBe('1; mode=block');
      expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Input Sanitization', () => {
    let userToken;

    beforeAll(async () => {
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Security Admin',
          email: 'secadmin@codzee-security.dev',
          password: 'Password@123',
          role: 'admin'
        });
      userToken = regRes.body.response.token;
    });

    it('should sanitize and strip malicious script tags from project payload', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Clean Name <script>alert("xss")</script>',
          description: 'Safe Description <script src="evil.js"></script>'
        });

      expect(res.status).toBe(201);
      expect(res.body.response.name).toBe('Clean Name');
      expect(res.body.response.description).toBe('Safe Description');
    });
  });

  describe('Rate Limiter Behavior', () => {
    let rateLimitedApp;

    beforeAll(() => {
      rateLimitedApp = express();
      rateLimitedApp.use(testLimiter);
      rateLimitedApp.get('/test-limit', (req, res) => res.json({ ok: true }));
      rateLimitedApp.use(require('../src/middlewares/errorHandler'));
    });

    it('should trigger HTTP 429 Too Many Requests when request threshold is exceeded', async () => {
      for (let i = 0; i < 3; i++) {
        const res = await request(rateLimitedApp).get('/test-limit');
        expect(res.status).toBe(200);
      }

      const blockedRes = await request(rateLimitedApp).get('/test-limit');
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.success).toBe(false);
      expect(blockedRes.body.statusCode).toBe(429);
      expect(blockedRes.body.error.message).toContain('Test rate limit reached');
    });
  });
});
