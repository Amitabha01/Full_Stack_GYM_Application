# 🏋️ FitLife Gym - Full Stack MERN Application

[![Tests](https://img.shields.io/badge/tests-implemented-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-50%25+-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

> A comprehensive gym management and fitness tracking application built with the MERN stack, featuring real-time updates, AI-powered recommendations, social features, gamification, and extensive testing.

## � Features

### Member Features
- **User Authentication**: Secure JWT-based authentication with role-based access control (member/trainer/admin)
- **Class Booking**: Browse and book fitness classes with real-time availability
- **Workout Tracking**: Log workouts with exercises, sets, reps, and calories burned
- **Nutrition Plans**: Access personalized nutrition plans created by trainers
- **Progress Tracking**: Monitor fitness goals and member progress over time
- **Membership Management**: View and manage membership plans (Basic, Premium, VIP)
- **Trainer Profiles**: Browse trainer specializations, ratings, and book sessions

### Advanced Features
- 🤖 **AI Workout Recommendations** - Personalized workout suggestions based on user profile and goals
- 👥 **Social Feed** - Share progress, like and comment on posts, follow other members
- 🏆 **Challenges & Competitions** - Join challenges, compete on leaderboards
- 📈 **Advanced Analytics** - Comprehensive charts and statistics with Recharts
- 🎥 **Video Tutorials** - Access exercise demonstration videos
- 🔔 **Real-time Notifications** - Socket.io powered live updates
- 🎮 **Gamification** - Earn points, badges, and level up through achievements

### UI/UX Features
- 🌓 **Dark Mode** - Professional dark theme with smooth transitions and custom effects
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- ✨ **Modern Animations** - Smooth gradients, hover effects, glow animations
- 🎨 **Custom Scrollbar** - Styled scrollbars matching the theme
- 💫 **Advanced Effects** - Glass-morphism, 3D transforms, gradient shifts

### Trainer Features
- **Class Management**: Create and manage fitness classes
- **Member Progress**: Track and update member progress
- **Nutrition Planning**: Create custom nutrition plans for members
- **Workout Templates**: Create workout templates for members

### Admin Features
- **Dashboard Analytics**: View gym statistics and metrics
- **Membership Plans**: Create and manage membership tiers
- **User Management**: Manage members, trainers, and their access

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Vite 7** - Build tool and dev server with HMR
- **Axios** - HTTP client
- **Recharts** - Data visualization and analytics charts
- **Socket.io Client** - Real-time communication
- **React Icons** - Comprehensive icon library
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time engine for live updates
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Secure password hashing
- **Stripe** - Payment processing integration

### Testing & Quality Assurance
- **Jest** - Backend testing framework
- **Supertest** - HTTP assertion library for API testing
- **Vitest** - Lightning-fast frontend testing powered by Vite
- **React Testing Library** - Component and integration testing
- **MongoDB Memory Server** - In-memory database for tests
- **Babel** - JavaScript transpiler for ES modules in tests
- **Coverage Reports** - Comprehensive test coverage tracking

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Redis** - Caching layer and session storage
- **RabbitMQ** - Message broker for async operations
- **Nginx** - Reverse proxy and load balancing (production)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd my_fullstack_project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitlife_gym
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Start MongoDB
```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using brew (Mac)
brew services start mongodb-community

# Or run directly
mongod
```

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3002`

## 🧪 Testing

### Why Testing Matters
This project includes comprehensive testing to ensure:
- ✅ Code quality and reliability
- ✅ Catch bugs before production
- ✅ Safe refactoring and feature additions
- ✅ Documentation through test examples
- ✅ Confidence for recruiters and hiring managers

### Backend Testing

**Run all backend tests:**
```bash
cd backend
npm test
```

**Watch mode (for TDD):**
```bash
npm run test:watch
```

**Generate coverage report:**
```bash
npm run test:coverage
```

Coverage report will be available at: `backend/coverage/index.html`

**Test Structure:**
- `__tests__/models/` - Unit tests for Mongoose models
- `__tests__/api/` - Integration tests for API endpoints
- `__tests__/helpers.js` - Test utilities and mock data
- `__tests__/setup.js` - Global test configuration

**Example Backend Tests:**
- ✅ User model validation and password hashing
- ✅ Authentication endpoints (register, login, token validation)
- ✅ Workout CRUD operations
- ✅ Class booking system
- ✅ Role-based access control
- ✅ Error handling and edge cases

### Frontend Testing

**Run all frontend tests:**
```bash
cd frontend
npm test
```

**Watch mode:**
```bash
npm run test:watch
```

**Interactive UI:**
```bash
npm run test:ui
```

**Generate coverage:**
```bash
npm run test:coverage
```

Coverage report will be available at: `frontend/coverage/index.html`

**Test Structure:**
- `src/__tests__/components/` - Component tests
- `src/__tests__/pages/` - Page/route tests
- `src/__tests__/utils.jsx` - Test utilities and custom renderers
- `src/__tests__/setup.js` - Global test setup

**Example Frontend Tests:**
- ✅ Navbar rendering for authenticated/unauthenticated users
- ✅ Login form validation and submission
- ✅ Dark mode toggle functionality
- ✅ Protected route access control
- ✅ Component props and user interactions

### Test Coverage Goals

| Category | Target | Current Status |
|----------|--------|----------------|
| Backend Models | 80%+ | ✅ Implemented |
| Backend API | 70%+ | ✅ Implemented |
| Frontend Components | 60%+ | ✅ Implemented |
| Frontend Pages | 60%+ | ✅ Implemented |
| Overall | 50%+ | ✅ Achieved |

### Testing Best Practices Used

1. **Isolation** - Tests don't depend on each other
2. **In-Memory Database** - Fast, isolated backend tests
3. **Mock Data** - Consistent test fixtures
4. **Cleanup** - Proper teardown after each test
5. **Descriptive Names** - Clear test descriptions
6. **Arrange-Act-Assert** - Structured test patterns
7. **Coverage Reports** - Track untested code

## 📁 Project Structure

```
my_fullstack_project/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── taskController.js     # Class management (transformed)
│   │   ├── bookingController.js  # Booking management
│   │   ├── workoutController.js  # Workout tracking
│   │   └── membershipController.js # Membership plans
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── validation.js        # Request validation
│   ├── models/
│   │   ├── User.js              # User/Member/Trainer schema
│   │   ├── Class.js             # Fitness class schema
│   │   ├── Booking.js           # Class booking schema
│   │   ├── Workout.js           # Workout log schema
│   │   ├── NutritionPlan.js     # Nutrition plan schema
│   │   ├── Membership.js        # Membership plan schema
│   │   └── MemberProgress.js    # Progress tracking schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── tasks.js             # Class routes (transformed)
│   │   ├── bookings.js          # Booking routes
│   │   ├── workouts.js          # Workout routes
│   │   └── memberships.js       # Membership routes
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Express app entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation component
    │   │   └── PrivateRoute.jsx # Protected route wrapper
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page
    │   │   ├── Home.css
    │   │   ├── Classes.jsx      # Class browsing & booking
    │   │   ├── Classes.css
    │   │   ├── Memberships.jsx  # Membership plans
    │   │   ├── Memberships.css
    │   │   ├── Trainers.jsx     # Trainer profiles
    │   │   ├── Trainers.css
    │   │   ├── WorkoutTracker.jsx # Workout logging
    │   │   ├── WorkoutTracker.css
    │   │   ├── Dashboard.jsx    # User dashboard
    │   │   ├── Profile.jsx      # User profile
    │   │   ├── Login.jsx        # Login page
    │   │   └── Register.jsx     # Registration page
    │   ├── App.jsx              # Main app component
    │   ├── App.css              # Global styles
    │   └── main.jsx             # React entry point
    ├── .env                     # Environment variables
    ├── package.json
    └── vite.config.js           # Vite configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Classes
- `GET /api/classes` - Get all classes (with filters)
- `GET /api/classes/:id` - Get single class
- `POST /api/classes` - Create class (trainer/admin)
- `PUT /api/classes/:id` - Update class (trainer/admin)
- `DELETE /api/classes/:id` - Delete class (admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/stats` - Get booking statistics
- `POST /api/bookings` - Book a class
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Workouts
- `GET /api/workouts` - Get user workouts
- `GET /api/workouts/stats` - Get workout statistics
- `POST /api/workouts` - Log a workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Memberships
- `GET /api/memberships` - Get all membership plans
- `GET /api/memberships/:id` - Get single plan
- `POST /api/memberships` - Create plan (admin)
- `PUT /api/memberships/:id` - Update plan (admin)
- `DELETE /api/memberships/:id` - Delete plan (admin)

## 🎨 Features Breakdown

### Class Management
- Filter by category (Cardio, Strength, Yoga, Pilates, Dance, etc.)
- Filter by difficulty (Beginner, Intermediate, Advanced)
- Real-time capacity tracking
- Class scheduling with time slots
- Trainer assignment

### Workout Tracking
- Log exercise details (sets, reps, weight)
- Track workout duration and calories
- Categorize by workout type
- Progress statistics and charts
- Feeling/energy level tracking

### Membership System
- Multiple tiers (Basic, Premium, VIP)
- Feature-based pricing
- Class and PT session limits
- Access hours management
- Renewal tracking

### User Roles
- **Member**: Book classes, log workouts, view nutrition plans
- **Trainer**: Create classes, track member progress, create nutrition plans
- **Admin**: Full access to all features and user management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based authorization
- Protected API routes
- Input validation and sanitization
- CORS configuration

## 🐛 Troubleshooting

### File Watcher Error (ENOSPC)
If you encounter file watcher errors on Linux:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### MongoDB Connection Error
Ensure MongoDB is running:
```bash
sudo systemctl status mongod
```

### Port Already in Use
Change the port in `.env` files or kill the process:
```bash
# Find process using port 5000
lsof -ti:5000
# Kill the process
kill -9 <PID>
```

## 📝 Development Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Update `MONGODB_URI` to production database
3. Use a strong `JWT_SECRET`
4. Deploy to platforms like Heroku, Railway, or AWS

### Frontend
1. Update `VITE_API_URL` to production backend URL
2. Run `npm run build`
3. Deploy `dist/` folder to Netlify, Vercel, or similar

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built with ❤️ for fitness enthusiasts and gym management.

## 🙏 Acknowledgments

- MongoDB documentation
- React documentation
- Express.js documentation
- Vite documentation
