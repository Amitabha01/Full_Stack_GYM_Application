import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import './Classes.css';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axios.get(`/api/classes?${params.toString()}`);
      setClasses(response.data.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classId) => {
    try {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 1); // Tomorrow
      
      await axios.post('/api/bookings', {
        classId,
        bookingDate: bookingDate.toISOString(),
        timeSlot: {
          startTime: '09:00',
          endTime: '10:00'
        }
      });
      
      toast.success('Class booked successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book class';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg spinner-primary"></div>
        <p>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="classes-page">
      <div className="page-header">
        <div className="container">
          <h1>Our Classes</h1>
          <p>Find the perfect class to match your fitness goals</p>
        </div>
      </div>

      <div className="container">
        <div className="classes-filters fade-in">
          <div className="filter-group">
            <FaSearch />
            <input
              type="text"
              placeholder="Search classes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="form-control"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="form-control"
          >
            <option value="">All Categories</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="yoga">Yoga</option>
            <option value="pilates">Pilates</option>
            <option value="dance">Dance</option>
            <option value="martial-arts">Martial Arts</option>
            <option value="cycling">Cycling</option>
            <option value="swimming">Swimming</option>
            <option value="crossfit">CrossFit</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="form-control"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="classes-grid fade-in">
          {classes.length === 0 ? (
            <div className="empty-state">
              <p>No classes found matching your criteria.</p>
            </div>
          ) : (
            classes.map((classItem) => (
              <div key={classItem._id} className="class-card">
                <div className="class-image">
                  <img src={classItem.image} alt={classItem.name} />
                  <span className={`class-difficulty ${classItem.difficulty}`}>
                    {classItem.difficulty}
                  </span>
                </div>

                <div className="class-content">
                  <div className="class-category">
                    {classItem.category.replace('-', ' ')}
                  </div>
                  <h3>{classItem.name}</h3>
                  <p>{classItem.description}</p>

                  <div className="class-meta">
                    <div className="meta-item">
                      <FaClock /> {classItem.duration} min
                    </div>
                    <div className="meta-item">
                      <FaUsers /> {classItem.currentEnrollment}/{classItem.maxCapacity}
                    </div>
                  </div>

                  {classItem.trainer && (
                    <div className="class-trainer">
                      <img src={classItem.trainer.avatar} alt={classItem.trainer.name} />
                      <span>{classItem.trainer.name}</span>
                    </div>
                  )}

                  <div className="class-footer">
                    <div className="class-price">
                      {classItem.price === 0 ? 'Free' : `$${classItem.price}`}
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBookClass(classItem._id)}
                      disabled={classItem.currentEnrollment >= classItem.maxCapacity}
                    >
                      {classItem.currentEnrollment >= classItem.maxCapacity ? 'Fully Booked' : 'Book Class'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Classes;
