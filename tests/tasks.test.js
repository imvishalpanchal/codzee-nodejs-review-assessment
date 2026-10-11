const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/config/database/prismaClient');

describe('Task Endpoints (/api/v1/tasks)', () => {
  let userToken;
  let userId;
  let projectId;
  let testTaskId;

  beforeAll(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Task Tester',
        email: 'taskmaster@codzee-tasks.dev',
        password: 'Password@123',
        role: 'member'
      });

    userToken = regRes.body.response.token;
    userId = regRes.body.response.user.id;

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Task Integration Testing Project',
        description: 'For testing task lifecycle'
      });

    projectId = projectRes.body.response.id;
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a task under a valid project', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Automate PR Webhook Handling',
          description: 'Set up payload verifier for GitHub PR webhooks',
          priority: 'high',
          status: 'todo',
          projectId: projectId,
          assigneeId: userId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('id');
      expect(res.body.response.title).toBe('Automate PR Webhook Handling');
      expect(res.body.response.projectId).toBe(projectId);
      testTaskId = res.body.response.id;
    });

    it('should fail 422 if task title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'No title',
          projectId: projectId
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail 404 if assigned project does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Ghost Task',
          projectId: 999999
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should retrieve list of tasks with pagination and filter', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks?projectId=${projectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('list');
      expect(res.body.response).toHaveProperty('meta');
      expect(res.body.response.list.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should retrieve specific task details', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.id).toBe(testTaskId);
      expect(res.body.response.title).toBe('Automate PR Webhook Handling');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .get('/api/v1/tasks/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update task status and priority', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'in_progress',
          priority: 'urgent'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.status).toBe('in_progress');
      expect(res.body.response.priority).toBe('urgent');
    });

    it('should fail with 422 on invalid status value', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'invalid_status_value'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task by ID', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app)
        .get(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(check.status).toBe(404);
    });
  });
});
