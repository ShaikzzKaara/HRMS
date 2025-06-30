import React, { useState, useEffect } from "react";
import "./employeehome.css";
import { getTicketsByUsername, addTicket, updateTicket, deleteTicket, getUserByUsername } from "./data";
import Sidebar from "./Sidebar";
import { Ticket, Search, Filter, BarChart2, Loader, CheckCircle2, Pencil, Info, Trash2, PlusCircle } from "lucide-react";

const TicketingSystem = ({ user, onLogout }) => {
  const [ticketData, setTicketData] = useState([]);
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [showTicketEditModal, setShowTicketEditModal] = useState(false);
  const [showTicketInfoModal, setShowTicketInfoModal] = useState(false);
  const [showTicketSuccessPopup, setShowTicketSuccessPopup] = useState(false);
  const [showTicketEditSuccessPopup, setShowTicketEditSuccessPopup] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicketInfo, setSelectedTicketInfo] = useState(null);
  const [activeTicketActionMenu, setActiveTicketActionMenu] = useState(null);
  const [isMenuUpward, setIsMenuUpward] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    subject: '',
    reason: '',
    priority: ''
  });
  const [ticketEditFormData, setTicketEditFormData] = useState({
    subject: '',
    reason: '',
    priority: ''
  });
  const [ticketStats, setTicketStats] = useState({ opened: 0, resolved: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const employee = user;

  // Add custom styles to override CSS conflicts
  const customStyles = `
    .ticketing-header {
      color: #F26522 !important;
      font-weight: 700 !important;
      font-size: 2rem !important;
    }
    .action-edit-btn {
      color: #3B82F6 !important;
    }
    .action-info-btn {
      color: #059669 !important;
    }
    .action-delete-btn {
      color: #DC2626 !important;
    }
    .action-edit-btn svg,
    .action-info-btn svg,
    .action-delete-btn svg {
      color: inherit !important;
    }
    .priority-badge-critical {
      background: #fee2e2 !important;
      color: #dc2626 !important;
      font-weight: 600;
      border-radius: 0.5rem;
      padding: 0.25rem 0.75rem;
      font-size: 1rem;
      display: inline-block;
    }
    .priority-badge-high {
      background: #ffedd5 !important;
      color: #f59e42 !important;
      font-weight: 600;
      border-radius: 0.5rem;
      padding: 0.25rem 0.75rem;
      font-size: 1rem;
      display: inline-block;
    }
    .priority-badge-low {
      background: #dbeafe !important;
      color: #2563eb !important;
      font-weight: 600;
      border-radius: 0.5rem;
      padding: 0.25rem 0.75rem;
      font-size: 1rem;
      display: inline-block;
    }
    .priority-badge-default {
      background: #f3f4f6 !important;
      color: #6b7280 !important;
      font-weight: 600;
      border-radius: 0.5rem;
      padding: 0.25rem 0.75rem;
      font-size: 1rem;
      display: inline-block;
    }
    .ticket-table-header {
      font-size: 1.1rem !important;
    }
    .ticket-table-cell {
      font-size: 1.05rem !important;
    }
    .ticket-status-value {
      font-size: 0.95rem !important;
      font-weight: 500;
    }
    .ticket-date-value {
      font-size: 1.15rem !important;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .status,
    .ticket-date-value {
      font-size: 14px !important;
      font-weight: 400 !important;
    }
  `;

  useEffect(() => {
    if (employee && employee.id) {
      // Fetch ticket stats for this user only
      fetch(`http://localhost:8000/ticket-data?userId=${employee.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => setTicketStats(data))
        .catch(error => {
          console.warn('Failed to fetch ticket stats:', error);
          setTicketStats({ opened: 0, resolved: 0, total: 0 });
        });
      // Fetch ticket history
      fetch(`http://localhost:8000/ticket-history?userId=${employee.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => setTicketData(data))
        .catch(error => {
          console.warn('Failed to fetch ticket history:', error);
          setTicketData([]);
        });
    }
  }, [employee]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleRaiseTicket = () => setShowRaiseTicketModal(true);
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: employee.id,
          subject: ticketFormData.subject,
          reason: ticketFormData.reason,
          priority: ticketFormData.priority
        })
      });
      if (response.ok) {
        setShowRaiseTicketModal(false);
        setShowTicketSuccessPopup(true);
        setTicketFormData({ subject: '', reason: '', priority: '' });
        // Refetch tickets
        fetch(`http://localhost:8000/ticket-history?userId=${employee.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTicketData(data))
          .catch(error => {
            console.warn('Failed to refetch ticket history:', error);
          });
        fetch(`http://localhost:8000/ticket-data?userId=${employee.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTicketStats(data))
          .catch(error => {
            console.warn('Failed to refetch ticket stats:', error);
          });
      } else {
        // Handle error
      }
    } catch (err) {
      // Handle error
    }
  };
  const handleTicketEdit = (ticket, index) => {
    setEditingTicket({ ...ticket, originalIndex: index });
    setTicketEditFormData({
      subject: ticket.subject,
      reason: ticket.reason,
      priority: ticket.priority
    });
    setShowTicketEditModal(true);
    setActiveTicketActionMenu(null);
  };
  const handleTicketUpdate = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      const response = await fetch('http://localhost:8000/ticket-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTicket.id,
          subject: ticketEditFormData.subject,
          reason: ticketEditFormData.reason,
          priority: ticketEditFormData.priority
        })
      });
      if (response.ok) {
        setShowTicketEditModal(false);
        setEditingTicket(null);
        setShowTicketEditSuccessPopup(true);
        // Refetch tickets
        fetch(`http://localhost:8000/ticket-history?userId=${employee.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTicketData(data))
          .catch(error => {
            console.warn('Failed to refetch ticket history:', error);
          });
        fetch(`http://localhost:8000/ticket-data?userId=${employee.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTicketStats(data))
          .catch(error => {
            console.warn('Failed to refetch ticket stats:', error);
          });
      } else {
        // Handle error
      }
    } catch (err) {
      // Handle error
    }
  };
  const handleTicketDelete = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:8000/ticket-delete?id=${ticketId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refetch tickets
        fetch(`http://localhost:8000/ticket-history?userId=${employee.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTicketData(data))
          .catch(error => {
            console.warn('Failed to refetch ticket history:', error);
          });
        fetch(`http://localhost:8000/ticket-data?userId=${employee.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTicketStats(data))
          .catch(error => {
            console.warn('Failed to refetch ticket stats:', error);
          });
      } else {
        // Handle error
      }
    } catch (err) {
      // Handle error
    }
    setActiveTicketActionMenu(null);
  };
  const handleTicketInfo = async (ticket) => {
    try {
      const response = await fetch(`http://localhost:8000/ticket-info?id=${ticket.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedTicketInfo(data);
      setShowTicketInfoModal(true);
      setActiveTicketActionMenu(null);
    } catch (err) {
      console.warn('Failed to fetch ticket info:', err);
      setSelectedTicketInfo(ticket);
      setShowTicketInfoModal(true);
      setActiveTicketActionMenu(null);
    }
  };
  const handleTicketInputChange = (e) => {
    setTicketFormData({
      ...ticketFormData,
      [e.target.name]: e.target.value
    });
  };
  const handleTicketEditInputChange = (e) => {
    setTicketEditFormData({
      ...ticketEditFormData,
      [e.target.name]: e.target.value
    });
  };
  const handleTicketActionClick = (idx, e) => {
    const menuButton = e.currentTarget;
    const tableWrapper = menuButton.closest('.table-responsive');
    if (tableWrapper) {
      const buttonRect = menuButton.getBoundingClientRect();
      const tableRect = tableWrapper.getBoundingClientRect();
      const spaceBelow = tableRect.bottom - buttonRect.bottom;
      const dropdownHeight = 120; 
      setIsMenuUpward(spaceBelow < dropdownHeight);
    } else {
      setIsMenuUpward(false);
    }
    setActiveTicketActionMenu(activeTicketActionMenu === idx ? null : idx);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeTicketActionMenu !== null && !event.target.closest('.action-menu-container')) {
        setActiveTicketActionMenu(null);
      }
    };

    const handleScroll = () => {
      if (activeTicketActionMenu !== null) {
        setActiveTicketActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeTicketActionMenu]);

  const getStatusBadgeClass = (resolved) => {
    return resolved === "Yes" ? "status status-closed" : "status status-open";
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'priority-badge-critical';
      case 'high':
        return 'priority-badge-high';
      case 'low':
        return 'priority-badge-low';
      default:
        return 'priority-badge-default';
    }
  };

  // Filter tickets based on search term and status
  const filteredTickets = ticketData.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.id && ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'open' && ticket.resolved !== "Yes") ||
                         (statusFilter === 'closed' && ticket.resolved === "Yes");
    return matchesSearch && matchesStatus;
  });

  // Get paginated tickets from filtered results
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!employee) {
    return <div className="main-layout">Please log in.</div>;
  }

  return (
    <div className="main-layout" style={{display: 'flex'}}>
      <style>{customStyles}</style>
      <Sidebar user={employee} onLogout={onLogout} />
      <div className="flex flex-col min-h-screen bg-slate-50/30 flex-1" style={{minWidth: 0, flex: 1, marginLeft: '0'}}>
        {/* Header - Full width */}
        <header className="w-full flex flex-col items-start justify-center gap-1 px-6 py-3" style={{width: '100%', marginLeft: '0', background: 'none', boxShadow: 'none', marginBottom: 0, paddingBottom: 0}}>
          <div className="flex items-center gap-3 w-full">
            {/* Ticket icon */}
            <span className="text-[#F26522]" style={{display: 'flex', alignItems: 'center'}}>
              <Ticket className="h-6 w-6 text-[#F26522]" />
            </span>
            <h1 className="ticketing-header" style={{color: '#F26522', fontWeight: 700, fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
              Ticketing System
            </h1>
            <div className="flex-1" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium px-4 py-2 gap-2 rounded flex items-center" onClick={handleRaiseTicket}>
              <PlusCircle className="size-4 mr-2" />
              Raise Ticket
            </button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 bg-slate-50/30 w-full" style={{width: '100%', marginLeft: '0'}}>
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-3" style={{marginBottom: 0, maxWidth: '950px', margin: '0 auto', width: '100%'}}>
            <div className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-white h-38 flex flex-col justify-center items-center">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-3 w-full">
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide x">Open Tickets</div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <BarChart2 className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="pt-0 px-4 pb-2 w-full flex flex-col items-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">{ticketStats.opened}</div>
                <div className="text-xs text-slate-500 mb-5">Total open tickets</div>
              </div>
            </div>
            <div className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-white h-38 flex flex-col justify-center items-center">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-3 w-full">
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">In Progress</div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Loader className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="pt-0 px-4 pb-2 w-full flex flex-col items-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">{ticketStats.opened - ticketStats.resolved}</div>
                <div className="text-xs text-slate-500 mb-5">Total in progress</div>
              </div>
            </div>
            <div className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-white h-38 flex flex-col justify-center items-center">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-3 w-full">
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Resolved</div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="pt-0 px-4 pb-2 w-full flex flex-col items-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">{ticketStats.resolved}</div>
                <div className="text-xs text-slate-500 mb-5">Total resolved</div>
              </div>
            </div>
          </div>
          
          {/* Table Header - Full width, no box, reduced padding */}
          <div style={{ maxWidth: '74vw', marginLeft: '35px', width: '100%' }}>
            <div className="flex items-center justify-between" style={{gap: '1rem'}}>
              <h3 className="leave-history-heading" style={{marginBottom: '0.5rem', flex: 1, textAlign: 'left'}}>Ticket History</h3>
              <div className="flex items-center space-x-3" style={{gap: '0.5rem'}}>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    style={{backgroundColor: '#ffffff', border: '1px solid #d1d5db', minWidth: 160}}
                  />
                </div>
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    style={{backgroundColor: '#ffffff', border: '1px solid #d1d5db', minWidth: 120}}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Ticket Table Card - Adjusted spacing */}
          <div className="border border-slate-200 shadow-sm rounded-lg bg-white" style={{marginBottom: '0px', maxWidth: '950px', margin: '0 auto', width: '100%'}}>
            <div>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="font-semibold text-slate-700 py-4 px-4 text-left ticket-table-header" style={{maxWidth:'180px', width:'22%'}}>Subject</th>
                    <th className="font-semibold text-slate-700 py-4 px-2 text-center ticket-table-header" style={{width:'13%'}}>Priority</th>
                    <th className="font-semibold text-slate-700 py-4 px-2 text-center ticket-table-header" style={{width:'13%'}}>Status</th>
                    <th className="font-semibold text-slate-700 py-4 px-6 text-center ticket-table-header" style={{width:'18%'}}>Submitted Date</th>
                    <th className="font-semibold text-slate-700 py-4 px-2 text-center ticket-table-header" style={{width:'18%'}}>Resolved Date</th>
                    <th className="font-semibold text-slate-700 py-4 px-2 text-center ticket-table-header" style={{width:'16%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedTickets.map((row, idx) => {
                    const isClosed = row.resolved === "Yes";
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-left ticket-table-cell" style={{maxWidth:'180px', width:'22%'}}>
                          <div className="font-medium text-slate-900 truncate" style={{ fontSize: '0.75em', maxWidth:'160px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{row.subject}</div>
                        </td>
                        <td className="py-4 px-2 text-center ticket-table-cell" style={{width:'13%'}}>
                          <span className={getPriorityBadgeClass(row.priority)}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center ticket-table-cell" style={{width:'13%'}}>
                          <span className={getStatusBadgeClass(row.resolved)}>
                            {row.resolved === "Yes" ? "Closed" : "Open"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center ticket-table-cell" style={{width:'18%'}}>
                          <span className="truncate-text ticket-date-value">{row.submittedDate || '-'}</span>
                        </td>
                        <td className="py-4 px-2 text-center ticket-table-cell" style={{width:'18%'}}>
                          <span className="truncate-text ticket-date-value">{row.resolved === "Yes" ? (row.resolvedDate || '-') : '-'}</span>
                        </td>
                        <td className="py-4 px-2 text-center ticket-table-cell" style={{width:'16%'}}>
                          <button 
                            className="action-icon-btn action-info-btn" 
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
                            onClick={e => { e.stopPropagation(); handleTicketInfo(row); }}
                          >
                            <Info width={16} height={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination - Outside table, no box */}
          {filteredTickets.length > 0 && (
            <div className="flex justify-between items-center" style={{paddingBottom: '5px', margin: '0 36px 0 36px '}}>
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="pagination-number"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  {'<'}
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(filteredTickets.length / itemsPerPage) }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`pagination-number${currentPage === pageNumber ? ' active' : ''}`}
                      onClick={() => setCurrentPage(pageNumber)}
                      disabled={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-number"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTickets.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredTickets.length / itemsPerPage)}
                  aria-label="Next Page"
                >
                  {'>'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {showRaiseTicketModal && (
        <div className="modal-overlay">
          <div className="modal-content professional-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleTicketSubmit} className="apply-form professional" style={{gap:0}}>
              <h2 style={{ textAlign: 'center', width: '100%', marginBottom: '1rem', color: '#F26522' }}>Raise Ticket</h2>
              <div className="form-group center-field " style={{width:'25vw', marginBottom:'2px'}}>
                <label style={{ color: '#000', fontWeight: 400, margin:'0'}}>Subject *</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={ticketFormData.subject} 
                  onChange={handleTicketInputChange}
                  required
                  className="form-input center-select"
                  placeholder="Enter ticket subject..."
                />
              </div>
              <div className="form-group center-field">
                <label style={{ color: '#000', fontWeight: 400 }}>Priority *</label>
                <select 
                  name="priority" 
                  value={ticketFormData.priority} 
                  onChange={handleTicketInputChange}
                  required
                  className="form-input center-select"
                >
                  <option value="">Select Priority</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group center-field">
                <label style={{ color: '#000', fontWeight: 400 }}>Reason *</label>
                <textarea 
                  name="reason" 
                  value={ticketFormData.reason} 
                  onChange={handleTicketInputChange}
                  required
                  className="form-input reason-textarea"
                  rows="3"
                  placeholder="Please describe the problem..."
                ></textarea>
              </div>
              <div className="form-actions professional-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRaiseTicketModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-apply">
                  Raise Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showTicketEditModal && editingTicket && (
        <div className="modal-overlay">
          <div className="modal-content professional-form" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleTicketUpdate} className="apply-form professional">
              <h2 style={{ textAlign: 'center', width: '100%', marginBottom: '1rem', color: '#F26522' }}>Edit Ticket</h2>
              <div className="form-group center-field" style={{width:'25vw', marginBottom:'2px'}}>
                <label style={{ color: '#000', fontWeight: 400 }}>Subject *</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={ticketEditFormData.subject} 
                  onChange={handleTicketEditInputChange}
                  required
                  className="form-input center-select"
                />
              </div>
              <div className="form-group center-field">
                <label style={{ color: '#000', fontWeight: 400 }}>Priority *</label>
                <select 
                  name="priority" 
                  value={ticketEditFormData.priority} 
                  onChange={handleTicketEditInputChange}
                  required
                  className="form-input center-select"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group center-field">
                <label style={{ color: '#000', fontWeight: 400 }}>Reason *</label>
                <textarea 
                  name="reason" 
                  value={ticketEditFormData.reason} 
                  onChange={handleTicketEditInputChange}
                  required
                  className="form-input reason-textarea"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions professional-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowTicketEditModal(false)}>
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
      
      {showTicketInfoModal && selectedTicketInfo && (
        <div className="modal-overlay" onClick={() => setShowTicketInfoModal(false)}>
          <div className="modal-content" style={{ maxHeight: 'none', overflowY: 'visible' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ justifyContent: 'center' }}>
              <h2 style={{ color: '#F26522', textAlign: 'center', width: '100%' }}>Ticket Details</h2>
            </div>
            <div className="info-content">
              <div className="info-row">
                <strong style={{ color: '#000', fontWeight: 600 }}>Subject:</strong>
                <span style={{ color: '#000', fontWeight: 500 }}>{selectedTicketInfo.subject}</span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000', fontWeight: 600 }}>Submitted Date:</strong>
                <span style={{ color: '#000', fontWeight: 500 }}>{selectedTicketInfo.submittedDate}</span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000', fontWeight: 600 }}>Priority:</strong>
                <span className={getPriorityBadgeClass(selectedTicketInfo.priority)} style={{ color: '#000', fontWeight: 500 }}>
                  {selectedTicketInfo.priority}
                </span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000', fontWeight: 600 }}>Status:</strong>
                <span className={getStatusBadgeClass(selectedTicketInfo.resolved)} style={{ color: '#000', fontWeight: 500 }}>
                  {selectedTicketInfo.resolved === "Yes" ? "Closed" : "Open"}
                </span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000', fontWeight: 600 }}>Resolved Date:</strong>
                <span style={{ color: '#000', fontWeight: 500 }}>{selectedTicketInfo.resolvedDate}</span>
              </div>
              <div className="info-row">
                <strong style={{ color: '#000', fontWeight: 600 }}>Reason:</strong>
                <div className="reason-text" style={{ color: '#000', fontWeight: 500 }}>{selectedTicketInfo.reason}</div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowTicketInfoModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showTicketSuccessPopup && (
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
        }} onClick={() => setShowTicketSuccessPopup(false)}>
          <div className="popup-content" style={{ minWidth: 320, maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div className="popup-icon" style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Ticket Successfully Raised!</h3>
            <p style={{ fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' }}>Your ticket has been successfully submitted and is pending resolution.</p>
            <button className="popup-btn" style={{ marginTop: 8 }} onClick={() => setShowTicketSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}
      
      {showTicketEditSuccessPopup && (
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
        }} onClick={() => setShowTicketEditSuccessPopup(false)}>
          <div className="popup-content" style={{ minWidth: 320, maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div className="popup-icon" style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Ticket Edit Successfully Submitted!</h3>
            <p style={{ fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' }}>The ticket has been successfully updated.</p>
            <button className="popup-btn" style={{ marginTop: 8 }} onClick={() => setShowTicketEditSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TicketingSystemExport = (props) => <TicketingSystem {...props} />;

export default TicketingSystemExport; 