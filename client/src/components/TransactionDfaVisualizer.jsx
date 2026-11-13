import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, Cpu, Layers } from 'lucide-react';

export default function TransactionDfaVisualizer({ currentState = 'INITIATED', history = [] }) {
  const [showTable, setShowTable] = useState(false);

  // Normalize state
  const activeState = currentState === 'COMPLETED' ? 'APPROVED' : (currentState || 'INITIATED');
  const isApproved = activeState === 'APPROVED';
  const isRejected = activeState === 'REJECTED';

  return (
    <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              Transaction Modeling DFA: <span className="font-mono text-cyan-300">M_trans = (Q, Σ, δ, q₀, F)</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Governs transfer lifecycle: INITIATED ➔ APPROVED (or REJECTED trap state)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold shadow-glow">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>APPROVED (Final State q_app ∈ F)</span>
            </div>
          ) : isRejected ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-xs font-bold shadow-glow">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>REJECTED (Trap State q_rej ∈ F)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>STATE: {activeState}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-850 border border-navy-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showTable ? 'Hide Table' : 'Show Table δ'}</span>
          </button>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="w-full overflow-x-auto bg-navy-950/95 rounded-xl p-3 border border-navy-800 flex justify-center">
        <svg viewBox="0 0 650 240" className="w-full max-w-[650px] h-auto select-none">
          <defs>
            <marker id="tx-arrow-blue" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00B4D8" />
            </marker>
            <marker id="tx-arrow-green" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
            </marker>
            <marker id="tx-arrow-red" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EF4444" />
            </marker>
            <filter id="tx-glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00B4D8" floodOpacity="0.8" />
            </filter>
            <filter id="tx-glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10B981" floodOpacity="0.8" />
            </filter>
            <filter id="tx-glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Start incoming arrow */}
          <line x1="230" y1="55" x2="285" y2="55" stroke="#00B4D8" strokeWidth="2" markerEnd="url(#tx-arrow-blue)" />
          <text x="245" y="47" fill="#67E8F9" fontSize="10" fontFamily="monospace" fontWeight="bold">start</text>

          {/* Left Arrow: INITIATED -> APPROVED */}
          <path d="M 300 75 L 180 155" fill="none" stroke="#10B981" strokeWidth="2.2" markerEnd="url(#tx-arrow-green)" />
          <rect x="155" y="90" width="125" height="18" rx="3" fill="#030712" fillOpacity="0.85" stroke="#10B981" strokeWidth="0.8" />
          <text x="217" y="103" fill="#34D399" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            VALID_TRANSACTION
          </text>

          {/* Right Arrow: INITIATED -> REJECTED */}
          <path d="M 345 75 L 465 155" fill="none" stroke="#EF4444" strokeWidth="2.2" markerEnd="url(#tx-arrow-red)" />
          <rect x="365" y="90" width="150" height="26" rx="3" fill="#030712" fillOpacity="0.85" stroke="#EF4444" strokeWidth="0.8" />
          <text x="440" y="102" fill="#F87171" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            INVALID_RECEIVER /
          </text>
          <text x="440" y="113" fill="#F87171" fontSize="8.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            INSUFFICIENT_BALANCE
          </text>

          {/* NODE 1: INITIATED (q0) */}
          <g>
            <circle
              cx="325"
              cy="55"
              r="34"
              fill={activeState === 'INITIATED' ? '#003566' : '#0B192C'}
              stroke={activeState === 'INITIATED' ? '#00B4D8' : '#1E3A8A'}
              strokeWidth={activeState === 'INITIATED' ? 3.5 : 2}
              filter={activeState === 'INITIATED' ? 'url(#tx-glow-blue)' : undefined}
              className="transition-all duration-300"
            />
            <text x="325" y="52" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="extrabold">
              INITIATED
            </text>
            <text x="325" y="65" fill="#93C5FD" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
              q₀ (Start)
            </text>
          </g>

          {/* NODE 2: APPROVED (q_app) */}
          <g>
            <circle
              cx="150"
              cy="175"
              r="40"
              fill="none"
              stroke={activeState === 'APPROVED' ? '#10B981' : '#065F46'}
              strokeWidth={activeState === 'APPROVED' ? 3 : 1.5}
            />
            <circle
              cx="150"
              cy="175"
              r="34"
              fill={activeState === 'APPROVED' ? '#064E3B' : '#022C22'}
              stroke={activeState === 'APPROVED' ? '#34D399' : '#059669'}
              strokeWidth={activeState === 'APPROVED' ? 3 : 2}
              filter={activeState === 'APPROVED' ? 'url(#tx-glow-green)' : undefined}
              className="transition-all duration-300"
            />
            <text x="150" y="172" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="extrabold">
              APPROVED
            </text>
            <text x="150" y="185" fill="#6EE7B7" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
              q_app ∈ F
            </text>
          </g>

          {/* NODE 3: REJECTED (q_rej) */}
          <g>
            <circle
              cx="495"
              cy="175"
              r="40"
              fill="none"
              stroke={activeState === 'REJECTED' ? '#EF4444' : '#7F1D1D'}
              strokeWidth={activeState === 'REJECTED' ? 3 : 1.5}
            />
            <circle
              cx="495"
              cy="175"
              r="34"
              fill={activeState === 'REJECTED' ? '#7F1D1D' : '#450A0A'}
              stroke={activeState === 'REJECTED' ? '#F87171' : '#DC2626'}
              strokeWidth={activeState === 'REJECTED' ? 3 : 2}
              filter={activeState === 'REJECTED' ? 'url(#tx-glow-red)' : undefined}
              className="transition-all duration-300"
            />
            <text x="495" y="172" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="extrabold">
              REJECTED
            </text>
            <text x="495" y="185" fill="#FCA5A5" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
              q_rej ∈ F
            </text>
          </g>

        </svg>
      </div>

      {/* Transition Table δ */}
      {showTable && (
        <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
            Transition Matrix δ: Q × Σ → Q
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-1 px-2">State</th>
                  <th className="py-1 px-2 text-emerald-400">VALID_TRANSACTION</th>
                  <th className="py-1 px-2 text-rose-400">INVALID_RECEIVER</th>
                  <th className="py-1 px-2 text-rose-400">INSUFFICIENT_BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                <tr>
                  <td className="py-1.5 px-2 font-bold text-cyan-300">INITIATED (q₀)</td>
                  <td className="py-1.5 px-2 text-emerald-400 font-bold">APPROVED</td>
                  <td className="py-1.5 px-2 text-rose-400 font-bold">REJECTED</td>
                  <td className="py-1.5 px-2 text-rose-400 font-bold">REJECTED</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-bold text-emerald-400">APPROVED (q_app)</td>
                  <td className="py-1.5 px-2 text-slate-400">APPROVED</td>
                  <td className="py-1.5 px-2 text-slate-400">APPROVED</td>
                  <td className="py-1.5 px-2 text-slate-400">APPROVED</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 font-bold text-rose-400">REJECTED (q_rej)</td>
                  <td className="py-1.5 px-2 text-slate-400">REJECTED</td>
                  <td className="py-1.5 px-2 text-slate-400">REJECTED</td>
                  <td className="py-1.5 px-2 text-slate-400">REJECTED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
