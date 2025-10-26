import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaUsers, FaClock, FaTrophy, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FaDumbbell />,
      title: 'Modern Equipment',
      description: 'State-of-the-art fitness equipment for all your workout needs'
    },
    {
      icon: <FaUsers />,
      title: 'Expert Trainers',
      description: 'Certified professionals to guide your fitness journey'
    },
    {
      icon: <FaClock />,
      title: '24/7 Access',
      description: 'Work out on your schedule with round-the-clock gym access'
    },
    {
      icon: <FaTrophy />,
      title: 'Achieve Goals',
      description: 'Personalized programs designed to help you reach your fitness goals'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title fade-in">Transform Your Body, Transform Your Life</h1>
          <p className="hero-subtitle fade-in">
            Join FitLife Gym and embark on your journey to a healthier, stronger you
          </p>
          <div className="hero-cta fade-in">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Your Journey <FaArrowRight />
            </Link>
            <Link to="/classes" className="btn btn-outline btn-lg">
              View Classes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose FitLife Gym?</h2>
            <p>Everything you need to achieve your fitness goals</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card fade-in">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Expert Trainers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Weekly Classes</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Fitness Journey?</h2>
            <p>Join thousands of members who have transformed their lives at FitLife Gym</p>
            <div className="cta-benefits">
              <div className="benefit">
                <FaCheckCircle /> No joining fee
              </div>
              <div className="benefit">
                <FaCheckCircle /> Free trial class
              </div>
              <div className="benefit">
                <FaCheckCircle /> Flexible membership plans
              </div>
            </div>
            <Link to="/memberships" className="btn btn-primary btn-lg">
              View Membership Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
