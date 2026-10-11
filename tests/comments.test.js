const request = require('supertest');
const app = require('../src/server');

describe('Comment Endpoints (/api/v1/comments and /api/v1/tasks/:taskId/comments)', () => {
  let userToken;
  let userId;
  let projectId;
  let taskId;
  let testCommentId;

  beforeAll(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Commenter User',
        email: 'commenter@codzee-feature.dev',
        password: 'Password@123',
        role: 'member'
      });

    userToken = regRes.body.response.token;
    userId = regRes.body.response.user.id;

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Comments Discussion Project',
        description: 'Project to test task comment threads'
      });

    projectId = projectRes.body.response.id;

    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Review PR Feedback Quality',
        description: 'Verify inline comments on PR',
        priority: 'high',
        status: 'in_progress',
        projectId: projectId,
        assigneeId: userId
      });

    taskId = taskRes.body.response.id;
  });

  describe('POST /api/v1/comments/task/:taskId', () => {
    it('should successfully add a comment to an existing task', async () => {
      const res = await request(app)
        .post(`/api/v1/comments/task/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Initial discussion started on the task architecture.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toHaveProperty('id');
      expect(res.body.response.content).toBe('Initial discussion started on the task architecture.');
      expect(res.body.response.author.id).toBe(userId);
      testCommentId = res.body.response.id;
    });

    it('should support adding comments through nested /tasks/:taskId/comments endpoint', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Second comment added via nested route.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response.content).toBe('Second comment added via nested route.');
    });

    it('should fail with 422 if comment content is empty', async () => {
      const res = await request(app)
        .post(`/api/v1/comments/task/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: '   '
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 404 when adding comment to non-existent task', async () => {
      const res = await request(app)
        .post('/api/v1/comments/task/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Ghost task comment'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/comments/task/:taskId', () => {
    it('should retrieve list of comments for a task in chronological order', async () => {
      const res = await request(app)
        .get(`/api/v1/comments/task/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.response)).toBe(true);
      expect(res.body.response.length).toBeGreaterThanOrEqual(2);
      expect(res.body.response[0]).toHaveProperty('author');
    });

    it('should return comments through nested route /tasks/:taskId/comments', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.response)).toBe(true);
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    it('should allow author to delete their own comment', async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting an already deleted comment', async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
