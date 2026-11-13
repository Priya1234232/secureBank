/**
 * Computer Networks Middleware: Live Traffic & Network Activity Logger
 * Demonstrates:
 *  - Client-Server HTTP/HTTPS request-response lifecycle
 *  - Network latency measurement (RTT)
 *  - Packet & payload size calculation
 *  - HTTP Status Codes tracking (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Server Error)
 *  - OSI Layer 7 / TCP/IP Layer 4 metrics
 */

const MAX_LOGS = 150;
const networkLogs = [];

let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalLatencyMs: 0,
  totalBytesTransferred: 0,
  statusCodes: {},
  methods: {}
};

function networkLogger(req, res, next) {
  const startTime = process.hrtime();
  const requestId = 'REQ_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const requestSize = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : JSON.stringify(req.body || '').length;

  // Track original end function to compute duration and response size
  const originalEnd = res.end;
  let responseSize = 0;

  res.end = function (chunk, encoding) {
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }

    const diff = process.hrtime(startTime);
    const responseTimeMs = Number(((diff[0] * 1e3) + (diff[1] * 1e-6)).toFixed(2));
    const statusCode = res.statusCode;

    // Build network packet log entry
    const logEntry = {
      id: requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      statusCode: statusCode,
      statusText: getStatusText(statusCode),
      responseTimeMs: responseTimeMs,
      clientIp: clientIp,
      protocol: req.httpVersion ? `HTTP/${req.httpVersion}` : 'HTTP/1.1',
      requestSize: requestSize,
      responseSize: responseSize,
      userAgent: req.headers['user-agent'] || 'Unknown Client',
      networkLayer: {
        layer7: 'HTTP/HTTPS Application Layer',
        layer4: 'TCP Transport (Port ' + (req.socket.localPort || 5000) + ')',
        layer3: 'IPv4/IPv6 Network Layer (' + clientIp + ')'
      }
    };

    // Update statistics
    stats.totalRequests++;
    stats.totalLatencyMs += responseTimeMs;
    stats.totalBytesTransferred += (requestSize + responseSize);
    stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
    stats.methods[req.method] = (stats.methods[req.method] || 0) + 1;

    if (statusCode >= 200 && statusCode < 400) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    // Maintain circular log buffer
    networkLogs.unshift(logEntry);
    if (networkLogs.length > MAX_LOGS) {
      networkLogs.pop();
    }

    originalEnd.apply(res, arguments);
  };

  next();
}

function getStatusText(code) {
  const codes = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error'
  };
  return codes[code] || 'Unknown';
}

function getRecentLogs(limit = 50) {
  return networkLogs.slice(0, limit);
}

function getNetworkStats() {
  const avgLatency = stats.totalRequests > 0 
    ? Number((stats.totalLatencyMs / stats.totalRequests).toFixed(2)) 
    : 0;

  return {
    ...stats,
    averageLatencyMs: avgLatency,
    activeConnections: 1,
    uptimeSeconds: Math.floor(process.uptime()),
    serverTimestamp: new Date().toISOString()
  };
}

module.exports = {
  networkLogger,
  getRecentLogs,
  getNetworkStats
};
