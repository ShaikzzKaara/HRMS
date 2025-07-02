import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './employeehome.css';
import logoutIcon from './images/logout.png';
import kaaraLogo from './images/kaara.png';
import { FiUsers, FiSettings } from 'react-icons/fi';

const navItems = [
  { label: 'LMS', link: '/home', icon: <span style={{marginRight:8}}><svg width="18" height="18" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span> },
  { label: 'Ticketing', link: '/ticketing', icon: <span style={{marginRight:8}}><svg width="18" height="18" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M16 3v4M8 3v4M2 10h20"/></svg></span> },
  { label: 'AMS', link: '/employee_ams', icon: <FiUsers size={18} style={{marginRight:8, color:'#000'}} /> },
  { label: 'Settings', link: '#', icon: <FiSettings size={18} style={{marginRight:8, color:'#000'}} /> },
];

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  const handleLogoutClick = () => {
    onLogout();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header sidebar-logo-center">
        <img src={kaaraLogo} alt="Company Logo" className="sidebar-logo-img" style={{ maxWidth: '1900px', maxHeight: '75px', width: 'auto', height: 'auto' }} /> 

      </div>
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          let isSelected = false;
          if (item.label === 'LMS' && (location === '/home' || location === '/')) isSelected = true;
          if (item.label === 'Ticketing' && location === '/ticketing') isSelected = true;
          if (item.label === 'AMS' && location === '/employee_ams') isSelected = true;
          return (
            <Link key={idx} to={item.link} className={`sidebar-link${isSelected ? ' selected' : ''}`}>
              <span style={{display:'flex',alignItems:'center'}}>
                {React.isValidElement(item.icon)
                  ? React.cloneElement(item.icon, {
                      color: isSelected ? '#fff' : '#000',
                      style: isSelected ? { color: '#fff', stroke: '#fff', fill: '#fff' } : { color: '#000', stroke: '#000', fill: '#000' }
                    })
                  : item.icon}
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <button className="logout-btn" onClick={handleLogoutClick} style={{
        background: 'red',
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
        <span style={{ marginLeft: '8px',color:'white' }}>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar; 