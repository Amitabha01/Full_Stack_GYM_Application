import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaDollarSign, FaClock, FaUsers, FaDumbbell } from 'react-icons/fa';
import './Memberships.css';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get('/api/memberships');
      setMemberships(response.data.data.memberships);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (membership) => {
    toast.info(`Subscription for ${membership.name} - Payment integration would go here`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg spinner-primary"></div>
        <p>Loading memberships...</p>
      </div>
    );
  }

  return (
    <div className="memberships-page">
      <div className="page-header">
        <div className="container">
          <h1>Membership Plans</h1>
          <p>Choose the perfect plan for your fitness journey</p>
        </div>
      </div>

      <div className="container">
        <div className="memberships-grid fade-in">
          {memberships.map((membership) => (
            <div
              key={membership._id}
              className={`membership-card ${membership.popular ? 'popular' : ''}`}
            >
              {membership.popular && (
                <div className="popular-badge">Most Popular</div>
              )}

              <div className="membership-header">
                <h3>{membership.name}</h3>
                <p className="membership-description">{membership.description}</p>
              </div>

              <div className="membership-price">
                <span className="price">${membership.price}</span>
                <span className="duration">/{membership.duration} months</span>
              </div>

              <div className="membership-features">
                {membership.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <FaCheckCircle className="check-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="membership-details">
                {membership.classesPerWeek > 0 && (
                  <div className="detail-item">
                    <FaDumbbell />
                    <span>{membership.classesPerWeek} classes/week</span>
                  </div>
                )}
                {membership.personalTrainingSessions > 0 && (
                  <div className="detail-item">
                    <FaUsers />
                    <span>{membership.personalTrainingSessions} PT sessions</span>
                  </div>
                )}
                <div className="detail-item">
                  <FaClock />
                  <span>{membership.accessHours}</span>
                </div>
              </div>

              <button
                className={`btn ${membership.popular ? 'btn-primary' : 'btn-outline'} btn-lg w-full`}
                onClick={() => handleSubscribe(membership)}
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Memberships;
