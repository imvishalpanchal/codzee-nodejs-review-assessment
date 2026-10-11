const request = require('supertest');
const app = require('../src/server');

describe('Health and System Endpoints', () => {
  it('GET /health should return 200 OK and service status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Service is healthy');
    expect(res.body.response).toHaveProperty('status', 'ok');
    expect(res.body.response).toHaveProperty('timestamp');
  });

  it('GET /non-existent-route should return 404 Not Found', async () => {
    const res = await request(app).get('/api/v1/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });
});
