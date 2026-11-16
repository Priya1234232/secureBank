import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://securebank-8n83.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Client-side network activity log for live demonstration
export const clientNetworkLog = [];

// Request interceptor: attach token & timestamp
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    const token = localStorage.getItem('securebank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: compute RTT & log
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Add to client-side network inspector
    clientNetworkLog.unshift({
      id: 'CLI_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      durationMs: duration,
      timestamp: endTime.toISOString(),
      size: JSON.stringify(response.data || '').length,
      protocol: 'HTTP/1.1 (TCP/IP)'
    });
    if (clientNetworkLog.length > 50) clientNetworkLog.pop();

    return response;
  },
  (error) => {
    const endTime = new Date();
    const startTime = error.config?.metadata?.startTime || endTime;
    const duration = endTime - startTime;

    clientNetworkLog.unshift({
      id: 'ERR_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      method: error.config?.method?.toUpperCase() || 'GET',
      url: error.config?.url || 'API',
      status: error.response?.status || 0,
      durationMs: duration,
      timestamp: endTime.toISOString(),
      error: error.message,
      protocol: 'HTTP/1.1 (TCP/IP)'
    });
    if (clientNetworkLog.length > 50) clientNetworkLog.pop();

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile')
};

export const accountApi = {
  getAccount: () => api.get('/accounts'),
  getBalance: () => api.get('/accounts/balance'),
  lookupAccount: (accountNumber) => api.get(`/accounts/lookup/${accountNumber}`)
};

export const transactionApi = {
  deposit: (amount, description) => api.post('/transactions/deposit', { amount, description }),
  transfer: (data) => api.post('/transactions/transfer', data),
  getHistory: (params) => api.get('/transactions/history', { params }),
  getStatus: (id) => api.get(`/transactions/${id}/status`)
};

export const dfaApi = {
  getDefinition: () => api.get('/dfa/definition'),
  simulate: (input) => api.post('/dfa/simulate', { input }),
  getPresets: () => api.get('/dfa/presets'),
  getTransactionDFA: () => api.get('/dfa/transaction-dfa'),
  simulateTransaction: (events) => api.post('/dfa/transaction-simulate', { events })
};

export const networkApi = {
  getLogs: (limit = 40) => api.get('/network/logs', { params: { limit } }),
  getStats: () => api.get('/network/stats'),
  ping: () => api.get('/network/ping'),
  simulateLatency: (delayMs) => api.post('/network/simulate-latency', { delayMs }),
  getArchitecture: () => api.get('/network/architecture')
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getTransactions: () => api.get('/admin/transactions')
};

export default api;
