require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDbStatus } = require('./config/db');
const { networkLogger } = require('./middleware/networkLogger');
const { seedData } = require('./seed/seedData');

// Route Handlers
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const dfaRoutes = require('./routes/dfa');
const networkRoutes = require('./routes/network');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins in development / client URL
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Computer Networks Middleware: Log all incoming HTTP traffic
app.use(networkLogger);

// Base Health & System Route
app.get('/', (req, res) => {
  res.json({
    name: 'SecureBank – Secure Online Banking System Using DFA API',
    version: '1.0.0',
    status: 'ONLINE',
    subjectsIntegrated: [
      'Full Stack Web Development (React + Node.js/Express + MongoDB)',
      'Computer Networks (HTTP/HTTPS, TCP/IP Stack, RTT Latency, REST API Inspection)',
      'Formal Languages and Automata Theory (DFA M=(Q, Σ, δ, q0, F) + Transaction FSM)'
    ],
    database: getDbStatus(),
    uptime: Math.floor(process.uptime()) + ' seconds',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dfa', dfaRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/admin', adminRoutes);

// Centralized 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint Not Found: ${req.method} ${req.originalUrl}`
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Server Initialization
async function startServer() {
  try {
    // Attempt DB Connection
    await connectDB();

    // Auto-seed demo data so the system is ready immediately
    try {
      await seedData();
    } catch (seedErr) {
      console.warn('Seeding note:', seedErr.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 SecureBank Server running on port ${PORT}`);
      console.log(`📡 Network Monitor: http://localhost:${PORT}/api/network/logs`);
      console.log(`🔤 DFA Simulator API: http://localhost:${PORT}/api/dfa/definition`);
      console.log(`💳 Database Engine: ${getDbStatus().label}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start SecureBank server:', error);
  }
}

startServer();
