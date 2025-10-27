# 🏋️ FitLife Gym Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing gym memberships, payments, and user profiles with **Razorpay payment integration** for the Indian market.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 💳 Payment Integration (Razorpay)
- Multiple payment methods: UPI, Cards, NetBanking, Wallets
- Real-time payment verification with signature validation
- Payment history tracking
- Support for Indian Rupees (INR)

### 📊 Membership Management
- Three membership tiers: Basic, Premium, VIP
- Automated membership activation after payment
- Membership status tracking and expiry dates
- Personal training sessions and class bookings

### 👤 User Dashboard
- View active membership details
- Payment history
- Profile management
- Real-time updates with Socket.io

### 🎨 Modern UI/UX
- Responsive design with mobile support
- Interactive animations and transitions
- Toast notifications for user feedback
- Modern gradient designs

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Icons** - Icon library
- **React Toastify** - Notification system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Razorpay** - Payment gateway
- **Socket.io** - Real-time features
- **bcryptjs** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 7.0+ (or use Docker)
- **Docker** and **Docker Compose** (for containerized deployment)
- **Razorpay Account** (for payment processing)

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amitabha01/Full_Stack_GYM_Application.git
   cd Full_Stack_GYM_Application
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values (MongoDB, JWT secret, Razorpay keys)
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/fitlife-gym
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

   Backend will run on http://localhost:5000

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend will run on http://localhost:3000

## 🔑 Razorpay Configuration

### Get Razorpay API Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Navigate to **Settings** → **API Keys**
3. Generate **Test Keys** for development
4. Copy **Key ID** and **Key Secret**

### Test Payment Credentials

**Test Card**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)

**Test UPI**
- UPI ID: `success@razorpay`

For complete setup instructions, see [RAZORPAY_SETUP_GUIDE.md](./RAZORPAY_SETUP_GUIDE.md)

## 🐳 Docker Commands

### Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Database Management
```bash
# Access MongoDB shell
docker exec -it fitlife-mongodb mongosh -u admin -p password123

# Backup database
docker exec fitlife-mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/fitlife-gym?authSource=admin" --out=/backup
```

## 📁 Project Structure

```
Full_Stack_GYM_Application/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── membershipController.js
│   │   └── paymentController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Membership.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── memberships.js
│   │   └── payments.js
│   ├── Dockerfile
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Memberships
- `GET /api/memberships` - Get all membership plans
- `POST /api/memberships/seed` - Seed default memberships

### Payments
- `POST /api/payments/create-intent` - Create Razorpay order (protected)
- `POST /api/payments/confirm` - Verify payment signature (protected)
- `GET /api/payments/history` - Get payment history (protected)

## 🎯 Membership Tiers

| Tier | Price | Duration | Features |
|------|-------|----------|----------|
| **Basic** | ₹999 | 1 month | 3 classes/week, 24/7 access, Group classes |
| **Premium** | ₹4,999 | 6 months | 5 classes/week, 24/7 access, Group classes, 2 PT sessions, Nutrition guide |
| **VIP** | ₹8,999 | 12 months | Unlimited classes, 24/7 access, All classes, 8 PT sessions, Nutrition guide, Spa access |

## 🔒 Environment Variables

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fitlife-gym` |
| `JWT_SECRET` | Secret key for JWT | `your-super-secret-key` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `your_secret` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (public) | `rzp_test_xxxxx` |

## 🚨 Troubleshooting

**Port already in use**
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**MongoDB connection failed**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**Payment not working**
- Add real Razorpay keys to .env
- Check Razorpay dashboard for test mode

**Docker issues**
```bash
docker-compose logs backend
docker-compose up --build
docker-compose down -v
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Amitabha**
- GitHub: [@Amitabha01](https://github.com/Amitabha01)
- Repository: [Full_Stack_GYM_Application](https://github.com/Amitabha01/Full_Stack_GYM_Application)

## 📞 Support

For support and queries:
- 📧 Open an issue on GitHub
- 📖 Check [RAZORPAY_SETUP_GUIDE.md](./RAZORPAY_SETUP_GUIDE.md)
- 🌐 Visit [Razorpay Documentation](https://razorpay.com/docs/)

---

**Made with ❤️ for the fitness community** 🏋️‍♂️
