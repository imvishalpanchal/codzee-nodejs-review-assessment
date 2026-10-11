const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/config/database/prismaClient');

describe('Project Endpoints (/api/v1/projects)', () => {
  let userToken;
  let userId;
  let testProjectId;

  beforeAll(async () => {
    // Register owner user
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Project Owner',
        email: 'owner@projects-test.dev',
        password: 'Password@123',
        role: 'member'
      });

    userToken = regRes.body.response.token;
    userId = regRes.body.response.user.id;
  });

  describe('POST /api/v1/projects', () => {
    it('should successfully create a new project', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Core Review Engine',
          description: 'Evaluating automated pull request feedback system.',
          status: 'planning'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('id');
      expect(res.body.response.name).toBe('Core Review Engine');
      testProjectId = res.body.response.id;
    });

    it('should return 422 Validation Error when project name is empty', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '',
          description: 'Missing name'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .send({ name: 'Unauthorized Project' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/projects', () => {
    it('should list projects with pagination envelope', async () => {
      const res = await request(app)
        .get('/api/v1/projects?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('list');
      expect(res.body.response).toHaveProperty('meta');
      expect(Array.isArray(res.body.response.list)).toBe(true);
      expect(res.body.response.meta.currentPage).toBe(1);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return project details and its tasks', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.id).toBe(testProjectId);
      expect(res.body.response).toHaveProperty('tasks');
    });

    it('should return 404 Not Found for non-existing project ID', async () => {
      const res = await request(app)
        .get('/api/v1/projects/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should update project attributes', async () => {
      const res = await request(app)
        .put(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Review Engine',
          status: 'in_progress'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.name).toBe('Updated Review Engine');
      expect(res.body.response.status).toBe('in_progress');
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete project by id', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app)
        .get(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(check.status).toBe(404);
    });
  });
});
