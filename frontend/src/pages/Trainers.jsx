import React from 'react';
import { FaEnvelope, FaDumbbell, FaStar } from 'react-icons/fa';
import './Trainers.css';

const Trainers = () => {
  // Mock data - in real app, this would come from the API
  const trainers = [
    {
      id: 1,
      name: 'John Smith',
      specialization: ['Strength Training', 'CrossFit'],
      rating: 4.8,
      experience: 8,
      bio: 'Certified personal trainer with a passion for helping clients achieve their fitness goals',
      avatar: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      specialization: ['Yoga', 'Pilates'],
      rating: 4.9,
      experience: 6,
      bio: 'Yoga instructor dedicated to mindful movement and holistic wellness',
      avatar: 'https://via.placeholder.com/150'
    },
    {
      id: 3,
      name: 'Mike Williams',
      specialization: ['Cardio', 'HIIT'],
      rating: 4.7,
      experience: 10,
      bio: 'High-energy trainer specializing in cardio and high-intensity workouts',
      avatar: 'https://via.placeholder.com/150'
    }
  ];

  return (
    <div className="trainers-page">
      <div className="page-header">
        <div className="container">
          <h1>Meet Our Trainers</h1>
          <p>Expert guidance from certified fitness professionals</p>
        </div>
      </div>

      <div className="container">
        <div className="trainers-grid fade-in">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="trainer-card">
              <div className="trainer-avatar">
                <img src={trainer.avatar} alt={trainer.name} />
              </div>

              <div className="trainer-info">
                <h3>{trainer.name}</h3>

                <div className="trainer-rating">
                  <FaStar className="star-icon" />
                  <span>{trainer.rating}</span>
                  <span className="experience">• {trainer.experience} years exp</span>
                </div>

                <div className="trainer-specialization">
                  {trainer.specialization.map((spec, index) => (
                    <span key={index} className="spec-badge">
                      {spec}
                    </span>
                  ))}
                </div>

                <p className="trainer-bio">{trainer.bio}</p>

                <button className="btn btn-primary w-full">
                  <FaEnvelope /> Contact Trainer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trainers;
