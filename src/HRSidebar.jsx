import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './employeehome.css';
import './HRDashboard.css';
import logo from './images/kaara.png';
import logoutIcon from './images/logout.png';

const navItems = [
  { label: 'LMS', link: '/hrdashboard' },
  { label: 'AMS', link: '#' },
  { label: 'TICKET', link: '/ticketing' },
  { label: 'Settings', link: '#' },
];

function HRSidebar({ mainContent, onLogout }) {
  const navigate = useNavigate();
  const location = window.location.pathname;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="main-layout">
      <aside className="sidebar" style={{ background: '#FF3F33', color: '#000' }}>
        <div className="sidebar-header sidebar-logo-center">
          <img src={logo} alt="Company Logo" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            let isSelected = false;
            if (item.label === 'LMS' && location === '/hrdashboard') isSelected = true;
            if (item.label === 'TICKET' && location === '/ticketing') isSelected = true;
            if (item.link.startsWith('/')) {
              return (
                <Link key={idx} to={item.link} className={`sidebar-link${isSelected ? ' selected' : ''}`} style={{
                  background: isSelected ? '#F26522' : 'transparent',
                  color: isSelected ? '#fff' : '#000',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '8px',
                  display: 'block',
                  textDecoration: 'none',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  transition: 'background 0.2s, color 0.2s'
                }}>
                  {item.label}
                </Link>
              );
            } else {
              return (
                <a key={idx} href={item.link} className="sidebar-link" style={{
                  background: isSelected ? '#F26522' : 'transparent',
                  color: isSelected ? '#fff' : '#000',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  marginBottom: '8px',
                  display: 'block',
                  textDecoration: 'none',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  transition: 'background 0.2s, color 0.2s'
                }}>
                  {item.label}
                </a>
              );
            }
          })}
        </nav>
        <button className="logout-btn" onClick={handleLogout} style={{
          background: '#F26522',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s'
        }}>
          <img src={logoutIcon} alt="Logout" className="logout-icon" />
          <span style={{ marginLeft: '8px' }}>Logout</span>
        </button>
      </aside>
      <main className="center-content">
        {mainContent ? mainContent : <h2 className="welcome-message">Welcome To HR Portal</h2>}
      </main>
    </div>
  );
}

export default HRSidebar;