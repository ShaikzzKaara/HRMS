import React from 'react';
import './LeaveSummary.css';

const leaveTypeColor = {
  "Sick Leave": "#1d72b8",
  "Casual Leave": "#f4b400",
  "Maternity/Paternity": "#8e44ad"
};

const LeaveSummary = ({ leaveSummary }) => (
  <div className="leave-summary-panel no-bg">
    <div className="leave-summary leave-summary-grid">
      {leaveSummary.map((item) => {
        const percent = item.available > 0 ? Math.round((item.used / item.available) * 100) : 0;
        return (
          <div className="leave-box-item no-bg leave-summary-card" key={item.type}>
            <div className="leave-summary-type" style={{ marginBottom: '0.5rem' }}>{item.type}</div>
            <div className="leave-summary-progress-overlap large">
              <svg viewBox="0 0 36 36" className="circle-chart large">
                <path className="bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="progress" strokeDasharray={`${percent}, 100`} style={{ stroke: leaveTypeColor[item.type] || '#888' }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="circle-label-overlap large">{item.used} / {item.available}</div>
            </div>
            <div className="leave-info-row">
              <span>Available - {item.available}</span>
              <span>Used - {item.used}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default LeaveSummary; 