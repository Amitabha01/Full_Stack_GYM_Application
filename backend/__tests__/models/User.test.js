const mongoose = require('mongoose');
const User = require('../../models/User');
const { testDb } = require('../helpers');

describe('User Model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await testDb.connect();
  });

  afterAll(async () => {
    await testDb.closeDatabase(mongoServer);
  });

  afterEach(async () => {
    await testDb.clearDatabase();
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'member',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should fail without required fields', async () => {
      const user = new User({});
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!',
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      await User.create(userData);

      let error;
      try {
        await User.create(userData);
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error
    });
  });

  describe('Password Methods', () => {
    it('should hash password before saving', async () => {
      const password = 'Password123!';
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password,
      });

      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(password.length);
    });

    it('should match correct password', async () => {
      const password = 'Password123!';
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password,
      });

      const isMatch = await user.matchPassword(password);
      expect(isMatch).toBe(true);
    });

    it('should not match incorrect password', async () => {
      const password = 'Password123!';
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password,
      });

      const isMatch = await user.matchPassword('WrongPassword123!');
      expect(isMatch).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should default to member role', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(user.role).toBe('member');
    });

    it('should accept valid roles', async () => {
      const roles = ['member', 'trainer', 'admin'];

      for (const role of roles) {
        const user = await User.create({
          name: `User ${role}`,
          email: `${role}@example.com`,
          password: 'Password123!',
          role,
        });

        expect(user.role).toBe(role);
      }
    });
  });

  describe('User Profile', () => {
    it('should have profile fields', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        profile: {
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: 180,
          weight: 75,
          fitnessGoals: ['weight_loss', 'muscle_gain'],
        },
      });

      expect(user.profile.gender).toBe('male');
      expect(user.profile.height).toBe(180);
      expect(user.profile.weight).toBe(75);
      expect(user.profile.fitnessGoals).toHaveLength(2);
    });
  });

  describe('User Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      user.name = 'Jane Doe';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
