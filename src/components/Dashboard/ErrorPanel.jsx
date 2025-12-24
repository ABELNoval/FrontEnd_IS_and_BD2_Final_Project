import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import '../../styles/components/ErrorPanel.css';

const ErrorPanel = ({ errors, onClose }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="error-panel">
      <div className="error-panel-header">
        <div className="error-title">
          <AlertTriangle size={20} />
          <span>Errors Detected</span>
        </div>
        <button className="btn-close-error" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="error-list">
        {errors.map((err, index) => (
          <div key={index} className="error-item">
            {err}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorPanel;
