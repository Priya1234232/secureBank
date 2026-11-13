import React, { useState } from 'react';
import { 
  Code2, 
  Network, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Server, 
  CheckCircle2, 
  Globe, 
  Lock,
  Zap,
  BookOpen
} from 'lucide-react';
import TransactionDfaVisualizer from '../components/TransactionDfaVisualizer';
import NetworkDiagram from '../components/NetworkDiagram';

export default function ThreeSubjectsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'web' | 'networks' | 'flat'

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-glow">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Curricular Triad: Engineering • Networking • Automata Theory</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Three Academic Disciplines Integration Matrix
        </h1>

        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          SecureBank was conceived to solve a key challenge in computer science education: bridging theoretical automata theory with production full-stack engineering and real-world networking telemetry. Here is how all three disciplines operate together in a single banking platform.
        </p>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'all', label: 'All 3 Subjects Overview' },
            { id: 'flat', label: '1. Automata Theory (FLAT)' },
            { id: 'networks', label: '2. Computer Networks' },
            { id: 'web', label: '3. Full Stack Web Dev' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-navy-950 shadow-glow'
                  : 'bg-navy-900 border border-navy-700 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Unified Life-of-a-Transaction Table */}
      <div className="fintech-card rounded-2xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Life of a ₹5,000 Transfer: Simultaneous Tri-Subject Execution</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Tracing what happens at every layer when Rahul transfers ₹5,000 to Priya
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-navy-950 px-2 py-1 rounded border border-navy-800">
            END-TO-END FLOW
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Step</th>
                <th className="py-2.5 px-3 text-cyan-300">1. Full Stack Web Dev</th>
                <th className="py-2.5 px-3 text-blue-300">2. Computer Networks</th>
                <th className="py-2.5 px-3 text-emerald-300">3. FLAT (Automata Theory)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              <tr className="hover:bg-navy-850/50">
                <td className="py-3 px-3 font-bold text-white">1. Form Submit</td>
                <td className="py-3 px-3 text-slate-300">
                  React captures receiver account `SB7089123456`, amount `₹5,000`, and user JWT.
                </td>
                <td className="py-3 px-3 text-slate-300">
                  Serialized into JSON payload, dispatched via `POST /api/transactions/transfer` over TCP port 5000.
                </td>
                <td className="py-3 px-3 text-emerald-300 font-bold">
                  Transaction DFA initializes in state: <strong>INITIATED (q₀)</strong>.
                </td>
              </tr>

              <tr className="hover:bg-navy-850/50">
                <td className="py-3 px-3 font-bold text-white">2. Network Transit</td>
                <td className="py-3 px-3 text-slate-300">
                  Express JSON parser and `auth.js` middleware verify JWT signature & expiration.
                </td>
                <td className="py-3 px-3 text-slate-300">
                  `networkLogger.js` middleware timestamps packet arrival and starts high-res timer.
                </td>
                <td className="py-3 px-3 text-emerald-300 font-bold">
                  DFA consumes `DISPATCH_SUBMIT` symbol ➔ transitions to: <strong>VALIDATING (q₁)</strong>.
                </td>
              </tr>

              <tr className="hover:bg-navy-850/50">
                <td className="py-3 px-3 font-bold text-white">3. Balance Check</td>
                <td className="py-3 px-3 text-slate-300">
                  Backend queries database: confirms Rahul's balance ₹1,50,000 $\ge$ ₹5,000.
                </td>
                <td className="py-3 px-3 text-slate-300">
                  Payload verified within transport bounds; no socket disconnection.
                </td>
                <td className="py-3 px-3 text-emerald-300 font-bold">
                  Validation passes ➔ DFA transitions on `CHECK_PASS` to: <strong>APPROVED (q₂)</strong>.
                </td>
              </tr>

              <tr className="hover:bg-navy-850/50">
                <td className="py-3 px-3 font-bold text-white">4. Atomic Settlement</td>
                <td className="py-3 px-3 text-slate-300">
                  Mongoose/Memory atomics execute: Rahul ₹-5,000, Priya ₹+5,000 simultaneously.
                </td>
                <td className="py-3 px-3 text-slate-300">
                  Express crafts HTTP 201 response with transaction JSON and stops latency timer.
                </td>
                <td className="py-3 px-3 text-emerald-300 font-bold">
                  DFA consumes `COMMIT_PASS` ➔ halts in accepting state: <strong>COMPLETED (q₃ ∈ F)</strong>.
                </td>
              </tr>

              <tr className="hover:bg-navy-850/50">
                <td className="py-3 px-3 font-bold text-white">5. Client Update</td>
                <td className="py-3 px-3 text-slate-300">
                  React updates user balance, renders electronic receipt modal, triggers confetti.
                </td>
                <td className="py-3 px-3 text-slate-300">
                  Response logged in Network Monitor table: status 201, ~2.1ms RTT, 412 bytes.
                </td>
                <td className="py-3 px-3 text-emerald-300 font-bold">
                  Immutable FSM transition history attached to transaction record permanently.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Deep-Dive Cards for Each Subject */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Discipline 1: FLAT */}
        <div className="fintech-card rounded-2xl p-6 border border-emerald-500/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              DISCIPLINE 1
            </span>
            <h3 className="text-lg font-bold text-white pt-1">
              Formal Languages & Automata Theory (FLAT)
            </h3>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>Mathematical DFA Formulation:</strong> Implements $M = (Q, \Sigma, \delta, q_0, F)$ programmatically with explicit delta tables.
            </p>
            <p>
              <strong>Transaction State Modeling:</strong> Eliminates race conditions and invalid transaction states by enforcing strict transitions: <code>INITIATED</code> $\to$ <code>VALIDATING</code> $\to$ <code>APPROVED</code> $\to$ <code>COMPLETED</code>.
            </p>
            <p>
              <strong>Syntax Barrier:</strong> Credential DFA deterministically validates input strings against formal language grammars $L(M)$ before any cryptographic processing.
            </p>
          </div>
        </div>

        {/* Discipline 2: Computer Networks */}
        <div className="fintech-card rounded-2xl p-6 border border-blue-500/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-glow">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              DISCIPLINE 2
            </span>
            <h3 className="text-lg font-bold text-white pt-1">
              Computer Networks (TCP/IP & OSI)
            </h3>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>Client-Server Architecture:</strong> Real HTTP/1.1 and HTTPS REST communication between the React Single Page App and Express API.
            </p>
            <p>
              <strong>Live Telemetry:</strong> In-memory circular buffer captures incoming TCP packets, response round-trip latency in milliseconds, payload sizes, and IP headers.
            </p>
            <p>
              <strong>Protocol Visualizers:</strong> Interactive explanations for the TCP 3-Way Handshake, DNS resolution hierarchy, and TLS 1.3 cryptographic session establishment.
            </p>
          </div>
        </div>

        {/* Discipline 3: Full Stack Web Development */}
        <div className="fintech-card rounded-2xl p-6 border border-cyan-500/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              DISCIPLINE 3
            </span>
            <h3 className="text-lg font-bold text-white pt-1">
              Full Stack Web Development
            </h3>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>MERN Architecture:</strong> React 18, Vite, Node.js, Express, and MongoDB Mongoose models (`User`, `Account`, `Transaction`).
            </p>
            <p>
              <strong>Banking Security:</strong> Salted password hashing via bcrypt (10 rounds) and stateless JWT Bearer authorization tokens.
            </p>
            <p>
              <strong>Atomic Balances:</strong> Ledger updates use database atomic increment/decrement locks preventing overdrafts and race conditions.
            </p>
          </div>
        </div>

      </div>

      {/* 4. Live Embedded Transaction DFA Visualizer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Interactive Automata Demonstration: Transaction Modeling DFA</span>
          </h2>
        </div>
        <TransactionDfaVisualizer currentState="APPROVED" />
      </div>

      {/* 5. Live Embedded Computer Networks Diagram */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span>Interactive Computer Networks Protocol Diagram</span>
          </h2>
        </div>
        <NetworkDiagram />
      </div>

    </div>
  );
}
