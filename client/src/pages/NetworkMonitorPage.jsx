import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Activity, 
  Server, 
  Wifi, 
  RefreshCw, 
  Send, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Zap,
  Globe,
  Radio,
  Sliders
} from 'lucide-react';
import { networkApi } from '../services/api';
import NetworkDiagram from '../components/NetworkDiagram';
import { formatDate } from '../utils/formatters';

export default function NetworkMonitorPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingLatency, setPingLatency] = useState(null);
  const [pinging, setPinging] = useState(false);
  
  // Simulated latency experiment
  const [simulatedDelay, setSimulatedDelay] = useState(250);
  const [simulating, setSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState(null);

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 4000); // Polling every 4 seconds for live telemetry
    return () => clearInterval(interval);
  }, []);

  const fetchNetworkData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        networkApi.getLogs(35),
        networkApi.getStats()
      ]);

      if (logsRes.data.success) {
        setLogs(logsRes.data.logs || []);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats || null);
      }
    } catch (err) {
      console.warn('Network monitor poll error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePing = async () => {
    try {
      setPinging(true);
      const start = performance.now();
      const res = await networkApi.ping();
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);
      fetchNetworkData(); // Refresh log immediately
    } catch (err) {
      console.error('Ping failed:', err);
    } finally {
      setPinging(false);
    }
  };

  const handleSimulateLatency = async () => {
    try {
      setSimulating(true);
      const start = performance.now();
      const res = await networkApi.simulateLatency(simulatedDelay);
      const totalElapsed = Math.round(performance.now() - start);
      setSimulatedResult({
        requested: simulatedDelay,
        actualRtt: totalElapsed,
        serverElapsed: res.data.actualDelayElapsedMs
      });
      fetchNetworkData();
    } catch (err) {
      console.error('Latency simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 text-xs font-mono shadow-glow mb-2">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Computer Networks Telemetry & Protocol Inspection</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Live Network Activity & Traffic Monitor
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real Express REST API request-response cycles • TCP/IP Layer Diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePing}
            disabled={pinging}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-navy-950 hover:bg-cyan-400 font-bold font-mono text-xs flex items-center gap-1.5 shadow-glow transition-all disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
            <span>{pinging ? 'Pinging...' : 'Ping REST API'}</span>
          </button>

          <button
            onClick={fetchNetworkData}
            className="p-2 rounded-xl bg-navy-900 border border-navy-700 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Real Performance Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total API Requests */}
        <div className="fintech-card rounded-2xl p-4 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL HTTP REQUESTS</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-2">
            {stats?.totalRequests || logs.length}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            {stats?.successfulRequests || 0} Successful (2xx)
          </div>
        </div>

        {/* Real RTT Latency */}
        <div className="fintech-card rounded-2xl p-4 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AVG ROUND-TRIP TIME (RTT)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-2">
            {stats?.averageLatencyMs || 0} ms
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Last Ping: {pingLatency !== null ? `${pingLatency} ms` : 'Ready'}
          </div>
        </div>

        {/* Network Throughput */}
        <div className="fintech-card rounded-2xl p-4 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>DATA TRANSFERRED</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-2">
            {((stats?.totalBytesTransferred || 0) / 1024).toFixed(2)} KB
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            TCP socket packet buffer
          </div>
        </div>

        {/* Server & DB Status */}
        <div className="fintech-card rounded-2xl p-4 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PERSISTENCE ENGINE</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-2 truncate">
            {stats?.dbStatus?.mode || 'Active'}
          </div>
          <div className="text-[10px] text-cyan-300 font-mono mt-1 truncate">
            {stats?.dbStatus?.label || 'Safe Mode'}
          </div>
        </div>

      </div>

      {/* 3. Interactive Protocol Stack & Architecture Diagram */}
      <NetworkDiagram />

      {/* 4. Active Latency Simulator (Clearly Distinguishable Experiment) */}
      <div className="fintech-card rounded-2xl p-5 border border-purple-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                LAB EXPERIMENT
              </span>
              <h3 className="text-sm font-bold text-white">
                Simulated WAN / Carrier Network Latency Injection
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Notice: This is a controlled experimental simulation to demonstrate packet propagation delay over wide-area networks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateLatency}
              disabled={simulating}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${simulating ? 'animate-bounce' : ''}`} />
              <span>{simulating ? 'Transmitting...' : `Inject ${simulatedDelay}ms Delay`}</span>
            </button>
          </div>
        </div>

        {/* Preset Delay Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">SELECT LATENCY PRESET:</span>
          {[
            { label: 'LAN (25ms)', ms: 25 },
            { label: '4G LTE (120ms)', ms: 120 },
            { label: 'Broadband (250ms)', ms: 250 },
            { label: 'Satellite / 3G (600ms)', ms: 600 }
          ].map((item) => (
            <button
              key={item.ms}
              onClick={() => setSimulatedDelay(item.ms)}
              className={`px-3 py-1 rounded-lg border transition-colors ${
                simulatedDelay === item.ms
                  ? 'bg-purple-950 text-purple-300 border-purple-500 font-bold'
                  : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {simulatedResult && (
          <div className="p-3 rounded-xl bg-navy-950 border border-purple-900/60 font-mono text-xs text-slate-300 flex items-center justify-between">
            <span>Result: Injected {simulatedResult.requested}ms artificial delay</span>
            <span className="text-purple-300 font-bold">Total Measured RTT: {simulatedResult.actualRtt}ms</span>
          </div>
        )}
      </div>

      {/* 5. Live Express Application Network Activity Logs (REAL LOGS) */}
      <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-sm font-bold text-white">
                Live HTTP Traffic Stream (Actual Application Requests)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Captured in real-time by Express `networkLogger` middleware on Port 5000
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300">
            {logs.length} Recorded Packets
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            Waiting for inbound network traffic...
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint URL</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Latency</th>
                  <th className="py-2.5 px-3 text-right">Size</th>
                  <th className="py-2.5 px-3">Client IP</th>
                  <th className="py-2.5 px-3">Network Layer Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {logs.map((log) => {
                  const isSuccess = log.statusCode >= 200 && log.statusCode < 400;
                  return (
                    <tr key={log.id} className="hover:bg-navy-850/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {log.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          log.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-purple-950 text-purple-400'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 truncate max-w-[200px]" title={log.url}>
                        {log.url}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'bg-rose-950 text-rose-400 border border-rose-700'
                        }`}>
                          {log.statusCode} {log.statusText}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                        {log.responseTimeMs} ms
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {log.responseSize || log.requestSize || 128} B
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {log.clientIp}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[10px] truncate max-w-[180px]">
                        {log.networkLayer?.layer7 || 'HTTP L7 / TCP L4'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
