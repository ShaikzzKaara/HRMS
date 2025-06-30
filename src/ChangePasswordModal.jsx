import React from 'react';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ show, onClose, onSubmit, form, onInputChange, error, success }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 350 }}>
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className="popup-icon">✅</div>
            <h3>Password Updated!</h3>
            <p>Your password has been updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="apply-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={onInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onInputChange}
                className="form-input"
                required
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal; 