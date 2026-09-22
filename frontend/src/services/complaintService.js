import api from './api';

const createComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

const getStudentComplaints = async () => {
  const response = await api.get('/complaints/student');
  return response.data;
};

const getManagerComplaints = async () => {
  const response = await api.get('/complaints/manager');
  return response.data;
};

const updateComplaintStatus = async (id, statusData) => {
  const response = await api.patch(`/complaints/${id}/status`, statusData);
  return response.data;
};

const complaintService = {
  createComplaint,
  getStudentComplaints,
  getManagerComplaints,
  updateComplaintStatus,
};

export default complaintService;
