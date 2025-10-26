// Global test setup
const mongoose = require('mongoose');

// Set test timeout
jest.setTimeout(30000);

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
