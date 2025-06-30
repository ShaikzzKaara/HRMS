import React from 'react';
import './TicketDetails.css';

function TicketDetails({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ticket Details</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p><strong>Ticket ID:</strong> {ticket.id}</p>
          <p><strong>Raised By:</strong> {ticket.employeeName} ({ticket.employeeId})</p>
          <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
          <p><strong>Priority:</strong> <span className={`priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></p>
          <p><strong>Description:</strong></p>
          <p>{ticket.ticketDescription}</p>
        </div>
        <div className="modal-footer">
          <button className="assign-button">Assign To</button>
        </div>
      </div>
    </div>
  );
}

export default TicketDetails; 