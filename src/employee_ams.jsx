import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiUserCheck, FiUserX, FiUsers, FiSettings, FiBook, FiTag } from 'react-icons/fi';
import './employee_ams.css';

const EmployeeAMS = ({ user, onLogout }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ workingDays: 0, absentDays: 0, presentDays: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [monthYearFilteredData, setMonthYearFilteredData] = useState([]);

  const navItems = [
    { label: 'LMS', link: '/home', icon: FiBook },
    { label: 'Ticketing', link: '/ticketing', icon: FiTag },
    { label: 'AMS', link: '/employee_ams', icon: FiUsers },
    { label: 'Settings', link: '#', icon: FiSettings },
  ];

  const location = useLocation();

  useEffect(() => {
    if (!user || !user.username) {
      console.error("Username not found. Cannot fetch attendance data.");
      return;
    }
    const username = user.username;
    fetch(`http://localhost:8000/employee_ams?username=${encodeURIComponent(username)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch attendance data for ${username}`);
        }
        return res.json();
      })
      .then(apiResponse => {
        const records = Array.isArray(apiResponse)
          ? apiResponse
          : (apiResponse && Array.isArray(apiResponse.data))
          ? apiResponse.data
          : [];
        setAttendanceData(records);
        setFilteredData(records);
        calculateStats(records);
      })
      .catch(error => {
        setAttendanceData([]);
        setFilteredData([]);
        calculateStats([]);
      });
  }, [user]);

  useEffect(() => {
    let data = attendanceData;
    if (month) {
      data = data.filter(item => new Date(item.date).getMonth() + 1 === parseInt(month));
    }
    if (year) {
      data = data.filter(item => new Date(item.date).getFullYear() === parseInt(year));
    }
    setMonthYearFilteredData(data);
    let tableData = data;
    if (statusFilter !== 'all') {
      tableData = tableData.filter(item => item.status === statusFilter);
    }
    if (search) {
      tableData = tableData.filter(item =>
        item.date.includes(search) ||
        (item.check_in && item.check_in.includes(search)) ||
        (item.check_out && item.check_out.includes(search))
      );
    }
    setFilteredData(tableData);
    setCurrentPage(1);
  }, [month, year, search, statusFilter, attendanceData]);

  useEffect(() => {
    calculateStats(monthYearFilteredData);
  }, [monthYearFilteredData]);

  const calculateStats = (data) => {
    const workingDays = data.length;
    const absentDays = data.filter(item => item.status === 'absent').length;
    const presentDays = data.filter(item => item.status === 'present').length;
    setStats({ workingDays, absentDays, presentDays });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Attendance percentage
  const attendancePercent = stats.workingDays > 0 ? Math.round((stats.presentDays / stats.workingDays) * 100) : 0;

  // Get unique years from data for filter dropdown
  const years = Array.from(new Set(attendanceData.map(item => new Date(item.date).getFullYear())));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-header sidebar-logo-center">
          <img src={require('./images/kaara.png')} alt="Company Logo" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            const isSelected = location.pathname === item.link || (item.label === 'LMS' && (location.pathname === '/home' || location.pathname === '/'));
            const Icon = item.icon;
            return (
              <Link key={idx} to={item.link} className={`sidebar-link${isSelected ? ' selected' : ''}`}>
                <span style={{display:'flex',alignItems:'center',gap:8}}>
                  <Icon size={18} style={{ color: isSelected ? '#fff' : '#000', stroke: isSelected ? '#fff' : '#000', fill: 'none' }} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <button className="logout-btn" onClick={onLogout} style={{
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
          <img src={require('./images/logout.png')} alt="Logout" className="logout-icon" />
          <span style={{ marginLeft: '8px',color:'white' }}>Logout</span>
        </button>
      </aside>
      <div className="employee-ams-main">
        {/* Heading and attendance bar/filter row */}
        <div className="ams-header-row">
          <h2 className="ams-heading">Manage Attendance</h2>
        </div>
        <div className="ams-bar-filter-row">
          <div className="ams-attendance-bar-box">
            <div className="ams-attendance-bar" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px'}}>
              <span className="ams-attendance-bar-label">Attendance - {attendancePercent}%</span>
              <div className="ams-attendance-bar-bg">
                <div className="ams-attendance-bar-fill" style={{ width: attendancePercent + '%'}}></div>
              </div>
            </div>
          </div>
          <div className="ams-filter-box">
            <div className="ams-filters ams-filters-small">
              <select value={month} onChange={e => setMonth(e.target.value)} className="ams-select-small">
                <option value="">Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <select value={year} onChange={e => setYear(e.target.value)} className="ams-select-small">
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        {/* Cards */}
        <div className="ams-cards">
          <div className="ams-card">
            <div className="ams-card-icon"><FiCalendar size={28} color="#F26522" /></div>
            <h4>Working Days</h4>
            <p className="ams-card-number">{stats.workingDays}</p>
          </div>
          <div className="ams-card">
            <div className="ams-card-icon"><FiUserX size={28} color="#e53935" /></div>
            <h4>Absent Days</h4>
            <p className="ams-card-number">{stats.absentDays}</p>
          </div>
          <div className="ams-card">
            <div className="ams-card-icon"><FiUserCheck size={28} color="#43a047" /></div>
            <h4>Present Days</h4>
            <p className="ams-card-number">{stats.presentDays}</p>
          </div>
        </div>
        {/* Attendance History heading and search/filter bar */}
        <div className="ams-history-row">
          <h3 className="ams-history-heading">Attendance History</h3>
          <div style={{ marginLeft: 'auto' }}>
            <div className="ams-search-filter ams-search-filter-small">
              <input
                type="text"
                placeholder="Search by date, check-in, check-out..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 2 }}
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1 }}>
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="ams-table-wrapper">
          <table className="ams-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Working Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>No records found.</td></tr>
              ) : (
                currentItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.date}</td>
                    <td>{item.check_in || '-'}</td>
                    <td>{item.check_out || '-'}</td>
                    <td>{item.working_time || '-'}</td>
                    <td>
                      {item.status === 'present' ? (
                        <span className="ams-status-present">Present</span>
                      ) : (
                        <span className="ams-status-absent">Absent</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination and entries info outside table */}
        <div className="ams-pagination-row">
          <div className="ams-entries-info">
            {filteredData.length > 0 && (
              <>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
              </>
            )}
          </div>
          <div className="pagination">
            <button className="pagination-number" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`pagination-number${currentPage === i + 1 ? ' active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="pagination-number" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAMS; 