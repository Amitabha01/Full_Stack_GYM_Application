import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaSave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/auth/profile', profileData);
      updateUser(response.data.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container fade-in">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={user?.avatar} alt={user?.name} />
            </div>
            <div className="profile-info">
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              <span className={`badge badge-${user?.role === 'admin' ? 'danger' : 'primary'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Settings
            </button>
            <button
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'profile' ? (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Update Profile</h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                      <label className="form-label">
                        <FaUser /> Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaEnvelope /> Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Avatar URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={profileData.avatar}
                        onChange={(e) =>
                          setProfileData({ ...profileData, avatar: e.target.value })
                        }
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner"></span> Updating...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save Changes
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Change Password</h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label className="form-label">
                        <FaLock /> Current Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaLock /> New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaLock /> Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner"></span> Changing...
                        </>
                      ) : (
                        <>
                          <FaSave /> Change Password
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
