import React, { useState } from 'react';
import './RoleSelection.css';

const RoleSelection = ({ onUserClick, onHrClick }) => {
  const [activePanel, setActivePanel] = useState('employee');

  const handleEmployeeClick = () => {
    setActivePanel('employee');
    setTimeout(() => onUserClick(), 300);
  };

  const handleHrClick = () => {
    setActivePanel('hr');
    setTimeout(() => onHrClick(), 300);
  };

  return (
  <div className="role-selection-container">
      <h2>Welcome to HRMS</h2>
      <div className="container" id="container">
        <div className="form-container employee-container">
          <div className="form-content">
            <h1>Employee Portal</h1>
          <div className="role-icon">👤</div>
            <p>Access your leave management, view history, and manage your profile</p>
            <button onClick={handleEmployeeClick}>Continue as Employee</button>
          </div>
        </div>
        
        <div className="form-container hr-container">
          <div className="form-content">
            <h1>HR Portal</h1>
          <div className="role-icon">🧑‍💼</div>
            <p>Manage employees, approve leaves, and access HR dashboard</p>
            <button onClick={handleHrClick}>Continue as HR</button>
          </div>
        </div>
        
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Employee Portal</h1>
              <p>Access your personal dashboard, apply for leaves, and track your history</p>
              <button className="ghost" onClick={handleEmployeeClick}>
                Continue as Employee
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>HR Portal</h1>
              <p>Manage the entire workforce, approve requests, and access analytics</p>
              <button className="ghost" onClick={handleHrClick}>
                Continue as HR
              </button>
            </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default RoleSelection; 