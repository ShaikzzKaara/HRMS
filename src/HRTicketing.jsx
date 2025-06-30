import React, { useState, useEffect } from 'react';
import TicketDetails from './TicketDetails.jsx';
import HRSidebar from './HRSidebar';
import TicketCard from './TicketCard.jsx';
import { FiList, FiAlertCircle, FiTrendingUp, FiCheckCircle, FiHash, FiAlertTriangle, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';

const CARDS_PER_PAGE = 2;

function HRTicketing(props) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Get HR ID from props or localStorage
  const hrId = props.user?.id || localStorage.getItem('hrId') || localStorage.getItem('userId');

  useEffect(() => {
    if (!hrId) return;
    fetch(`http://localhost:8000/ticket-raised?hrId=${hrId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Only tickets for this HR's employees
        const hrTickets = data.filter(ticket => ticket.hrId === hrId);
        // Only unresolved tickets (not Resolved or Closed)
        const unresolved = hrTickets.filter(ticket => ticket.status !== 'Resolved' && ticket.status !== 'Closed');
        setTickets(unresolved);
      })
      .catch(error => {
        console.warn('Failed to fetch tickets:', error);
        setTickets([]);
      });
  }, [hrId]);

  // Stats
  const total = tickets.length;
  const critical = tickets.filter(t => t.priority?.toLowerCase() === 'critical').length;
  const high = tickets.filter(t => t.priority?.toLowerCase() === 'high').length;
  const low = tickets.filter(t => t.priority?.toLowerCase() === 'low').length;

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === 'all' ||
      (ticket.priority && ticket.priority.toLowerCase() === priorityFilter);
    return matchesSearch && matchesPriority;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / CARDS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Main content layout: no background box, smaller cards, black text, heading, pagination
  const ticketingContent = (
    <div className="w-full min-h-screen flex flex-col items-center px-2 md:px-0 pt-2" style={{ background: 'none', boxShadow: 'none' }}>
      {/* Heading */}
      <div className="w-full flex items-center mb-2 mt-1" style={{maxWidth:'900px', marginLeft:'auto', marginRight:'auto'}}>
        <h1 style={{fontSize:'30px', color:'#F26522', fontWeight:700, letterSpacing:'-1px', textAlign:'left', margin:0}}>Tickets</h1>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-2 w-full max-w-4xl">
        <div className="bg-white p-4 rounded border border-gray-300 flex flex-col items-center min-w-0" style={{minHeight:'110px'}}>
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <div style={{fontSize:'14px', color:'#000', fontWeight:400}}>Total Tickets</div>
            <span className="ml-2 w-9 h-9 rounded flex items-center justify-center" style={{background:'#FFE5B4'}}>
              <FiHash size={28} color="#F26522" />
            </span>
          </div>
          <div style={{color:'#000', textAlign:'center', width:'100%'}}>
            <div style={{fontSize:'24px', color:'#444', fontWeight:'bold', marginBottom:'2px'}}>{total}</div>
            <div style={{fontSize:'12px', color:'#000', fontWeight:400}}>All submitted tickets</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-300 flex flex-col items-center min-w-0" style={{minHeight:'110px'}}>
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <div style={{fontSize:'14px', color:'#000', fontWeight:400}}>Critical Priority</div>
            <span className="ml-2 w-9 h-9 rounded flex items-center justify-center" style={{background:'#FFD6D6'}}>
              <FiAlertTriangle size={28} color="#E53935" />
            </span>
          </div>
          <div style={{color:'#000', textAlign:'center', width:'100%'}}>
            <div style={{fontSize:'24px', color:'#444', fontWeight:'bold', marginBottom:'2px'}}>{critical}</div>
            <div style={{fontSize:'12px', color:'#000', fontWeight:400}}>Requires immediate attention</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-300 flex flex-col items-center min-w-0" style={{minHeight:'110px'}}>
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <div style={{fontSize:'14px', color:'#000', fontWeight:400}}>High Priority</div>
            <span className="ml-2 w-9 h-9 rounded flex items-center justify-center" style={{background:'#D6E6FF'}}>
              <FiArrowUpCircle size={28} color="#1976D2" />
            </span>
          </div>
          <div style={{color:'#000', textAlign:'center', width:'100%'}}>
            <div style={{fontSize:'24px', color:'#444', fontWeight:'bold', marginBottom:'2px'}}>{high}</div>
            <div style={{fontSize:'12px', color:'#000', fontWeight:400}}>Important issues</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-300 flex flex-col items-center min-w-0" style={{minHeight:'110px'}}>
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <div style={{fontSize:'14px', color:'#000', fontWeight:400}}>Low Priority</div>
            <span className="ml-2 w-9 h-9 rounded flex items-center justify-center" style={{background:'#D6FFD6'}}>
              <FiArrowDownCircle size={28} color="#43A047" />
            </span>
          </div>
          <div style={{color:'#000', textAlign:'center', width:'100%'}}>
            <div style={{fontSize:'24px', color:'#444', fontWeight:'bold', marginBottom:'2px'}}>{low}</div>
            <div style={{fontSize:'12px', color:'#000', fontWeight:400}}>Can be addressed later</div>
          </div>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full max-w-4xl mb-4 mt-2">
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
          style={{color:'#000', background:'#fff', border:'1px solid #d1d5db'}}
        />
        <select
          value={priorityFilter}
          onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/4"
          style={{color:'#000', background:'#fff', border:'1px solid #d1d5db'}}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
      </div>
      {/* Ticket List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full mb-2" style={{minHeight:'255px', maxWidth:'900px', marginLeft:'auto', marginRight:'auto', marginBottom:'2rem'}}>
        {paginatedTickets.map(ticket => (
          <TicketCard
            key={ticket.employeeId}
            ticket={ticket}
            onAssign={() => {}}
            style={{ minWidth: '440px', width: '300px', maxWidth: '99vw' }}
          />
        ))}
      </div>
      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
      {/* Pagination (always visible) */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full mt-2 mb-2 gap-2" style={{maxWidth:'900px', marginLeft:'auto', marginRight:'auto'}}>
        <div className="text-sm text-gray-600 mb-2 md:mb-0">
          {filteredTickets.length > 0 && (
            <>Showing {((currentPage - 1) * CARDS_PER_PAGE) + 1} to {Math.min(currentPage * CARDS_PER_PAGE, filteredTickets.length)} of {filteredTickets.length} entries</>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-number px-3 py-1 rounded border border-orange-200 text-black bg-white disabled:opacity-50" aria-label="Previous Page">{'<'}</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`pagination-number px-3 py-1 rounded border border-orange-200 text-black bg-white ${currentPage === i + 1 ? 'font-bold bg-orange-100 border-orange-400' : ''}`}
              disabled={currentPage === i + 1}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-number px-3 py-1 rounded border border-orange-200 text-black bg-white disabled:opacity-50" aria-label="Next Page">{'>'}</button>
        </div>
      </div>
    </div>
  );

  return <HRSidebar mainContent={ticketingContent} onLogout={props.onLogout} />;
}

export default HRTicketing;