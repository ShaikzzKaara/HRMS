import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useUser } from './App';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHrLogin, setShowHrLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hrUsername, setHrUsername] = useState('');
  const [hrPassword, setHrPassword] = useState('');
  const [hrError, setHrError] = useState('');
  const [showHrPassword, setShowHrPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  // Handle sliding panel functionality
  useEffect(() => {
    const container = document.getElementById('container');
    if (showHrLogin) {
      container.classList.add('right-panel-active');
    } else {
      container.classList.remove('right-panel-active');
    }
  }, [showHrLogin]);

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(username, password);
    if (!success) {
      // Check if it's an HR user trying to login through employee form
      if (username && password) {
        // Try to check if this is an HR user
        try {
          const hrRes = await fetch('http://localhost:8000/hr-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          if (hrRes.ok) {
            const hrData = await hrRes.json();
            if (hrData.success && hrData.user) {
              setError('This is an HR account. Please use the HR login form.');
              return;
            }
          }
        } catch {
          // If HR login check fails, show generic error
        }
      }
      setError('Invalid username or password');
    } else {
      // Employee login is handled by onLogin prop which sets user context
      // and navigates to /home
    }
  };

  const handleHrSubmit = async (e) => {
    e.preventDefault();
    setHrError('');
    try {
      const res = await fetch('http://localhost:8000/hr-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: hrUsername, password: hrPassword })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('HR login response:', data); // Debug log
        if (data.success && data.user) {
          // Ensure the user has the correct role
          const userWithRole = { ...data.user, role: 'hr' };
          console.log('HR user with role:', userWithRole); // Debug log
          // Set user in context and localStorage
          setUser(userWithRole);
          localStorage.setItem('user', JSON.stringify(userWithRole));
          if (data.user.token) {
            localStorage.setItem('token', data.user.token);
          } else {
            localStorage.setItem('token', 'hr');
          }
          console.log('Navigating HR user to /hrdashboard'); // Debug log
          navigate('/hrdashboard', { replace: true });
        } else {
          setHrError('Invalid credentials.');
        }
      } else {
        setHrError('Login failed.');
      }
    } catch {
      setHrError('Network error.');
    }
  };

  const handleBackToEmployee = () => {
    setShowHrLogin(false);
    setHrError('');
  };

  const handleSwitchToHr = () => {
    setShowHrLogin(true);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="container" id="container">
        {!showHrLogin ? (
          <div className="form-container sign-in-container">
            <form onSubmit={handleEmployeeSubmit}>
              <h1 style={{ color: '#F26522', fontSize : "1.5rem" }}>Employee Login</h1>
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ background: '#fff', color: '#000' }}
              />
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ background: '#fff', color: '#000' }}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  {showPassword ? <FiEyeOff size={22} color="#888" /> : <FiEye size={22} color="#888" />}
                </span>
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit">Sign In</button>
            </form>
          </div>
        ) : (
          <div className="form-container sign-up-container">
            <form onSubmit={handleHrSubmit}>
              <h1 style={{ color: '#F26522' }}>HR Login</h1>
              <span style={{ color: '#fff' }}>Access HR dashboard</span>
              <input 
                type="text" 
                placeholder="Username" 
                value={hrUsername}
                onChange={(e) => setHrUsername(e.target.value)}
                required
                style={{ background: '#fff', color: '#000' }}
              />
              <div className="password-input-container">
                <input
                  type={showHrPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={hrPassword}
                  onChange={(e) => setHrPassword(e.target.value)}
                  required
                  style={{ background: '#fff', color: '#000' }}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowHrPassword((v) => !v)}
                  title={showHrPassword ? 'Hide password' : 'Show password'}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  {showHrPassword ? <FiEyeOff size={22} color="#888" /> : <FiEye size={22} color="#888" />}
                </span>
              </div>
              {hrError && <p className="error-message">{hrError}</p>}
              <button type="submit">Sign In</button>
            </form>
          </div>
        )}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              {showHrLogin ? (
                <>
                  <h1 style={{ color: '#000' }}>Employee Login</h1>
                  <p style={{ color: '#000' }}>Click here to login as an employee</p>
                  <button className="ghost" onClick={handleBackToEmployee}>
                    Login
                  </button>
                </>
              ) : (
                <>
                  <h1 style={{ color: '#000' }}>Welcome Back!</h1>
                  <p style={{ color: '#000' }}>To keep connected with us please login with your personal info</p>
                  <button className="ghost" onClick={handleBackToEmployee}>
                    Sign In
                  </button>
                </>
              )}
            </div>
            <div className="overlay-panel overlay-right">
              {showHrLogin ? (
                <>
                  <h1 style={{ color: '#fff' }}>Welcome Back!</h1>
                  <p style={{ color: '#fff' }}>To access HR dashboard please login with your credentials</p>
                  <button className="ghost" onClick={handleBackToEmployee}>
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <h1 style={{ color: '#fff' }}>HR Access</h1>
                  <p style={{ color: '#fff' }}>Need to access HR dashboard? Click here to login as HR</p>
                  <button className="ghost" onClick={handleSwitchToHr}>
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 