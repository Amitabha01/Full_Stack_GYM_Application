import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content fade-in">
        <FaExclamationTriangle className="not-found-icon" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
