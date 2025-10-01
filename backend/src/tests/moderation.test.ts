import request from 'supertest';
import { app } from '../server';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Flag } from '../models/Flag';
import jwt from 'jsonwebtoken';

describe('Moderation Routes', () => {
  let user: User;
  let moderator: User;
  let post: Post;
  let flag: Flag;
  let userToken: string;
  let moderatorToken: string;

  beforeEach(async () => {
    // Create regular user
    user = await User.create({
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user',
    });

    // Create moderator
    moderator = await User.create({
      email: 'moderator@example.com',
      name: 'Moderator User',
      role: 'moderator',
    });

    // Create post
    post = await Post.create({
      author_id: user.id,
      content: 'Test post content',
      status: 'active',
    });

    // Create flag
    flag = await Flag.create({
      post_id: post.id,
      flagged_by: user.id,
      reason_category: 'spam',
      reason_text: 'This looks like spam',
      status: 'pending',
    });

    // Generate tokens
    userToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    moderatorToken = jwt.sign(
      { userId: moderator.id, email: moderator.email, role: moderator.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/moderation/queue', () => {
    it('should return moderation queue for moderators', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('flags');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.flags).toHaveLength(1);
    });

    it('should deny access to regular users', async () => {
      await request(app)
        .get('/api/moderation/queue')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/moderation/queue?status=pending')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      expect(response.body.flags).toHaveLength(1);
      expect(response.body.flags[0].status).toBe('pending');
    });
  });

  describe('GET /api/moderation/:flagId', () => {
    it('should return flag details for moderators', async () => {
      const response = await request(app)
        .get(`/api/moderation/${flag.id}`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      expect(response.body.id).toBe(flag.id);
      expect(response.body.reason_category).toBe('spam');
    });

    it('should return 404 for non-existent flag', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .get(`/api/moderation/${fakeId}`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(404);
    });
  });

  describe('POST /api/moderation/:flagId/action', () => {
    it('should approve a flag', async () => {
      const actionData = {
        action: 'approve',
        reason: 'Content is appropriate',
      };

      const response = await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send(actionData)
        .expect(200);

      expect(response.body.message).toContain('approved');

      // Check that flag status was updated
      const updatedFlag = await Flag.findByPk(flag.id);
      expect(updatedFlag?.status).toBe('approved');
    });

    it('should remove a flag', async () => {
      const actionData = {
        action: 'remove',
        reason: 'Content violates community guidelines',
      };

      const response = await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send(actionData)
        .expect(200);

      expect(response.body.message).toContain('removed');

      // Check that flag and post status were updated
      const updatedFlag = await Flag.findByPk(flag.id);
      const updatedPost = await Post.findByPk(post.id);
      expect(updatedFlag?.status).toBe('removed');
      expect(updatedPost?.status).toBe('removed');
    });

    it('should escalate a flag', async () => {
      const actionData = {
        action: 'escalate',
        reason: 'Requires senior review',
      };

      const response = await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send(actionData)
        .expect(200);

      expect(response.body.message).toContain('escalated');

      // Check that flag status was updated
      const updatedFlag = await Flag.findByPk(flag.id);
      expect(updatedFlag?.status).toBe('escalated');
    });

    it('should not allow action on already processed flag', async () => {
      // First action
      await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ action: 'approve', reason: 'First action' });

      // Second action should fail
      await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ action: 'remove', reason: 'Second action' })
        .expect(400);
    });

    it('should validate action type', async () => {
      const actionData = {
        action: 'invalid_action',
        reason: 'Test reason',
      };

      await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send(actionData)
        .expect(400);
    });
  });

  describe('GET /api/moderation/logs', () => {
    it('should return moderation logs for moderators', async () => {
      // Create a moderation action first
      await request(app)
        .post(`/api/moderation/${flag.id}/action`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ action: 'approve', reason: 'Test action' });

      const response = await request(app)
        .get('/api/moderation/logs')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body.logs).toHaveLength(1);
      expect(response.body.logs[0].action).toBe('approve');
    });

    it('should deny access to regular users', async () => {
      await request(app)
        .get('/api/moderation/logs')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});