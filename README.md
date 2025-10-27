# FitLife Gym Management System 🏋️‍♂️

> A modern, full-stack gym management application built with the MERN stack, featuring integrated payment processing through Razorpay for the Indian market.

[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-18+-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 About

FitLife is a comprehensive gym management solution that streamlines membership management, payment processing, and user engagement. Built with modern web technologies, it offers a seamless experience for both gym administrators and members.

### Why FitLife?

- **Payment Integration**: Native support for Razorpay with UPI, cards, net banking, and wallet payments
- **Real-time Updates**: Live notifications and updates using Socket.io
- **Containerized Deployment**: Production-ready Docker setup for easy deployment
- **Modern Architecture**: Clean, maintainable code following industry best practices
- **Mobile Responsive**: Works perfectly on all devices

## ✨ Key Features

### For Members
- 🔐 Secure authentication with JWT tokens
- 💳 Multiple payment options (UPI, Cards, Net Banking, Wallets)
- 📊 View membership status and payment history
- �� Manage personal profile and preferences
- 🔔 Real-time notifications

### For Administrators
- 📈 Track memberships and payments
- 👥 Manage user accounts
- 💰 Monitor revenue and transactions
- 🎯 Flexible membership tier management

### Technical Highlights
- **Secure Payments**: Razorpay integration with signature verification
- **Real-time Communication**: Socket.io for instant updates
- **Responsive Design**: Beautiful UI that works on any screen size
- **Containerized**: Docker and Docker Compose for easy deployment
- **Production Ready**: Environment-based configuration

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- MongoDB (v7.0 or higher) or Docker
- A Razorpay account ([Sign up here](https://dashboard.razorpay.com/signup))

### Installation

#### Quick Start with Docker (Recommended)

The fastest way to get FitLife running is using Docker:

```bash
# Clone the repository
git clone https://github.com/Amitabha01/Full_Stack_GYM_Application.git
cd Full_Stack_GYM_Application

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Razorpay keys

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

That's it! The application will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

#### Manual Setup

If you prefer to run without Docker:

**Backend Setup**

```bash
cd backend
npm install

# Create .env file with your configuration
cp .env.example .env

# Start the server
npm start
```

**Frontend Setup**

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start the dev server
npm run dev
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitlife-gym
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

### Razorpay Setup

1. Create an account at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Navigate to Settings → API Keys
3. Generate test keys for development
4. Add the keys to your `.env` files

**Test Payment Details:**
- **Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **UPI ID**: success@razorpay

For detailed Razorpay integration guide, see [RAZORPAY_SETUP_GUIDE.md](./RAZORPAY_SETUP_GUIDE.md)

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Axios** - Promise-based HTTP client
- **Socket.io Client** - Real-time features
- **React Toastify** - Beautiful notifications

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Secure authentication
- **Razorpay SDK** - Payment processing
- **Socket.io** - WebSocket communication
- **bcryptjs** - Password encryption

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Production web server
- **MongoDB** - Database container

## 📂 Project Structure

```
Full_Stack_GYM_Application/
│
├── backend/                  # Node.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Business logic
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   ├── Dockerfile           # Backend container config
│   └── server.js            # Entry point
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   └── App.jsx          # Root component
│   ├── Dockerfile           # Frontend container config
│   └── nginx.conf           # Nginx configuration
│
├── docker-compose.yml       # Multi-container setup
└── .env.example             # Environment template
```

## 🎯 Membership Plans

| Plan | Price | Duration | Benefits |
|------|-------|----------|----------|
| **Basic** | ₹999 | 1 month | 3 classes/week, 24/7 gym access, Group fitness classes |
| **Premium** | ₹4,999 | 6 months | 5 classes/week, All Basic features, 2 PT sessions, Nutrition consultation |
| **VIP** | ₹8,999 | 12 months | Unlimited classes, All Premium features, 8 PT sessions, Spa access, Priority booking |

## 🔌 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register    # Create new user account
POST   /api/auth/login        # User login
GET    /api/auth/me           # Get current user (protected)
```

### Membership Endpoints

```
GET    /api/memberships       # List all membership plans
POST   /api/memberships/seed  # Initialize default plans
```

### Payment Endpoints

```
POST   /api/payments/create-intent    # Create Razorpay order (protected)
POST   /api/payments/confirm          # Verify payment (protected)
GET    /api/payments/history          # User payment history (protected)
POST   /api/payments/webhook          # Razorpay webhooks
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose stop

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## 🛠️ Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build locally
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**MongoDB Connection Issues**
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Verify network connectivity

**Payment Integration Issues**
- Verify Razorpay keys are correct
- Check if using test mode keys in development
- Review Razorpay dashboard for payment status

**Docker Issues**
```bash
# View container logs
docker-compose logs backend

# Restart specific service
docker-compose restart backend

# Rebuild containers
docker-compose up --build
```

## 🔐 Security

- JWT tokens for secure authentication
- Password hashing with bcrypt (10 salt rounds)
- Environment-based configuration
- Razorpay signature verification for payments
- Protected API routes with middleware
- CORS configuration for cross-origin requests

## 🚀 Deployment

### Docker Deployment

The application includes production-ready Docker configurations:

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `MONGODB_URI` to production database
3. Use strong `JWT_SECRET`
4. Configure Razorpay live keys
5. Build frontend: `npm run build`
6. Deploy using your preferred hosting service

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Amitabha**

- GitHub: [@Amitabha01](https://github.com/Amitabha01)
- Project: [FitLife Gym Application](https://github.com/Amitabha01/Full_Stack_GYM_Application)

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/) for the powerful database
- [Razorpay](https://razorpay.com/) for seamless payment integration
- [React](https://reactjs.org/) for the amazing frontend library
- [Express](https://expressjs.com/) for the robust backend framework
- The open-source community for inspiration and support

## 📞 Support

Need help? Here's how to get support:

- 📖 Check the [Razorpay Setup Guide](./RAZORPAY_SETUP_GUIDE.md)
- 🐛 Open an [Issue](https://github.com/Amitabha01/Full_Stack_GYM_Application/issues)
- 💬 Start a [Discussion](https://github.com/Amitabha01/Full_Stack_GYM_Application/discussions)
- 📧 Contact via GitHub

---

<div align="center">

**Made with ❤️ for fitness enthusiasts**

⭐ Star this repo if you find it helpful!

</div>
