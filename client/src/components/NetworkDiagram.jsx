import React, { useState } from 'react';
import { 
  Laptop, 
  Server, 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Layers, 
  Globe, 
  Lock,
  Cpu
} from 'lucide-react';

export default function NetworkDiagram({ activeRequest = null }) {
  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture' | 'tcpip' | 'dns' | 'tls'

  const layers = [
    {
      num: 4,
      name: 'Application Layer',
      protocol: 'HTTP/1.1, HTTPS, RESTful JSON',
      dataUnit: 'Data Payload',
      role: 'SecureBank React Client sends JSON payload to Express REST APIs. Evaluates DFA authentication headers and JWT tokens.'
    },
    {
      num: 3,
      name: 'Transport Layer',
      protocol: 'TCP (Transmission Control Protocol)',
      dataUnit: 'Segment (Port 5000)',
      role: 'Ensures reliable, ordered, error-checked packet delivery via 3-way handshake (SYN, SYN-ACK, ACK) and sliding window flow control.'
    },
    {
      num: 2,
      name: 'Internet / Network Layer',
      protocol: 'IPv4 / IPv6, ICMP',
      dataUnit: 'IP Packet',
      role: 'Handles logical packet routing across autonomous systems (AS) from client IP 127.0.0.1 to banking server IP.'
    },
    {
      num: 1,
      name: 'Network Access / Physical Layer',
      protocol: 'Ethernet, 802.11 Wi-Fi, Fiber',
      dataUnit: 'Frames / Bits',
      role: 'Physical bit transmission across network interfaces, switches, and optical hardware using MAC addressing.'
    }
  ];

  return (
    <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-5">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Computer Networks Protocol Visualizer</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Client-Server Architecture • TCP/IP Protocol Stack • OSI Mapping
          </p>
        </div>

        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-cyan-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('tcpip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tcpip'
                ? 'bg-cyan-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TCP/IP 4-Layer Stack
          </button>
          <button
            onClick={() => setActiveTab('dns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dns'
                ? 'bg-cyan-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DNS Lookup
          </button>
          <button
            onClick={() => setActiveTab('tls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tls'
                ? 'bg-cyan-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TLS 1.3 Handshake
          </button>
        </div>
      </div>

      {/* Tab 1: End-to-End Architecture Flow */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Node 1: Client Browser */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-navy-900 border border-cyan-500/30 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-2 shadow-glow">
                  <Laptop className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Client Tier</h4>
                <p className="text-xs text-cyan-300 font-mono">React 18 + Vite (Port 5173)</p>
                <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                  <p>• Single Page App (SPA)</p>
                  <p>• Client-side DFA Parser</p>
                  <p>• Axios JSON Dispatcher</p>
                </div>
              </div>

              {/* Node 2: Express Server */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-navy-900 border border-cyan-500/30 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-400 mb-2 shadow-glow">
                  <Server className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Application Server</h4>
                <p className="text-xs text-cyan-300 font-mono">Node.js + Express (Port 5000)</p>
                <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                  <p>• REST API & Network Logger</p>
                  <p>• DFA Validation Gatekeeper</p>
                  <p>• JWT & bcrypt Verification</p>
                </div>
              </div>

              {/* Node 3: Database */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-navy-900 border border-cyan-500/30 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2 shadow-glow">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Persistence Tier</h4>
                <p className="text-xs text-emerald-300 font-mono">MongoDB / In-Memory</p>
                <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                  <p>• Atomic Account Balance Locks</p>
                  <p>• Immutable Transaction Ledger</p>
                  <p>• Users & Credential Hashes</p>
                </div>
              </div>

            </div>

            {/* Architecture Pipeline Flow Summary */}
            <div className="mt-4 pt-3 border-t border-navy-800 text-center font-mono text-xs text-slate-300">
              <span className="text-cyan-400 font-bold">User Browser</span>
              <span className="text-slate-500 mx-2">──[HTTP/HTTPS REST JSON]──&gt;</span>
              <span className="text-blue-400 font-bold">Express API Engine</span>
              <span className="text-slate-500 mx-2">──[Mongoose TCP Driver]──&gt;</span>
              <span className="text-emerald-400 font-bold">Database Cluster</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: TCP/IP 4-Layer Stack */}
      {activeTab === 'tcpip' && (
        <div className="space-y-3">
          {layers.map((layer) => (
            <div
              key={layer.num}
              className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-700/60 font-mono font-bold text-xs flex items-center justify-center">
                    L{layer.num}
                  </span>
                  <span className="font-bold text-sm text-white">{layer.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-cyan-300">{layer.protocol}</span>
                  <span className="px-2 py-0.5 rounded bg-navy-900 text-slate-400 border border-navy-800">
                    {layer.dataUnit}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {layer.role}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: DNS Lookup Cycle */}
      {activeTab === 'dns' && (
        <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800 space-y-3 text-xs">
          <h4 className="font-bold text-white text-sm mb-2">Hierarchical DNS Resolution for `securebank.local`</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 font-mono">
            <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
              <span className="text-cyan-400 font-bold">Step 1: Resolver</span>
              <p className="text-slate-400 mt-1">Browser checks local cache, then queries Local DNS Server (8.8.8.8).</p>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
              <span className="text-blue-400 font-bold">Step 2: Root Server</span>
              <p className="text-slate-400 mt-1">Root Name Server (`.` root) returns authoritative TLD servers.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
              <span className="text-purple-400 font-bold">Step 3: TLD Server</span>
              <p className="text-slate-400 mt-1">TLD Server returns Authoritative Nameserver IP addresses.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
              <span className="text-emerald-400 font-bold">Step 4: Host Record</span>
              <p className="text-slate-400 mt-1">Authoritative DNS returns `A` Record with target host IP.</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-2">
            Once IP resolution completes, the client initiates the TCP 3-way handshake over port 5000 to begin the HTTP/HTTPS request cycle.
          </p>
        </div>
      )}

      {/* Tab 4: TLS 1.3 / HTTPS Encryption Handshake */}
      {activeTab === 'tls' && (
        <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Transport Layer Security (TLS 1.3) Cryptographic Handshake</h4>
          </div>
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-navy-900 border border-navy-800">
              <span className="text-cyan-300 font-bold">1. ClientHello</span>
              <span className="text-slate-400">Supported Cipher Suites + Diffie-Hellman Key Share</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-navy-900 border border-navy-800">
              <span className="text-blue-300 font-bold">2. ServerHello & Certificate</span>
              <span className="text-slate-400">Selected Cipher (AES_256_GCM) + X.509 Digital Certificate</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-navy-900 border border-navy-800">
              <span className="text-purple-300 font-bold">3. Session Key Derivation</span>
              <span className="text-slate-400">ECDHE ephemeral secret generates symmetric AES keys</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <span className="font-bold">4. Encrypted Banking Tunnel</span>
              <span>Zero-round-trip session resumption (0-RTT) active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
