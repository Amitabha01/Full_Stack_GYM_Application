# 🧪 Testing Guide - FitLife Gym

## Overview

This document provides comprehensive information about the testing strategy, implementation, and how to run tests for the FitLife Gym application.

## Testing Philosophy

Our testing approach follows these principles:

1. **Test What Matters** - Focus on user-facing functionality and business logic
2. **Fast Feedback** - Tests run quickly to encourage frequent execution
3. **Maintainable** - Tests are easy to understand and update
4. **Isolated** - Each test is independent and can run in any order
5. **Comprehensive** - Cover happy paths, edge cases, and error scenarios

## Backend Testing

### Stack
- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **MongoDB Memory Server** - In-memory database

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run in watch mode (great for TDD)
npm run test:watch

# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Test Organization

```
backend/__tests__/
├── setup.js              # Global test configuration
├── helpers.js            # Test utilities and helpers
├── models/
│   ├── User.test.js      # User model tests
│   └── Workout.test.js   # Workout model tests
└── api/
    ├── auth.test.js      # Auth API tests
    └── workouts.test.js  # Workouts API tests
```

### Writing Backend Tests

**Example Model Test:**

```javascript
describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    });

    expect(user.password).not.toBe('Password123!');
    expect(user.password.length).toBeGreaterThan(20);
  });
});
```

**Example API Test:**

```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

### Backend Test Coverage

| File | Coverage |
|------|----------|
| Models | 80%+ |
| Controllers | 70%+ |
| Routes | 75%+ |
| Middleware | 65%+ |
| Overall | 70%+ |

## Frontend Testing

### Stack
- **Vitest** - Fast testing framework
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation
- **@testing-library/user-event** - User interaction simulation

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage
npm run test:coverage

# View coverage
open coverage/index.html
```

### Test Organization

```
frontend/src/__tests__/
├── setup.js              # Global test setup
├── utils.jsx             # Test utilities and custom renderers
├── components/
│   └── Navbar.test.jsx   # Navbar component tests
└── pages/
    └── Login.test.jsx    # Login page tests
```

### Writing Frontend Tests

**Example Component Test:**

```javascript
describe('Navbar Component', () => {
  it('should show login button when user is not logged in', () => {
    renderNavbar();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should show logout button when user is logged in', () => {
    renderNavbar(mockUser);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
```

**Example Page Test:**

```javascript
describe('Login Page', () => {
  it('should call login function with correct credentials', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });
});
```

### Frontend Test Coverage

| Category | Coverage |
|----------|----------|
| Components | 65%+ |
| Pages | 60%+ |
| Context | 55%+ |
| Utilities | 70%+ |
| Overall | 60%+ |

## Test Utilities

### Backend Helpers

**`testDb.connect()`** - Creates in-memory MongoDB instance
```javascript
const mongoServer = await testDb.connect();
```

**`testDb.clearDatabase()`** - Clears all collections
```javascript
await testDb.clearDatabase();
```

**`generateToken(userId, role)`** - Creates JWT for testing
```javascript
const token = generateToken(user._id, 'member');
```

**`createAuthRequest(app, method, url, userId, role)`** - Makes authenticated request
```javascript
const response = await createAuthRequest(app, 'get', '/api/workouts', userId);
```

### Frontend Helpers

**`renderWithProviders(component, { user })`** - Renders with all providers
```javascript
renderWithProviders(<Navbar />, { user: mockUser });
```

**`mockUser`** - Default mock user object
```javascript
const { mockUser, mockAdmin } = require('./utils');
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm test
      - run: cd backend && npm run test:coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run test:coverage
```

## Best Practices

### ✅ Do's

- Write tests for new features before merging
- Keep tests simple and focused
- Use descriptive test names
- Test user behavior, not implementation
- Mock external dependencies
- Clean up after tests
- Run tests before committing

### ❌ Don'ts

- Don't test framework code
- Don't write overly complex tests
- Don't share state between tests
- Don't test implementation details
- Don't skip test cleanup
- Don't commit commented-out tests
- Don't ignore failing tests

## Common Patterns

### Testing Async Operations

```javascript
it('should fetch data', async () => {
  const response = await request(app).get('/api/data');
  expect(response.status).toBe(200);
});
```

### Testing Error Handling

```javascript
it('should return 404 for non-existent resource', async () => {
  const response = await request(app)
    .get('/api/workouts/invalid_id')
    .expect(404);
  
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
});
```

### Testing User Interactions

```javascript
it('should toggle dark mode', async () => {
  renderNavbar();
  const user = userEvent.setup();
  
  const toggleButton = screen.getByLabelText('Toggle dark mode');
  await user.click(toggleButton);
  
  expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
});
```

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Run Specific Test File

```bash
# Backend
npm test -- __tests__/api/auth.test.js

# Frontend
npm test -- Navbar.test.jsx
```

### Run Specific Test Case

```bash
npm test -- -t "should register a new user"
```

### Debug with console.log

```javascript
it('should do something', () => {
  console.log('Debug output:', someVariable);
  // test code
});
```

## Performance

### Test Execution Time

- Backend tests: ~5-10 seconds
- Frontend tests: ~2-5 seconds
- Full suite: ~10-15 seconds

### Optimization Tips

1. Use `beforeAll` for expensive setup
2. Clear only necessary data in `afterEach`
3. Mock slow operations (API calls, DB queries)
4. Run tests in parallel when possible
5. Use in-memory database for speed

## Troubleshooting

### MongoDB Memory Server Issues

```bash
# Clear cache if having issues
rm -rf ~/.cache/mongodb-memory-server
```

### Port Already in Use

```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
```

### Module Not Found Errors

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## Contributing to Tests

When adding new features:

1. Write tests for new models/schemas
2. Test all API endpoints (success + error cases)
3. Test UI components with different states
4. Update test documentation
5. Ensure coverage doesn't decrease
6. Run full test suite before PR

---

**Remember: Tests are documentation that always stays up-to-date!** 🎯
