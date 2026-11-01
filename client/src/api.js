import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const http = axios.create({ baseURL: API_BASE });

export const getReports = () => http.get('/reports').then((r) => r.data.reports);

// Do NOT set Content-Type manually for FormData; axios adds the correct boundary.
export const submitReport = (formData) => http.post('/report', formData).then((r) => r.data.report);

export const officerLogin = (pin) => http.post('/officer/login', { pin }).then((r) => r.data);

export const updateStatus = (id, status, pin) =>
  http
    .patch(`/reports/${id}/status`, { status }, { headers: { 'x-officer-pin': pin } })
    .then((r) => r.data.report);

export const reportImageUrl = (id) => `${API_BASE}/reports/${id}/image`;

export const errorText = (err) =>
  err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Something went wrong';
