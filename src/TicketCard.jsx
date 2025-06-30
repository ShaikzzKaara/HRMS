import React from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

const TicketCard = ({ ticket, onAssign, style }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const firstLetter = ticket.employeeName ? ticket.employeeName.charAt(0).toUpperCase() : '?';

  return (
    <div
      className="bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 p-3"
      style={{
        fontSize: '0.97rem',
        color: '#000',
        width: '400px',
        minWidth: '320px',
        maxWidth: '99vw',
        minHeight: '210px',
        height: 'auto',
        border: '1px solid #d1d5db',
        ...style
      }}
    >
      {/* Reporter Info */}
      <div className="flex items-center mb-2">
        <div style={{width:32, height:32, borderRadius:'50%', background:'#F26522', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:'1.1em', marginRight:10}}>
          {firstLetter}
        </div>
        <span style={{fontWeight:400, color:'#000', fontSize:'1.08em'}}>
          Reported by {ticket.employeeName}
        </span>
      </div>
      {/* Created Date */}
      <div className="flex items-center mb-2" style={{color:'#444', fontSize:'0.95em'}}>
        <FiClock style={{marginRight:6}} />
        <span>{formatDate(ticket.date)}</span>
      </div>
      {/* Issue Heading and Subject */}
      <div style={{fontSize:'1.1em', fontWeight:600, color:'#F26522', marginBottom:4}}>Issue</div>
      <div style={{fontSize:'1.05em', color:'#000', fontWeight:400, marginBottom:8}}>{ticket.ticketDescription}</div>
      {/* Assigned To / Assign Button */}
      <div className="flex items-center justify-between mt-2">
        <span style={{fontSize:'0.97em', color:'#E53935', fontWeight:500, display:'flex', alignItems:'center'}}>
          <FiAlertCircle style={{marginRight:4}} /> Unassigned
        </span>
        <button
          onClick={() => onAssign?.(ticket.employeeId)}
          className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors text-xs font-medium border border-orange-500"
          style={{minHeight:'28px'}}
        >
          Assign
        </button>
      </div>
    </div>
  );
};

export default TicketCard; 