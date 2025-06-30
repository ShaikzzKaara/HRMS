import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const UpdatePassword = ({ username, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill both fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setError('');
        setTimeout(() => {
          setSuccess(false);
          setNewPassword('');
          setConfirmPassword('');
          const userWithUsername = { ...data.user, username: data.user.username || username };
          localStorage.setItem('user', JSON.stringify(userWithUsername));
          localStorage.setItem('userId', userWithUsername.id);
          if (onSuccess) onSuccess(userWithUsername);
          navigate('/post-login', { replace: true });
        }, 1200);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Change Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p style={{ color: 'green', marginTop: 8 }}>Password updated successfully!</p>}
          <button type="submit" className="login-btn">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(UpdatePassword);
