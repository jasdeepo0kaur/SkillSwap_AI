import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'completed': return 'completed';
      case 'scheduled':
      case 'in-progress': return 'in-progress';
      case 'pending':
      case 'accepted': return 'pending';
      default: return 'cancelled';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

export default StatusBadge;
