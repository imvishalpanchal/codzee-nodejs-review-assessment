const request = require('supertest');
const app = require('../src/server');

describe('Pagination Edge Cases and Task Status Lifecycle Suite', () => {
  let userToken;
  let projectId;
  let taskId;

  beforeAll(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Lifecycle Tester',
        email: 'lifecycle@codzee-pr3.dev',
        password: 'Password@123',
        role: 'member'
      });

    userToken = regRes.body.response.token;

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Lifecycle & Pagination Testing Project',
        description: 'Verify state machine and pagination caps'
      });

    projectId = projectRes.body.response.id;

    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Initial Lifecycle Task',
        description: 'Verify transitions',
        priority: 'high',
        status: 'todo',
        projectId: projectId
      });

    taskId = taskRes.body.response.id;
  });

  describe('Pagination Edge Cases', () => {
    it('should clamp limit to max 100 when client requests limit=5000', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?limit=5000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.response.meta.limit).toBe(100);
      expect(res.body.response.meta.itemsPerPage).toBe(100);
    });

    it('should gracefully handle invalid page and limit inputs like negative numbers or strings', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?page=-5&limit=abc')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.response.meta.currentPage).toBe(1);
      expect(res.body.response.meta.limit).toBe(10);
    });

    it('should return 400 Bad Request for non-numeric task ID instead of 500 error', async () => {
      const res = await request(app)
        .get('/api/v1/tasks/invalid-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid task ID');
    });
  });

  describe('Task Status Lifecycle State Machine', () => {
    it('should allow valid sequential progression: todo -> in_progress -> in_review -> done', async () => {
      const step1 = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'in_progress' });
      expect(step1.status).toBe(200);
      expect(step1.body.response.status).toBe('in_progress');

      const step2 = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'in_review' });
      expect(step2.status).toBe(200);
      expect(step2.body.response.status).toBe('in_review');

      const step3 = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'done' });
      expect(step3.status).toBe(200);
      expect(step3.body.response.status).toBe('done');
    });

    it('should reject invalid state jump like todo directly to done', async () => {
      const newTaskRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Direct Done Jump Test Task',
          status: 'todo',
          projectId: projectId
        });
      const newTaskId = newTaskRes.body.response.id;

      const illegalRes = await request(app)
        .put(`/api/v1/tasks/${newTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'done' });

      expect(illegalRes.status).toBe(400);
      expect(illegalRes.body.success).toBe(false);
      expect(illegalRes.body.error.message).toContain('Cannot transition task status directly');
    });
  });
});
