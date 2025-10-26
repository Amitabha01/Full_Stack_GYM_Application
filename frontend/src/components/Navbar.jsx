import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaDumbbell, FaUserCircle, FaSignOutAlt, FaCalendarAlt, 
  FaRunning, FaUsers, FaTrophy, FaChartLine, FaRobot, FaMedal,
  FaBars, FaTimes, FaMoon, FaSun, FaHome, FaBook, FaCreditCard, FaUserTie
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <FaDumbbell className="brand-icon" />
          <span className="brand-text">FitLife</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-center">
          {!user && (
            <>
              <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <FaHome />
                <span>Home</span>
              </Link>
              <Link to="/classes" className={`nav-item ${isActive('/classes') ? 'active' : ''}`}>
                <FaBook />
                <span>Classes</span>
              </Link>
              <Link to="/memberships" className={`nav-item ${isActive('/memberships') ? 'active' : ''}`}>
                <FaCreditCard />
                <span>Memberships</span>
              </Link>
              <Link to="/trainers" className={`nav-item ${isActive('/trainers') ? 'active' : ''}`}>
                <FaUserTie />
                <span>Trainers</span>
              </Link>
            </>
          )}
          
          {user && (
            <>
              <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                <FaCalendarAlt />
                <span>Dashboard</span>
              </Link>
              <Link to="/workouts" className={`nav-item ${isActive('/workouts') ? 'active' : ''}`}>
                <FaRunning />
                <span>Workouts</span>
              </Link>
              <Link to="/social" className={`nav-item ${isActive('/social') ? 'active' : ''}`}>
                <FaUsers />
                <span>Community</span>
              </Link>
              <Link to="/challenges" className={`nav-item ${isActive('/challenges') ? 'active' : ''}`}>
                <FaTrophy />
                <span>Challenges</span>
              </Link>
              <Link to="/analytics" className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}>
                <FaChartLine />
                <span>Analytics</span>
              </Link>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {user ? (
            <>
              <div className="user-menu-desktop">
                <Link to="/ai-recommendations" className={`action-btn ${isActive('/ai-recommendations') ? 'active' : ''}`}>
                  <FaRobot />
                  <span>AI Coach</span>
                </Link>
                <Link to="/achievements" className={`action-btn ${isActive('/achievements') ? 'active' : ''}`}>
                  <FaMedal />
                  <span>Achievements</span>
                </Link>
                <Link to="/profile" className={`action-btn ${isActive('/profile') ? 'active' : ''}`}>
                  <FaUserCircle />
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Join Now
              </Link>
            </div>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {!user && (
            <>
              <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaHome />
                <span>Home</span>
              </Link>
              <Link to="/classes" className={`mobile-nav-item ${isActive('/classes') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaBook />
                <span>Classes</span>
              </Link>
              <Link to="/memberships" className={`mobile-nav-item ${isActive('/memberships') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaCreditCard />
                <span>Memberships</span>
              </Link>
              <Link to="/trainers" className={`mobile-nav-item ${isActive('/trainers') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaUserTie />
                <span>Trainers</span>
              </Link>
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn-login" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn-register" onClick={closeMobileMenu}>
                  Join Now
                </Link>
              </div>
            </>
          )}
          
          {user && (
            <>
              <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaCalendarAlt />
                <span>Dashboard</span>
              </Link>
              <Link to="/workouts" className={`mobile-nav-item ${isActive('/workouts') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaRunning />
                <span>Workouts</span>
              </Link>
              <Link to="/social" className={`mobile-nav-item ${isActive('/social') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaUsers />
                <span>Community</span>
              </Link>
              <Link to="/challenges" className={`mobile-nav-item ${isActive('/challenges') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaTrophy />
                <span>Challenges</span>
              </Link>
              <Link to="/analytics" className={`mobile-nav-item ${isActive('/analytics') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaChartLine />
                <span>Analytics</span>
              </Link>
              <Link to="/ai-recommendations" className={`mobile-nav-item ${isActive('/ai-recommendations') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaRobot />
                <span>AI Coach</span>
              </Link>
              <Link to="/achievements" className={`mobile-nav-item ${isActive('/achievements') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaMedal />
                <span>Achievements</span>
              </Link>
              <Link to="/profile" className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <FaUserCircle />
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;
