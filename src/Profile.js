import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(Cookies.get('username'));
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get username from cookies on component mount
  useEffect(() => {
    const storedUsername = Cookies.get('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProgress(storedUsername);
    } else {
      navigate('/login'); // Redirect to login if no username found in cookies
    }
  }, [navigate]);

  // Fetch user progress (Service code 3)
  const fetchUserProgress = async (username) => {
    setLoading(true);
    try {
      const response = await axios.post('/usersAPI.php', {
        serviceID: 3,
        username: username
      });
      
      if (response.data.code === 0) {
        setProgressData(response.data.progress);
      } else {
        setError(`Error fetching progress: ${response.data.message}`);
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update username (Service code 4)
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername) {
      setError('New username cannot be empty');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/usersAPI.php', {
        serviceID: 4,
        oldUsername: username,
        newUsername: newUsername
      });
      
      if (response.data.code === 0) {
        setMessage('Username updated successfully!');
        setUsername(newUsername);
        Cookies.set('username', newUsername, { expires: 7 }); // Update the cookie with new username
        setNewUsername('');
      } else {
        setError(`Error updating username: ${response.data.message}`);
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update password (Service code 5)
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/usersAPI.php', {
        serviceID: 5,
        username: username,
        oldPassword: oldPassword,
        newPassword: newPassword
      });
      
      if (response.data.code === 0) {
        setMessage('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(`Error updating password: ${response.data.message}`);
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Secure account (Service code 6)
  const handleSecureAccount = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      setError('Password is required to secure your account');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/usersAPI.php', {
        serviceID: 6,
        username: username,
        password: oldPassword
      });
      
      if (response.data.code === 0) {
        setMessage('Account secured successfully!');
        setOldPassword('');
      } else {
        setError(`Error securing account: ${response.data.message}`);
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
    
  };
  console.log(username)
  console.log(newPassword)
  console.log(newUsername)

  return (
    <div className="profile-container">
      <h1>Profile: {username}</h1>
      
      {loading && <div className="loading-spinner">Loading...</div>}
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      {/* Progress Display */}
      {progressData && (
        <div className="progress-section">
          <h2>Your Progress</h2>
          <div className="progress-details">
            {Object.entries(progressData).map(([key, value]) => (
              <div className="progress-item" key={key}>
                <span className="progress-label">{key}:</span>
                <span className="progress-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Update Username Form */}
      <div className="profile-section">
        <h2>Update Username</h2>
        <form onSubmit={handleUsernameUpdate}>
          <div className="form-group">
            <label htmlFor="newUsername">New Username:</label>
            <input
              type="text"
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>
          <button type="submit" className="update-btn">Update Username</button>
        </form>
      </div>
      
      {/* Update Password Form */}
      <div className="profile-section">
        <h2>Update Password</h2>
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password:</label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="update-btn">Update Password</button>
        </form>
      </div>
      
      {/* Secure Account Section */}
      <div className="profile-section">
        <h2>Secure Account</h2>
        <form onSubmit={handleSecureAccount}>
          <div className="form-group">
            <label htmlFor="securePassword">Enter Password:</label>
            <input
              type="password"
              id="securePassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="secure-btn">Secure Account</button>
        </form>
      </div>
    </div>
  );
}