const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/config/database/prismaClient');

describe('Auth Endpoints (/api/v1/auth)', () => {
  const testUser = {
    name: 'Test Tester',
    email: 'tester@codzee.dev',
    password: 'Password@123',
    role: 'member'
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, 'another@codzee.dev'] } }
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('token');
      expect(res.body.response.user).toHaveProperty('email', testUser.email);
      expect(res.body.response.user).not.toHaveProperty('password');
    });

    it('should return 409 Conflict if registering with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already registered');
    });

    it('should return 422 Validation Error on invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid',
          email: 'not-an-email',
          password: '123'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('details');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('token');
      expect(res.body.response.user).toHaveProperty('email', testUser.email);
    });

    it('should return 401 Unauthorized for incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword@999'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized for non-existent user email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@codzee.dev',
          password: 'SomePassword@123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let authToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      authToken = loginRes.body.response.token;
    });

    it('should return current user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('email', testUser.email);
      expect(res.body.response).toHaveProperty('_count');
    });

    it('should return 401 Unauthorized when Bearer token is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
