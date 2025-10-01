import request from 'supertest';
import { app } from '../server';
import { User } from '../models/User';
import { Post } from '../models/Post';
import jwt from 'jsonwebtoken';

describe('Posts Routes', () => {
  let user: User;
  let token: string;

  beforeEach(async () => {
    user = await User.create({
      email: 'posts@example.com',
      name: 'Posts User',
      role: 'user',
    });
    await user.setPassword('password123');
    await user.save();

    token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await Post.create({
        author_id: user.id,
        content: 'Test post content',
        status: 'active',
      });
    });

    it('should return paginated posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body.posts).toHaveLength(1);
    });

    it('should filter posts by search term', async () => {
      const response = await request(app)
        .get('/api/posts?search=test')
        .expect(200);

      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].content).toContain('Test');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const postData = {
        content: 'This is a new test post',
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(201);

      expect(response.body.content).toBe(postData.content);
      expect(response.body.author_id).toBe(user.id);
      expect(response.body.status).toBe('active');
    });

    it('should require authentication', async () => {
      const postData = {
        content: 'This should fail',
      };

      await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);
    });

    it('should validate content length', async () => {
      const postData = {
        content: '', // Empty content
      };

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(400);
    });
  });

  describe('GET /api/posts/:id', () => {
    let post: Post;

    beforeEach(async () => {
      post = await Post.create({
        author_id: user.id,
        content: 'Test post for retrieval',
        status: 'active',
      });
    });

    it('should return a specific post', async () => {
      const response = await request(app)
        .get(`/api/posts/${post.id}`)
        .expect(200);

      expect(response.body.id).toBe(post.id);
      expect(response.body.content).toBe(post.content);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    let post: Post;

    beforeEach(async () => {
      post = await Post.create({
        author_id: user.id,
        content: 'Original content',
        status: 'active',
      });
    });

    it('should update own post', async () => {
      const updateData = {
        content: 'Updated content',
      };

      const response = await request(app)
        .patch(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.content).toBe(updateData.content);
    });

    it('should not update other users posts', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        name: 'Other User',
        role: 'user',
      });

      const otherPost = await Post.create({
        author_id: otherUser.id,
        content: 'Other user post',
        status: 'active',
      });

      const updateData = {
        content: 'Trying to update',
      };

      await request(app)
        .patch(`/api/posts/${otherPost.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let post: Post;

    beforeEach(async () => {
      post = await Post.create({
        author_id: user.id,
        content: 'Post to delete',
        status: 'active',
      });
    });

    it('should delete own post', async () => {
      await request(app)
        .delete(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const deletedPost = await Post.findByPk(post.id);
      expect(deletedPost).toBeNull();
    });

    it('should not delete other users posts', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        name: 'Other User',
        role: 'user',
      });

      const otherPost = await Post.create({
        author_id: otherUser.id,
        content: 'Other user post',
        status: 'active',
      });

      await request(app)
        .delete(`/api/posts/${otherPost.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});