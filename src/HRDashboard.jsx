import React, { useState, useEffect } from 'react';
import './employeehome.css';
import HRSidebar from './HRSidebar';
import { Search, Filter, User, Calendar, ChevronDown, Clock } from 'lucide-react';

function HRDashboard({ user, onLogout }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use HR ID from user prop
  const hrId = user?.id || 'HR001';

  // Fetch leave requests (pending only)
  const fetchLeaveRequests = () => {
    fetch(`http://localhost:8000/leave-request-employee?hrId=${hrId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setLeaveRequests(data);
      })
      .catch(error => {
        console.warn('Failed to fetch leave requests:', error);
        setLeaveRequests([]);
      });
  };

  useEffect(() => {
    if (!hrId) return;
    fetchLeaveRequests();
  }, [hrId]);

  // Get unique leave types for filter
  const leaveTypes = Array.from(new Set(leaveRequests.filter(req => (req.status || '').toLowerCase() === 'pending').map(req => req.leaveType))).filter(Boolean);

  // Filtered requests: only pending, search, and leave type
  const filteredRequests = leaveRequests.filter(request => {
    if ((request.status || '').toLowerCase() !== 'pending') return false;
    const matchesSearch = (request.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || request.leaveType === filterType;
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate days between two dates (inclusive)
  const getDays = (from, to) => {
    try {
      const d1 = new Date(from);
      const d2 = new Date(to);
      if (isNaN(d1) || isNaN(d2)) return '-';
      return Math.abs(Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))) + 1;
    } catch {
      return '-';
    }
  };

  // Status badge color (always orange for pending)
  const getStatusBadge = () => 'bg-orange-100 text-orange-700 border-orange-200';

  // Approve/Reject actions
  const handleAction = (leaveId, status) => {
    setActionLoading(true);
    // Find the leave request to get the employee name
    const req = leaveRequests.find(r => r.leaveId === leaveId);
    fetch('http://localhost:8000/update-leave', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leaveId, status })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setActionResult({
          ...data,
          status,
          employeeName: req?.employeeName || '',
        });
        setActionLoading(false);
        fetchLeaveRequests();
      })
      .catch(error => {
        console.warn('Failed to update leave:', error);
        setActionLoading(false);
      });
  };

  // Pagination controls
  const Pagination = () => {
    const pageNumbers = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pageNumbers.push(1, 2, 3, '...');
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
      }
    }
    return (
      <div className="flex justify-center mt-2 mb-4 gap-2 items-center">
        <button
          className="pagination-number"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          {'<'}
        </button>
        {pageNumbers.map((page, idx) =>
          page === '...'
            ? <span key={idx} className="px-2 text-gray-400 select-none">...</span>
            : <button
                key={page}
                className={`pagination-number${currentPage === page ? ' active' : ''}`}
                onClick={() => setCurrentPage(page)}
                disabled={currentPage === page}
              >
                {page}
              </button>
        )}
        <button
          className="pagination-number"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          {'>'}
        </button>
      </div>
    );
  };

  const mainContent = (
    <div className="min-h-screen bg-gray-50 flex flex-col px-0" style={{ boxShadow: 'none', background: 'none', margin: 0, paddingTop: 0 }}>
      {/* Top header, search, filter */}
      <div className="w-full flex flex-col gap-2 px-8 pt-1 pb-2">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-7 h-7 text-orange-500" /> HR Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full">
          <div className="relative max-w-2xl w-[620px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
              style={{ color: '#000' }}
            />
          </div>
          <div className="relative min-w-[180px]">
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors w-full"
              style={{ color: '#000' }}
            >
              <option value="all">All Leave Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span style={{ color: '#000' }}>{filteredRequests.length} requests</span>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="flex-1 w-full px-8 pb-2" style={{ boxShadow: 'none', background: 'none', margin: 0 }}>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto" style={{ marginBottom: 0, minHeight: 0, paddingBottom: 0 }}>
              {paginatedRequests.map((req, idx) => {
                return (
                  <div
                    key={req.leaveId || idx}
                    className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 bg-transparent shadow-none"
                    style={{ boxShadow: 'none', background: 'none', minHeight: 120, height: 220, maxWidth: 1000, width: 470 }}
                  >
                    <div className="flex items-center space-x-4 mb-2">
                      <img
                        src={req.employeePhoto || require('./images/google.png')}
                        alt={req.employeeName || 'Employee'}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100"
                      />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-black text-lg">{req.employeeName}</h3>
                          <span className="flex items-center text-sm text-black gap-1 ml-2"><Clock className="w-4 h-4 text-orange-500" /> {getDays(req.dateFrom, req.dateTo)} days</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-black mt-1">
                          <User className="w-4 h-4" />
                          <span>ID: {req.employeeId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border bg-orange-100 text-orange-700 border-orange-200`}>Pending</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-black">{req.leaveType}</span>
                        <span className="flex items-center text-sm text-black gap-1"><Calendar className="w-4 h-4 text-orange-500" /> {req.dateFrom} - {req.dateTo}</span>
                      </div>
                    </div>
                    <div className="mb-4 px-2">
                      <p className="reason-text-black" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 40 }}>
                        <span style={{ fontWeight: 400, fontSize: '1.0rem', color: '#222' }}>Reason:</span>
                        <span style={{  fontWeight: 400,fontSize: '0.70rem', color: '#444', marginLeft: 6 }}>
                          {req.reason || <span style={{color:'#aaa'}}>No reason provided</span>}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        className="flex-1 rounded text-xs font-medium"
                        style={{ background: '#F26522', color: '#fff', border: 'none', minWidth: 48, padding: '4px 10px', maxWidth: 80 }}
                        onClick={() => handleAction(req.leaveId, 'Approved')}
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn-custom rounded text-xs font-medium"
                        style={{ background: '#fff !important', color: '#F26522 !important', border: '1px solid #F26522 !important', minWidth: 48, padding: '4px 10px', maxWidth: 80 }}
                        onClick={() => handleAction(req.leaveId, 'Rejected')}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-0 mb-0 px-4" style={{width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: 0, paddingBottom: 0}}>
              <div className="text-sm text-gray-600">
                {filteredRequests.length > 0
                  ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredRequests.length)} of ${filteredRequests.length} entries`
                  : 'No entries'}
              </div>
              <div><Pagination /></div>
            </div>
          </>
        )}
      </div>

      {/* Action result popup */}
      {actionResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setActionResult(null)}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: '2rem 2.5rem',
            boxShadow: '0 8px 32px rgba(37,77,112,0.13)',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            {actionResult.status && actionResult.status.toLowerCase() === 'approved' ? (
              <div style={{ fontSize: 36, marginBottom: 12, color: '#22c55e', display: 'flex', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9.5 17L4 11.5"/></svg>
              </div>
            ) : actionResult.status && actionResult.status.toLowerCase() === 'rejected' ? (
              <div style={{ fontSize: 36, marginBottom: 12, color: '#ef4444', display: 'flex', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            ) : null}
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
              {actionResult.status && actionResult.status.toLowerCase() === 'approved'
                ? 'Leave Approved'
                : actionResult.status && actionResult.status.toLowerCase() === 'rejected'
                ? 'Leave Rejected'
                : 'Action Completed'}
            </h3>
            <p style={{ fontSize: 16, color: '#444', marginBottom: 18 }}>
              {actionResult.employeeName
                ? `${actionResult.employeeName} Leave request`
                : (actionResult.message || 'Status updated successfully.')}
            </p>
            <button className="popup-btn" onClick={() => setActionResult(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return <HRSidebar mainContent={mainContent} onLogout={onLogout} />;
}

export default HRDashboard;

