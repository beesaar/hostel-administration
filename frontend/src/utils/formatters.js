export const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  const statusMap = {
    'Leave_Requested': 'Leave Request',
    'ACTIVE_RESIDENT': 'Current Resident',
    'NO_ROOM': 'No Accommodation',
    'PENDING': 'Booking Pending',
    'Pending': 'Pending',
    'Approved': 'Approved',
    'Rejected': 'Rejected',
    'Cancelled': 'Cancelled',
    'Completed': 'Completed',
    'In Progress': 'In Progress',
    'Resolved': 'Resolved'
  };

  return statusMap[status] || status;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return `₹${amount.toLocaleString('en-IN')}`;
};
