import React, { useState, useEffect, useRef } from "react";
import "./employeehome.css";
import Sidebar from "./Sidebar";
import { MdLocalHospital, MdBeachAccess } from 'react-icons/md';
import { Baby } from "lucide-react";


function getMonthName(month) {
  return new Date(2000, month, 1).toLocaleString("default", { month: "long" });
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const Calendar = () => {
  const today = new Date();
  const [view, setView] = useState("days"); // days, months, years
  const [selected, setSelected] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  });

  const handlePrev = () => {
    if (view === "days") {
      setSelected((s) => {
        let m = s.month - 1;
        let y = s.year;
        if (m < 0) { m = 11; y--; }
        return { ...s, month: m, year: y };
      });
    } else if (view === "months") {
      setSelected((s) => ({ ...s, year: s.year - 1 }));
    } else if (view === "years") {
      setSelected((s) => ({ ...s, year: s.year - 12 }));
    }
  };
  const handleNext = () => {
    if (view === "days") {
      setSelected((s) => {
        let m = s.month + 1;
        let y = s.year;
        if (m > 11) { m = 0; y++; }
        return { ...s, month: m, year: y };
      });
    } else if (view === "months") {
      setSelected((s) => ({ ...s, year: s.year + 1 }));
    } else if (view === "years") {
      setSelected((s) => ({ ...s, year: s.year + 12 }));
    }
  };

  const handleTitleClick = () => {
    if (view === "days") setView("months");
    else if (view === "months") setView("years");
  };

  const handleMonthClick = (m) => {
    setSelected((s) => ({ ...s, month: m }));
    setView("days");
  };
  const handleYearClick = (y) => {
    setSelected((s) => ({ ...s, year: y }));
    setView("months");
  };

  // Render days
  if (view === "days") {
    const daysInMonth = getDaysInMonth(selected.year, selected.month);
    const firstDay = new Date(selected.year, selected.month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button className="calendar-btn" onClick={handlePrev}>&lt;</button>
          <span className="calendar-title" onClick={handleTitleClick}>
            {getMonthName(selected.month)} {selected.year}
          </span>
          <button className="calendar-btn" onClick={handleNext}>&gt;</button>
        </div>
        <div className="calendar-grid calendar-days-header">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="calendar-grid calendar-days">
          {days.map((d, i) => (
            <div
              key={i}
              className={
                d === selected.day && selected.month === today.getMonth() && selected.year === today.getFullYear()
                  ? "calendar-day today"
                  : "calendar-day"
              }
            >
              {d || ""}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // Render months
  if (view === "months") {
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button className="calendar-btn" onClick={handlePrev}>&lt;</button>
          <span className="calendar-title" onClick={handleTitleClick}>{selected.year}</span>
          <button className="calendar-btn" onClick={handleNext}>&gt;</button>
        </div>
        <div className="calendar-grid calendar-months">
          {Array.from({ length: 12 }).map((_, m) => (
            <div
              key={m}
              className={m === selected.month ? "calendar-month selected" : "calendar-month"}
              onClick={() => handleMonthClick(m)}
            >
              {getMonthName(m).slice(0, 3)}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // Render years
  if (view === "years") {
    const startYear = selected.year - (selected.year % 12);
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button className="calendar-btn" onClick={handlePrev}>&lt;</button>
          <span className="calendar-title">Select Year</span>
          <button className="calendar-btn" onClick={handleNext}>&gt;</button>
        </div>
        <div className="calendar-grid calendar-years">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={startYear + i === selected.year ? "calendar-year selected" : "calendar-year"}
              onClick={() => handleYearClick(startYear + i)}
            >
              {startYear + i}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const EmployeeHomeBody = ({ user, onLogout }) => {
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [leaveHistoryData, setLeaveHistoryData] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showEditSuccessPopup, setShowEditSuccessPopup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedLeaveInfo, setSelectedLeaveInfo] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    reason: '',
    dateFrom: '',
    dateTo: ''
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    leaveType: '',
    reason: '',
    dateFrom: '',
    dateTo: ''
  });
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveSummary, setLeaveSummary] = useState([]);
  const fileInputRef = useRef();
  const photoContainerRef = useRef();
  const [photo, setPhoto] = useState(() => localStorage.getItem('employeePhoto'));
  const [photoError, setPhotoError] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const employee = user;
  
  // Debug: Check if employee data is loaded
  console.log('Current username:', user?.username);
  console.log('Employee data:', employee);
  
  // Fetch leave history from backend (port 8000)
  const fetchLeaveHistory = () => {
    if (employee && employee.username) {
      fetch(`http://localhost:8000/leave-history?username=${employee.username}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // Normalize id for each leave
          const normalized = data.map(l => ({
            ...l,
            id: l.id || l._id // fallback to _id if id is missing
          }));
          setLeaveHistoryData(normalized);
        })
        .catch(error => {
          console.warn('Failed to fetch leave history:', error);
          setLeaveHistoryData([]); // Set empty array on error
        });
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, [employee]);

  // Fetch leave summary from backend
  const fetchLeaveSummary = () => {
    if (employee && employee.username) {
      fetch(`http://localhost:8000/available-leaves?username=${employee.username}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => setLeaveSummary(data))
        .catch(error => {
          console.warn('Failed to fetch leave summary:', error);
          setLeaveSummary([]); // Set empty array on error
        });
    }
  };

  useEffect(() => {
    fetchLeaveSummary();
  }, [employee]);

  // Close dropdown on click outside or scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeActionMenu !== null && !event.target.closest('.action-menu-container')) {
        setActiveActionMenu(null);
      }
    };

    const handleScroll = () => {
      if (activeActionMenu !== null) {
        setActiveActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeActionMenu]);

  // Dismiss photo error on outside click
  useEffect(() => {
    if (!photoError) return;
    function handleClick(e) {
      if (photoContainerRef.current && !photoContainerRef.current.contains(e.target)) {
        setPhotoError('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [photoError]);

  // Add click-outside logic for filter dropdown
  useEffect(() => {
    if (!showFilterDropdown) return;
    function handleClick(e) {
      const filterBtn = document.querySelector('#filter-dropdown-btn');
      const filterDropdown = document.querySelector('#filter-dropdown-menu');
      if (
        filterDropdown &&
        !filterDropdown.contains(e.target) &&
        filterBtn &&
        !filterBtn.contains(e.target)
      ) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFilterDropdown]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus]);

  if (!employee) {
    return <div className="employee-home-body">Employee not found. Please log in.</div>;
  }

  const leaveHistory = leaveHistoryData;

  const handleApplyLeave = () => {
    setShowApplyForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.leaveType || !formData.reason || !formData.dateFrom || !formData.dateTo) {
      setError("All fields are required.");
      return;
    }
    // Date validation
    const today = new Date();
    today.setHours(0,0,0,0);
    const fromDate = new Date(formData.dateFrom);
    const toDate = new Date(formData.dateTo);
    if (fromDate > toDate) {
      setError("'Date From' cannot be after 'Date To'. Please choose the dates correctly.");
      return;
    }
    if (fromDate < today) {
      setError("'Date From' cannot be before today.");
      return;
    }
    // Calculate number of days requested
    const daysRequested = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    // Find available leaves for selected type
    const summary = leaveSummary.find(l => l.type === formData.leaveType);
    const available = summary ? summary.available : 0;
    if (daysRequested > available) {
      setError(`Not sufficient ${formData.leaveType} available`);
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/apply-leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          leaveType: formData.leaveType,
          reason: formData.reason,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo
        })
      });
      if (res.ok) {
        setShowApplyForm(false);
        setShowSuccessPopup(true);
        setFormData({ leaveType: '', reason: '', dateFrom: '', dateTo: '' });
        fetchLeaveHistory();
        fetchLeaveSummary();
      } else {
        // Try to parse backend error for leave type
        const data = await res.json();
        if (data && data.detail && data.detail.toLowerCase().includes("available")) {
          setError(`No ${formData.leaveType} available`);
        } else {
          setError("Failed to apply for leave.");
        }
      }
    } catch {
      setError("Failed to apply for leave.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openEditModal = (leave) => {
    setEditFormData({
      id: leave.id || leave._id,
      leaveType: leave.leaveType,
      reason: leave.reason,
      dateFrom: leave.dateFrom,
      dateTo: leave.dateTo
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Calculate number of days requested
    const fromDate = new Date(editFormData.dateFrom);
    const toDate = new Date(editFormData.dateTo);
    const daysRequested = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    // Find available leaves for selected type
    const summary = leaveSummary.find(l => l.type === editFormData.leaveType);
    const available = summary ? summary.available : 0;
    if (daysRequested > available) {
      setError(`Not sufficient ${editFormData.leaveType} available`);
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/update-employee-leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editFormData.id,
          leaveType: editFormData.leaveType,
          reason: editFormData.reason,
          dateFrom: editFormData.dateFrom,
          dateTo: editFormData.dateTo,
          status: 'pending' // Set status to pending on edit
        })
      });
      if (res.ok) {
        setShowEditModal(false);
        setShowEditSuccessPopup(true);
        fetchLeaveHistory();
        fetchLeaveSummary();
      } else {
        setError("Failed to update leave.");
      }
    } catch {
      setError("Failed to update leave.");
    }
  };

  const requestDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:8000/delete-leave?id=${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeaveHistoryData(leaveHistoryData.filter(l => l.id !== deleteId));
      } else {
        alert('Failed to delete leave record.');
      }
    } catch {
      alert('Failed to delete leave record.');
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const openInfoModal = async (leave) => {
    const id = leave.id || leave._id?.$oid || leave._id;
    const res = await fetch(`http://localhost:8000/leave-info?id=${id}`);
  
    const data = await res.json();
    setSelectedLeaveInfo(data);
    setShowInfoModal(true);
  };

  // Filtered leave history
  const filteredLeaveHistory = leaveHistory.filter(leave => {
    const statusMatch = filterStatus === 'All' || (typeof leave.status === 'string' ? leave.status.toLowerCase() : 'pending') === filterStatus.toLowerCase();
    
    // Search functionality
    const searchMatch = searchTerm === '' || 
      (leave.leaveType && leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.dateFrom && leave.dateFrom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.dateTo && leave.dateTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaveHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaveHistory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // In the render section, filter the summary to only show the required types
  const allowedTypes = ["Sick Leave", "Casual Leave", "Maternity/Paternity"];
  const filteredSummary = leaveSummary.filter(item => allowedTypes.includes(item.type));

  // Add custom styles to override CSS conflicts
  const customStyles = `
    .leave-action-edit-btn {
      color: #3B82F6 !important;
    }
    .leave-action-info-btn {
      color: #059669 !important;
    }
    .leave-action-delete-btn {
      color: #DC2626 !important;
    }
    .leave-action-edit-btn svg,
    .leave-action-info-btn svg,
    .leave-action-delete-btn svg {
      color: inherit !important;
    }
    
    /* Fix remaining text color */
    .remaining-text {
      color: #6b7280 !important;
    }
    
    /* Calendar override styles - No background box */
    .calendar {
      background: transparent !important;
      border-radius: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      margin-bottom: 0 !important;
      border: none !important;
    }
    .calendar-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 10px !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .calendar-btn {
      background: #f3f4f6 !important;
      border: 1px solid #d1d5db !important;
      border-radius: 4px !important;
      padding: 6px 12px !important;
      cursor: pointer !important;
      color: #374151 !important;
      font-size: 12px !important;
      min-width: 30px !important;
      text-align: center !important;
    }
    .calendar-btn:hover {
      background: #e5e7eb !important;
    }
    .calendar-title {
      cursor: pointer !important;
      font-weight: 600 !important;
      font-size: 0.9rem !important;
      color: #374151 !important;
      text-align: center !important;
      flex: 1 !important;
      padding: 0 !important;
    }
    .calendar-grid {
      display: grid !important;
      gap: 2px !important;
      width: 100% !important;
    }
    .calendar-days-header {
      grid-template-columns: repeat(7, 1fr) !important;
      margin-bottom: 5px !important;
    }
    .calendar-days-header > div {
      text-align: center !important;
      font-weight: 600 !important;
      font-size: 0.8rem !important;
      color: #6b7280 !important;
      padding: 4px !important;
    }
    .calendar-days {
      grid-template-columns: repeat(7, 1fr) !important;
    }
    .calendar-months {
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 4px !important;
    }
    .calendar-years {
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 4px !important;
    }
    .calendar-day, .calendar-month, .calendar-year {
      padding: 2px !important;
      text-align: center !important;
      border-radius: 4px !important;
      font-size: 0.8rem !important;
      cursor: pointer !important;
      color: #374151 !important;
      background: transparent !important;
      border: none !important;
      margin: 0 !important;
      min-height: 15px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .calendar-day:hover, .calendar-month:hover, .calendar-year:hover {
      background: #f3f4f6 !important;
    }
    .calendar-day.today, .calendar-month.selected, .calendar-year.selected {
      background: #f26522 !important;
      color: white !important;
    }
    .calendar-day:empty {
      cursor: default !important;
    }
  `;

  return (
    <div className="main-layout">
      <style>{customStyles}</style>
      {/* Left Sidebar */}
      <Sidebar user={employee} onLogout={onLogout} />
      {/* Center Content: Welcome and Leave Management System */}
      <main className="center-content" style={{marginTop: '7px'}}>
        {/* Leave Dashboard Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', width: '100%' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#F26522', fontSize: '2rem', marginBottom: '19px', textAlign: 'left' }}>Leave Dashboard</h2>
          <button
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm text-white font-semibold py-2 px-5 rounded flex items-center"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={handleApplyLeave}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Apply Leave
          </button>
        </div>
        
        {/* Leave Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={{ display: 'flex', gap: '10px', marginBottom: '0.3rem', flexWrap: 'wrap', justifyContent: 'center',width:'100%' }}>
          {filteredSummary.slice(0, 4).map((item, idx) => {
            // Set total based on leave type
            let total;
            let logo;
            let iconBg;
            if (item.type === 'Sick Leave') {
              total = 12;
              logo = <MdLocalHospital size={32} color="#1976d2" title="Sick Leave" />;
              iconBg = '#e3f2fd'; // light blue background
            } else if (item.type === 'Casual Leave') {
              total = 12;
              logo = <MdBeachAccess size={32} color="#f4b400" title="Casual Leave" />;
              iconBg = '#fffde7'; // light yellow background
            } else {
              total = 90;
              logo = <Baby className="w-8 h-8 text-purple-500" title="Maternity/Paternity" />;
              iconBg = '#f3e5f5'; // light purple background
            }
            const used = item.used;
            const available = item.available;
            const remaining = total - used;
            const percentage = total > 0 ? (used / total) * 100 : 0;
            // For the circle progress
            const strokeDasharray = `${Math.round((percentage / 100) * 126)} 126`;
            let color;
            if (item.type === 'Sick Leave') color = 'text-blue-500';
            else if (item.type === 'Casual Leave') color = 'text-yellow-500';
            else color = 'text-purple-500';
            return (
              <div key={item.type} className="rounded-xl shadow bg-white p-3 flex-1 min-w-[170px] max-w-[250px] leave-summary-hover" style={{ minWidth: 170, maxWidth: 250, background: '#ffffff' }}>
                <div className="flex items-center justify-between mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div className="p-2 rounded-xl" style={{ background: iconBg }}>{logo}</div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{used}/{total}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(0)}% used</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">{item.type}</h3>
                    <p className="text-xs remaining-text">{remaining} remaining</p>
                  </div>
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                      <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={strokeDasharray} className={color} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Table Header with Search and Filters - Like Ticketing System */}
        <div className="w-full py-2" style={{marginTop: '0.2rem'}}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold leave-history-heading">Leave History</h3>
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search leaves..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  style={{backgroundColor: '#ffffff', border: '1px solid #d1d5db'}}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Status Filter - Only one filter with two options */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 6h18M6 12h12M9 18h6"/>
                </svg>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  style={{backgroundColor: '#ffffff', border: '1px solid #d1d5db'}}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Leave History Table */}
        <div className="border border-slate-200 shadow-sm rounded-lg bg-white" style={{marginBottom: '10px', width: '100%'}}>
          <div style={{width: '100%', overflowX: 'auto'}}>
            <table className="min-w-full divide-y divide-slate-200" style={{width: '100%'}}>
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="font-semibold text-slate-700 py-4 px-6 text-left" style={{minWidth: '150px'}}>Leave Type</th>
                  <th className="font-semibold text-slate-700 py-4 px-6 text-center" style={{minWidth: '120px'}}>Date From</th>
                  <th className="font-semibold text-slate-700 py-4 px-6 text-center" style={{minWidth: '120px'}}>Date To</th>
                  <th className="font-semibold text-slate-700 py-4 px-6 text-center" style={{minWidth: '100px'}}>Status</th>
                  <th className="font-semibold text-slate-700 py-4 px-6 text-center" style={{minWidth: '120px'}}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((leave, idx) => (
                    <tr key={leave.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-left">
                        <div className="font-medium text-slate-900 truncate">{leave.leaveType}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="truncate-text" style={{fontSize: '0.875rem'}}>{leave.dateFrom}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="truncate-text" style={{fontSize: '0.875rem'}}>{leave.dateTo}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          typeof leave.status === 'string' && leave.status.toLowerCase() === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : typeof leave.status === 'string' && leave.status.toLowerCase() === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          className="action-icon-btn leave-action-info-btn" 
                          title="Info" 
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '6px',
                            margin: '0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                            fontSize: '1.1rem'
                          }}
                          onClick={e => { e.stopPropagation(); openInfoModal(leave); }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </button>
                        {(typeof leave.status === 'string' && (leave.status.toLowerCase() === 'rejected' || leave.status.toLowerCase() === 'pending')) && (
                          <>
                            <button 
                              className="action-icon-btn leave-action-edit-btn" 
                              title="Edit" 
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '6px',
                                margin: '0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                                fontSize: '1.1rem'
                              }}
                              onClick={e => { e.stopPropagation(); openEditModal(leave); }}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
                            </button>
                            <button 
                              className="action-icon-btn leave-action-delete-btn" 
                              title="Delete" 
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '6px',
                                margin: '0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                                fontSize: '1.1rem'
                              }}
                              onClick={e => { e.stopPropagation(); requestDelete(leave.id); }}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination - Outside table, no box */}
        {filteredLeaveHistory.length > 0 && (
          <div className="flex justify-between items-center" style={{paddingTop: '3px', paddingBottom: '3px', width: '100%'}}>
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeaveHistory.length)} of {filteredLeaveHistory.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="pagination-number" 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                {'<'}
              </button>
              <div className="flex gap-1">
                {(() => {
                  const totalPages = Math.ceil(filteredLeaveHistory.length / itemsPerPage);
                  const pages = [];
                  if (totalPages <= 3) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    if (currentPage <= 2) {
                      pages.push(1, 2, 3);
                      if (totalPages > 3) pages.push('...');
                    } else if (currentPage >= totalPages - 1) {
                      if (totalPages > 3) pages.push('...');
                      pages.push(totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push('...');
                      pages.push(currentPage - 1, currentPage, currentPage + 1);
                      pages.push('...');
                    }
                  }
                  return pages.map((pageNumber, index) => (
                    <button
                      key={index}
                      className={`pagination-number${pageNumber === currentPage ? ' active' : ''}`}
                      onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                      disabled={pageNumber === '...'}
                    >
                      {pageNumber}
                    </button>
                  ));
                })()}
              </div>
              <button 
                className="pagination-number" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </main>
      {/* Right Sidebar: User Profile and Calendar */}
      <aside className="rightbar">
        <div className="profile-card card profile-card-small">
          <div ref={photoContainerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={photo || require('./images/google.png')}
                alt="Profile"
                className="profile-photo small"
                style={{ cursor: 'pointer', border: '2px solid #e0e0e0', background: '#fff' }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              />
              {!photo && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#1d72b8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                  title="Add Photo"
                >
                  +
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => {
                  setPhotoError('');
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 1024 * 1024) {
                      setPhotoError('Please select an image smaller than 1MB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                      const img = new window.Image();
                      img.onload = function () {
                        const canvas = document.createElement('canvas');
                        const maxSize = 200;
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                          if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                          }
                        } else {
                          if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        try {
                          localStorage.setItem('employeePhoto', dataUrl);
                          setPhoto(dataUrl); // update state, triggers re-render
                        } catch (err) {
                          setPhotoError('Photo is too large to store. Please choose a smaller image.');
                        }
                      };
                      img.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {photoError && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 6,
                    background: '#fff',
                    color: '#d32f2f',
                    border: '1px solid #f8bbd0',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    padding: '6px 16px',
                    fontSize: '0.97rem',
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {photoError}
                </div>
              )}
            </div>
            <h2 className="profile-name">{employee.name}</h2>
            <div className="profile-details">
              <div><strong>ID:</strong> {employee.employeeId || employee.id || '-'}</div>
              <div><strong>Role:</strong> {employee.role || '-'}</div>
              <div><strong>Dept:</strong> {employee.dept || '-'}</div>
              <div><strong>Email:</strong> <span className="profile-email">{employee.mail || employee.email || '-'}</span></div>
              <div><strong>Status:</strong> <span className={`status ${employee.status?.toLowerCase().replace(" ", "-")}`}>{employee.status || '-'}</span></div>
            </div>
          </div>
        </div>
        <div className="calendar-box card">
          <h3>Calendar</h3>
          <Calendar />
        </div>
      </aside>

      {/* Edit Leave Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content professional-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEditSubmit} className="apply-form professional">
              <h2 style={{ textAlign: 'center', width: '100%', marginBottom: '1rem', color: '#F26522' }}>Edit Leave</h2>
              <div className="form-group center-field">
                <label style={{ color: '#000', fontWeight: 400 }}>Leave Type *</label>
                <select
                  name="leaveType"
                  value={editFormData.leaveType}
                  onChange={handleEditInputChange}
                  required
                  className="form-input center-select"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>
              <div className="form-row date-row">
                <div className="form-group">
                  <label style={{ color: '#000', fontWeight: 400 }}>Date From *</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={editFormData.dateFrom}
                    onChange={handleEditInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#000', fontWeight: 400 }}>Date To *</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={editFormData.dateTo}
                    onChange={handleEditInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ color: '#000', fontWeight: 400 }}>Reason *</label>
                <textarea
                  name="reason"
                  value={editFormData.reason}
                  onChange={handleEditInputChange}
                  required
                  className="form-input reason-textarea"
                  placeholder="Please provide a detailed reason for your leave request..."
                  rows="4"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions professional-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-apply">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyForm && (
        <div className="modal-overlay">
          <div className="modal-content professional-form" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit} className="apply-form professional">
              <h2 style={{ textAlign: 'center', width: '100%', marginBottom: '1rem', color: '#F26522' }}>Apply Leave</h2>
              <div className="form-group center-field">
                <label style={{ color: '#000', fontWeight: 400 }}>Leave Type *</label>
                <select 
                  name="leaveType" 
                  value={formData.leaveType} 
                  onChange={handleInputChange} 
                  required
                  className="form-input center-select"
                >
                  <option value="">Select Leave Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>
              <div className="form-row date-row">
                <div className="form-group">
                  <label style={{ color: '#000', fontWeight: 400 }}>Date From *</label>
                  <input 
                    type="date" 
                    name="dateFrom" 
                    value={formData.dateFrom} 
                    onChange={handleInputChange} 
                    required 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#000', fontWeight: 400 }}>Date To *</label>
                  <input 
                    type="date" 
                    name="dateTo" 
                    value={formData.dateTo} 
                    onChange={handleInputChange} 
                    required 
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ color: '#000', fontWeight: 400 }}>Reason *</label>
                <textarea 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input reason-textarea"
                  placeholder="Please provide a detailed reason for your leave request..."
                  rows="4"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions professional-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowApplyForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-apply">
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }} onClick={() => setShowSuccessPopup(false)}>
          <div className="popup-content" style={{ minWidth: 320, maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div className="popup-icon" style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Leave Application Successfully Submitted!</h3>
            <p style={{ fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' }}>Your leave request has been successfully submitted and is pending approval.</p>
            <button className="popup-btn" style={{ marginTop: 8 }} onClick={() => setShowSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Edit Success Popup */}
      {showEditSuccessPopup && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }} onClick={() => setShowEditSuccessPopup(false)}>
          <div className="popup-content" style={{ minWidth: 320, maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div className="popup-icon" style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Leave Edit Successfully Submitted!</h3>
            <p style={{ fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' }}>The leave record has been successfully updated.</p>
            <button className="popup-btn" style={{ marginTop: 8 }} onClick={() => setShowEditSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && selectedLeaveInfo && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ justifyContent: 'center' }}>
              <h2 style={{ textAlign: 'center', width: '100%' }}>Leave Details</h2>
            </div>
            <div className="info-content">
              <div className="info-row">
                <strong style={{ color: '#000' }}>Leave Type:</strong>
                <span style={{ color: '#000' }}>{selectedLeaveInfo.leaveType}</span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000' }}>Date From:</strong>
                <span style={{ color: '#000' }}>{selectedLeaveInfo.dateFrom}</span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000' }}>Date To:</strong>
                <span style={{ color: '#000' }}>{selectedLeaveInfo.dateTo}</span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000' }}>Status:</strong>
                <span className={`status ${typeof selectedLeaveInfo.status === 'string' ? selectedLeaveInfo.status.toLowerCase() : 'pending'}`} style={{ color: '#000' }}>
                  {selectedLeaveInfo.status || 'Pending'}
                </span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000' }}>Reason:</strong>
                <div className="reason-text" style={{ color: '#000' }}>{selectedLeaveInfo.reason}</div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowInfoModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 350 }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              Are you sure you want to delete this leave request?
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn-primary" style={{ background: '#d32f2f' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeHome = (props) => <EmployeeHomeBody {...props} />;

export default EmployeeHome;

