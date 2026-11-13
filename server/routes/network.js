const express = require('express');
const router = express.Router();
const { getRecentLogs, getNetworkStats } = require('../middleware/networkLogger');
const { getDbStatus } = require('../config/db');

/**
 * @route   GET /api/network/logs
 * @desc    Fetch real application network logs captured by Express middleware
 */
router.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 40;
  const logs = getRecentLogs(limit);
  res.json({
    success: true,
    count: logs.length,
    logs
  });
});

/**
 * @route   GET /api/network/stats
 * @desc    Fetch real aggregated server and network performance metrics
 */
router.get('/stats', (req, res) => {
  const stats = getNetworkStats();
  const dbStatus = getDbStatus();

  res.json({
    success: true,
    stats: {
      ...stats,
      dbStatus,
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rssMB: (process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
        heapUsedMB: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMB: (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2)
      }
    }
  });
});

/**
 * @route   GET /api/network/ping
 * @desc    Ping endpoint to measure active round-trip latency (RTT)
 */
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    serverTimeEpoch: Date.now()
  });
});

/**
 * @route   POST /api/network/simulate-latency
 * @desc    Simulate configurable network delay to illustrate packet transmission latency
 */
router.post('/simulate-latency', async (req, res) => {
  const delayMs = Math.min(Math.max(parseInt(req.body.delayMs, 10) || 300, 10), 3000);
  const startedAt = Date.now();

  await new Promise(resolve => setTimeout(resolve, delayMs));

  const elapsed = Date.now() - startedAt;

  res.json({
    success: true,
    simulatedDelayRequestedMs: delayMs,
    actualDelayElapsedMs: elapsed,
    networkStatus: 'SIMULATED_ROUND_TRIP_COMPLETE',
    message: `Network packet journey simulated across WAN link with ${delayMs}ms injected latency.`
  });
});

/**
 * @route   GET /api/network/architecture
 * @desc    Architecture metadata for interactive client-server diagrams
 */
router.get('/architecture', (req, res) => {
  res.json({
    success: true,
    tiers: [
      {
        id: 'tier-client',
        name: 'Client Tier',
        component: 'Browser (User Interface)',
        tech: 'React 18 + Vite SPA',
        port: 5173,
        role: 'Renders DOM, runs client-side DFA parser, sends JSON payloads via Axios over TCP'
      },
      {
        id: 'tier-transport',
        name: 'Network Transport',
        component: 'TCP/IP Stack (HTTP/HTTPS)',
        tech: 'TLS 1.3 / TCP Socket Port 5000',
        role: 'Reliable byte-stream transmission, packet sequence control, TLS encryption handshake'
      },
      {
        id: 'tier-server',
        name: 'Application Server',
        component: 'REST API Engine',
        tech: 'Node.js + Express.js',
        port: 5000,
        role: 'Processes HTTP verbs, executes DFA validator middleware, manages JWT sessions, orchestrates FSM'
      },
      {
        id: 'tier-database',
        name: 'Database Persistence',
        component: 'Ledger Storage',
        tech: getDbStatus().label,
        role: 'Stores user credentials (bcrypt hashed), demo balances in INR, and immutable transaction ledger'
      }
    ]
  });
});

module.exports = router;
