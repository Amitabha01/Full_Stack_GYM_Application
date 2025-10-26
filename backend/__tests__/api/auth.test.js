const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const authRoutes = require('../../routes/auth');
const { testDb, mockUsers } = require('../helpers');

// Create a test app
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

describe('Auth API', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await testDb.connect();
    app = createApp();
  });

  afterAll(async () => {
    await testDb.closeDatabase(mongoServer);
  });

  afterEach(async () => {
    await testDb.clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUsers.member)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', mockUsers.member.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...mockUsers.member,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(mockUsers.member)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUsers.member)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/already exists|duplicate/i);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...mockUsers.member,
          password: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(mockUsers.member);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUsers.member.email,
          password: mockUsers.member.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', mockUsers.member.email);
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUsers.member.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/invalid|incorrect/i);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUsers.member);

      token = response.body.data.token;
      userId = response.body.data.user._id;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', mockUsers.member.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/token|unauthorized/i);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/update', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUsers.member);

      token = response.body.data.token;
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        profile: {
          height: 180,
          weight: 75,
          fitnessGoals: ['weight_loss'],
        },
      };

      const response = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.profile.height).toBe(updateData.profile.height);
    });

    it('should not update email to existing email', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send(mockUsers.trainer);

      const response = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: mockUsers.trainer.email })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
