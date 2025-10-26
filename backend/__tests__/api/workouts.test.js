const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Workout = require('../../models/Workout');
const workoutRoutes = require('../../routes/workouts');
const { protect } = require('../../middleware/auth');
const { testDb, mockUsers, generateToken } = require('../helpers');

// Create a test app
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/workouts', workoutRoutes);
  return app;
};

describe('Workout API', () => {
  let app;
  let mongoServer;
  let user;
  let token;

  beforeAll(async () => {
    mongoServer = await testDb.connect();
    app = createApp();
  });

  afterAll(async () => {
    await testDb.closeDatabase(mongoServer);
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    
    // Create a test user
    user = await User.create(mockUsers.member);
    token = generateToken(user._id, user.role);
  });

  describe('POST /api/workouts', () => {
    it('should create a new workout', async () => {
      const workoutData = {
        name: 'Morning Cardio',
        type: 'cardio',
        duration: 30,
        exercises: [
          {
            name: 'Running',
            sets: 1,
            reps: 1,
            duration: 30,
            notes: 'Warm up for 5 minutes',
          },
        ],
        caloriesBurned: 250,
        notes: 'Great workout!',
      };

      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(workoutData.name);
      expect(response.body.data.type).toBe(workoutData.type);
      expect(response.body.data.user).toBe(user._id.toString());
    });

    it('should fail without authentication', async () => {
      const workoutData = {
        name: 'Morning Cardio',
        type: 'cardio',
        duration: 30,
      };

      const response = await request(app)
        .post('/api/workouts')
        .send(workoutData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/workouts', () => {
    beforeEach(async () => {
      // Create some workouts
      await Workout.create([
        {
          user: user._id,
          name: 'Workout 1',
          type: 'cardio',
          duration: 30,
          date: new Date('2024-01-01'),
        },
        {
          user: user._id,
          name: 'Workout 2',
          type: 'strength',
          duration: 45,
          date: new Date('2024-01-02'),
        },
        {
          user: user._id,
          name: 'Workout 3',
          type: 'flexibility',
          duration: 20,
          date: new Date('2024-01-03'),
        },
      ]);
    });

    it('should get all user workouts', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    it('should filter workouts by type', async () => {
      const response = await request(app)
        .get('/api/workouts?type=cardio')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('cardio');
    });

    it('should filter workouts by date range', async () => {
      const response = await request(app)
        .get('/api/workouts?startDate=2024-01-01&endDate=2024-01-02')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/workouts?limit=2&page=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/workouts/:id', () => {
    let workout;

    beforeEach(async () => {
      workout = await Workout.create({
        user: user._id,
        name: 'Test Workout',
        type: 'cardio',
        duration: 30,
      });
    });

    it('should get workout by id', async () => {
      const response = await request(app)
        .get(`/api/workouts/${workout._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(workout.name);
    });

    it('should fail with invalid id', async () => {
      const response = await request(app)
        .get('/api/workouts/invalid_id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/workouts/:id', () => {
    let workout;

    beforeEach(async () => {
      workout = await Workout.create({
        user: user._id,
        name: 'Test Workout',
        type: 'cardio',
        duration: 30,
      });
    });

    it('should update workout', async () => {
      const updateData = {
        name: 'Updated Workout',
        duration: 45,
      };

      const response = await request(app)
        .put(`/api/workouts/${workout._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.duration).toBe(updateData.duration);
    });

    it('should not update another user workout', async () => {
      const otherUser = await User.create({
        ...mockUsers.trainer,
        email: 'other@example.com',
      });
      const otherWorkout = await Workout.create({
        user: otherUser._id,
        name: 'Other Workout',
        type: 'cardio',
        duration: 30,
      });

      const response = await request(app)
        .put(`/api/workouts/${otherWorkout._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    let workout;

    beforeEach(async () => {
      workout = await Workout.create({
        user: user._id,
        name: 'Test Workout',
        type: 'cardio',
        duration: 30,
      });
    });

    it('should delete workout', async () => {
      const response = await request(app)
        .delete(`/api/workouts/${workout._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify workout is deleted
      const deletedWorkout = await Workout.findById(workout._id);
      expect(deletedWorkout).toBeNull();
    });

    it('should not delete another user workout', async () => {
      const otherUser = await User.create({
        ...mockUsers.trainer,
        email: 'other@example.com',
      });
      const otherWorkout = await Workout.create({
        user: otherUser._id,
        name: 'Other Workout',
        type: 'cardio',
        duration: 30,
      });

      const response = await request(app)
        .delete(`/api/workouts/${otherWorkout._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);

      // Verify workout still exists
      const stillExists = await Workout.findById(otherWorkout._id);
      expect(stillExists).toBeTruthy();
    });
  });

  describe('GET /api/workouts/stats/overview', () => {
    beforeEach(async () => {
      const workouts = [
        { user: user._id, name: 'W1', type: 'cardio', duration: 30, caloriesBurned: 200 },
        { user: user._id, name: 'W2', type: 'cardio', duration: 45, caloriesBurned: 300 },
        { user: user._id, name: 'W3', type: 'strength', duration: 60, caloriesBurned: 250 },
      ];
      await Workout.create(workouts);
    });

    it('should get workout statistics', async () => {
      const response = await request(app)
        .get('/api/workouts/stats/overview')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalWorkouts).toBe(3);
      expect(response.body.data.totalDuration).toBe(135);
      expect(response.body.data.totalCalories).toBe(750);
    });
  });
});
