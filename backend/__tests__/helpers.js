const jwt = require('jsonwebtoken');

// Test database helper
const testDb = {
  connect: async () => {
    const mongoose = require('mongoose');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    return mongoServer;
  },
  
  closeDatabase: async (mongoServer) => {
    const mongoose = require('mongoose');
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  },
  
  clearDatabase: async () => {
    const mongoose = require('mongoose');
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  },
};

// Mock user data
const mockUsers = {
  member: {
    name: 'Test Member',
    email: 'member@test.com',
    password: 'Password123!',
    role: 'member',
  },
  trainer: {
    name: 'Test Trainer',
    email: 'trainer@test.com',
    password: 'Password123!',
    role: 'trainer',
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'Password123!',
    role: 'admin',
  },
};

// Generate JWT token for testing
const generateToken = (userId, role = 'member') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test_jwt_secret',
    { expiresIn: '1d' }
  );
};

// Create authenticated request helper
const createAuthRequest = (app, method, url, userId, role = 'member') => {
  const token = generateToken(userId, role);
  const request = require('supertest')(app);
  
  return request[method](url).set('Authorization', `Bearer ${token}`);
};

module.exports = {
  testDb,
  mockUsers,
  generateToken,
  createAuthRequest,
};
