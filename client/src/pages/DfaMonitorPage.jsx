import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Server
} from 'lucide-react';
import { transactionApi, dfaApi } from '../services/api';
import { formatINR, formatDate, maskAccountNumber } from '../utils/formatters';

export default function DfaMonitorPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTransitionTable, setShowTransitionTable] = useState(false);

  // Interactive DFA Sandbox Simulator state
  const [simState, setSimState] = useState('INITIATED');
  const [simHistory, setSimHistory] = useState([
    { step: 1, state: 'INITIATED', symbol: 'start', timestamp: new Date().toLocaleTimeString(), note: 'Automaton initialized in start state q0' }
  ]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getHistory();
      if (res.data.success) {
        const txList = res.data.transactions || [];
        setTransactions(txList);
        if (txList.length > 0 && !selectedTx) {
          fetchTxStatus(txList[0].transactionId);
        }
      }
    } catch (err) {
      console.warn('Failed to load transactions for monitor:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTxStatus = async (txId) => {
    if (!txId) return;
    try {
      setLookupLoading(true);
      setError('');
      const res = await transactionApi.getStatus(txId);
      if (res.data.success) {
        setSelectedTx(res.data);
        setSelectedTxId(res.data.transactionId);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Transaction lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  // Metrics computation
  const approvedCount = transactions.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED').length;
  const rejectedCount = transactions.filter(t => t.status === 'REJECTED').length;
  const totalCount = transactions.length;

  // Active state to visualize (prioritizes inspected transaction, then sandbox)
  const activeState = selectedTx ? selectedTx.status : simState;

  // Sandbox symbol triggers
  const handleSimSymbol = (symbol) => {
    let nextState = simState;
    let note = '';

    if (simState === 'INITIATED') {
      if (symbol === 'VALID_TRANSACTION') {
        nextState = 'APPROVED';
        note = 'Input VALID_TRANSACTION: balance verified & atomic commit confirmed.';
      } else if (symbol === 'INVALID_RECEIVER') {
        nextState = 'REJECTED';
        note = 'Input INVALID_RECEIVER: recipient account not found in registry.';
      } else if (symbol === 'INSUFFICIENT_BALANCE') {
        nextState = 'REJECTED';
        note = 'Input INSUFFICIENT_BALANCE: overdraft check trapped.';
      } else if (symbol === 'DATABASE_FAILURE') {
        nextState = 'REJECTED';
        note = 'Input DATABASE_FAILURE: atomic rollback initiated, balances unchanged.';
      }
    } else {
      note = `Automaton already halted in terminal absorbing state ${simState}. Reset to dispatch new inputs.`;
    }

    setSimState(nextState);
    setSimHistory(prev => [
      ...prev,
      {
        step: prev.length + 1,
        state: nextState,
        symbol,
        timestamp: new Date().toLocaleTimeString(),
        note
      }
    ]);
  };

  const handleSimReset = () => {
    setSimState('INITIATED');
    setSimHistory([
      { step: 1, state: 'INITIATED', symbol: 'reset', timestamp: new Date().toLocaleTimeString(), note: 'Automaton reset to initial state q0' }
    ]);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-glow mb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>FLAT Automata Core • M_trans = (Q, Σ, δ, q₀, F)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transaction DFA Monitor & State Visualizer
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Deterministic Finite Automaton governing monetary settlement states: INITIATED ➔ APPROVED or REJECTED
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger Data</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="fintech-card rounded-2xl p-4 border border-navy-700/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TOTAL TRANSACTIONS</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Ledger records logged</span>
        </div>

        <div className="fintech-card rounded-2xl p-4 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">APPROVED (q_app)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {approvedCount}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Committed atomically</span>
        </div>

        <div className="fintech-card rounded-2xl p-4 border border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">REJECTED (q_rej)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
            {rejectedCount}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Trapped / balances safe</span>
        </div>

        <div className="fintech-card rounded-2xl p-4 border border-cyan-500/30">
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">CURRENT STATE</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full animate-ping ${
              activeState === 'APPROVED' ? 'bg-emerald-400' :
              activeState === 'REJECTED' ? 'bg-rose-400' : 'bg-cyan-400'
            }`} />
            <span className="text-xl font-extrabold font-mono text-white">
              {activeState}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeState === 'INITIATED' ? 'q0 (Start State)' : activeState === 'APPROVED' ? 'q_app ∈ F (Accept)' : 'q_rej ∈ F (Trap)'}
          </span>
        </div>
      </div>

      {/* 3. Formal DFA State Diagram Component */}
      <div className="fintech-card rounded-3xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-800">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Formal DFA State Diagram</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-navy-950 text-cyan-300 border border-cyan-800">
                δ: Q × Σ → Q
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Q = &#123;INITIATED, APPROVED, REJECTED&#125; • F = &#123;APPROVED, REJECTED&#125;
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransitionTable(!showTransitionTable)}
              className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showTransitionTable ? 'Hide Transition Table' : 'Show Transition Table δ'}</span>
            </button>
          </div>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="w-full overflow-x-auto bg-navy-950/95 rounded-2xl p-4 border border-navy-800 flex justify-center">
          <svg viewBox="0 0 700 300" className="w-full max-w-[700px] h-auto select-none">
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00B4D8" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EF4444" />
              </marker>
              <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00B4D8" floodOpacity="0.8" />
              </filter>
              <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10B981" floodOpacity="0.8" />
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Start incoming arrow */}
            <line x1="260" y1="70" x2="315" y2="70" stroke="#00B4D8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
            <text x="275" y="60" fill="#67E8F9" fontSize="11" fontFamily="monospace" fontWeight="bold">start</text>

            {/* Transition 1: INITIATED -> APPROVED */}
            <path d="M 330 95 L 205 185" fill="none" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
            <rect x="175" y="115" width="135" height="20" rx="4" fill="#030712" fillOpacity="0.85" stroke="#10B981" strokeWidth="0.8" />
            <text x="242" y="129" fill="#34D399" fontSize="9.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              + VALID_TRANSACTION
            </text>

            {/* Transition 2: INITIATED -> REJECTED */}
            <path d="M 370 95 L 495 185" fill="none" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
            <rect x="390" y="115" width="170" height="32" rx="4" fill="#030712" fillOpacity="0.85" stroke="#EF4444" strokeWidth="0.8" />
            <text x="475" y="127" fill="#F87171" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              + INVALID_RECEIVER /
            </text>
            <text x="475" y="140" fill="#F87171" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              INSUFFICIENT_BALANCE / FAIL
            </text>

            {/* Terminal Self-Loop on APPROVED */}
            <path d="M 155 240 C 130 275, 210 275, 185 240" fill="none" stroke="#10B981" strokeWidth="1.8" markerEnd="url(#arrow-green)" strokeDasharray="3,3" />
            <text x="170" y="285" fill="#6EE7B7" fontSize="9" textAnchor="middle" fontFamily="monospace">Σ (terminal)</text>

            {/* Terminal Self-Loop on REJECTED */}
            <path d="M 505 240 C 480 275, 560 275, 535 240" fill="none" stroke="#EF4444" strokeWidth="1.8" markerEnd="url(#arrow-red)" strokeDasharray="3,3" />
            <text x="520" y="285" fill="#FCA5A5" fontSize="9" textAnchor="middle" fontFamily="monospace">Σ (terminal)</text>

            {/* NODE 1: INITIATED (q0) */}
            <g>
              <circle
                cx="350"
                cy="70"
                r="38"
                fill={activeState === 'INITIATED' ? '#003566' : '#0B192C'}
                stroke={activeState === 'INITIATED' ? '#00B4D8' : '#1E3A8A'}
                strokeWidth={activeState === 'INITIATED' ? 3.5 : 2}
                filter={activeState === 'INITIATED' ? 'url(#glow-blue)' : undefined}
                className="transition-all duration-300"
              />
              <text x="350" y="65" fill="#FFFFFF" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="extrabold">
                INITIATED
              </text>
              <text x="350" y="80" fill="#93C5FD" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                q₀ (Start)
              </text>
            </g>

            {/* NODE 2: APPROVED (q_app ∈ F) - Double circle for accepting state */}
            <g>
              <circle
                cx="170"
                cy="210"
                r="44"
                fill="none"
                stroke={activeState === 'APPROVED' ? '#10B981' : '#065F46'}
                strokeWidth={activeState === 'APPROVED' ? 3 : 1.5}
              />
              <circle
                cx="170"
                cy="210"
                r="38"
                fill={activeState === 'APPROVED' ? '#064E3B' : '#022C22'}
                stroke={activeState === 'APPROVED' ? '#34D399' : '#059669'}
                strokeWidth={activeState === 'APPROVED' ? 3 : 2}
                filter={activeState === 'APPROVED' ? 'url(#glow-green)' : undefined}
                className="transition-all duration-300"
              />
              <text x="170" y="205" fill="#FFFFFF" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="extrabold">
                APPROVED
              </text>
              <text x="170" y="220" fill="#6EE7B7" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                q_app ∈ F
              </text>
            </g>

            {/* NODE 3: REJECTED (q_rej ∈ F) - Terminal trap / final state */}
            <g>
              <circle
                cx="530"
                cy="210"
                r="44"
                fill="none"
                stroke={activeState === 'REJECTED' ? '#EF4444' : '#7F1D1D'}
                strokeWidth={activeState === 'REJECTED' ? 3 : 1.5}
              />
              <circle
                cx="530"
                cy="210"
                r="38"
                fill={activeState === 'REJECTED' ? '#7F1D1D' : '#450A0A'}
                stroke={activeState === 'REJECTED' ? '#F87171' : '#DC2626'}
                strokeWidth={activeState === 'REJECTED' ? 3 : 2}
                filter={activeState === 'REJECTED' ? 'url(#glow-red)' : undefined}
                className="transition-all duration-300"
              />
              <text x="530" y="205" fill="#FFFFFF" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="extrabold">
                REJECTED
              </text>
              <text x="530" y="220" fill="#FCA5A5" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                q_rej ∈ F
              </text>
            </g>

          </svg>
        </div>

        {/* Collapsible Formal Transition Table δ */}
        {showTransitionTable && (
          <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Transition Function δ: Q × Σ → Q
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2 px-3">Current State (q ∈ Q)</th>
                    <th className="py-2 px-3 text-emerald-400">VALID_TRANSACTION</th>
                    <th className="py-2 px-3 text-rose-400">INVALID_RECEIVER</th>
                    <th className="py-2 px-3 text-rose-400">INSUFFICIENT_BALANCE</th>
                    <th className="py-2 px-3 text-rose-400">DATABASE_FAILURE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  <tr className="hover:bg-navy-900/50">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">➔ INITIATED (q₀)</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">APPROVED</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">REJECTED</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">REJECTED</td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">REJECTED</td>
                  </tr>
                  <tr className="hover:bg-navy-900/50">
                    <td className="py-2.5 px-3 font-bold text-emerald-400">* APPROVED (q_app)</td>
                    <td className="py-2.5 px-3 text-slate-400">APPROVED</td>
                    <td className="py-2.5 px-3 text-slate-400">APPROVED</td>
                    <td className="py-2.5 px-3 text-slate-400">APPROVED</td>
                    <td className="py-2.5 px-3 text-slate-400">APPROVED</td>
                  </tr>
                  <tr className="hover:bg-navy-900/50">
                    <td className="py-2.5 px-3 font-bold text-rose-400">* REJECTED (q_rej)</td>
                    <td className="py-2.5 px-3 text-slate-400">REJECTED</td>
                    <td className="py-2.5 px-3 text-slate-400">REJECTED</td>
                    <td className="py-2.5 px-3 text-slate-400">REJECTED</td>
                    <td className="py-2.5 px-3 text-slate-400">REJECTED</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              * denotes final states (F = &#123;APPROVED, REJECTED&#125;). Both are terminal absorbing states.
            </p>
          </div>
        )}
      </div>

      {/* 4. Active Transaction Inspector */}
      <div className="fintech-card rounded-2xl p-6 border border-navy-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Inspect Transaction State in MongoDB</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Select or enter a Transaction ID to retrieve live backend DFA state and transition history
            </p>
          </div>

          {/* Selector / Search */}
          <div className="flex items-center gap-2">
            <select
              value={selectedTxId}
              onChange={(e) => {
                setSelectedTxId(e.target.value);
                fetchTxStatus(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="">Select Recent Transaction...</option>
              {transactions.map(t => (
                <option key={t.transactionId} value={t.transactionId}>
                  {t.transactionId} - {t.status} ({formatINR(t.amount)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {lookupLoading ? (
          <div className="py-8 text-center text-xs font-mono text-cyan-400 animate-pulse">
            Fetching transaction state from MongoDB...
          </div>
        ) : selectedTx ? (
          <div className="space-y-4">
            {/* Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-850">
                <span className="text-slate-400 text-[10px] block">TRANSACTION ID</span>
                <span className="font-extrabold text-cyan-300">{selectedTx.transactionId}</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-850">
                <span className="text-slate-400 text-[10px] block">AMOUNT (₹ INR)</span>
                <span className="font-extrabold text-white">{formatINR(selectedTx.amount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-850">
                <span className="text-slate-400 text-[10px] block">CURRENT DFA STATE</span>
                <span className={`font-extrabold ${
                  selectedTx.status === 'APPROVED' ? 'text-emerald-400' :
                  selectedTx.status === 'REJECTED' ? 'text-rose-400' : 'text-cyan-300'
                }`}>
                  {selectedTx.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-850">
                <span className="text-slate-400 text-[10px] block">TIMESTAMP</span>
                <span className="font-extrabold text-slate-300">{formatDate(selectedTx.createdAt)}</span>
              </div>
            </div>

            {/* Validation Result Box */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-mono ${
              selectedTx.status === 'APPROVED' 
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' 
                : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
            }`}>
              {selectedTx.status === 'APPROVED' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>
                <p className="font-bold uppercase tracking-wider text-[11px]">
                  TRANSACTION VALIDATION RESULT
                </p>
                <p className="mt-1 leading-relaxed">
                  {selectedTx.validationResult}
                </p>
              </div>
            </div>

            {/* State Transition History Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                State Transition History (Audit Trail)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-navy-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-navy-950 border-b border-navy-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Step</th>
                      <th className="py-2.5 px-3">Automaton State</th>
                      <th className="py-2.5 px-3">Transition Reason</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60 bg-navy-900/60">
                    {(selectedTx.fsmHistory || []).map((step, idx) => (
                      <tr key={idx} className="hover:bg-navy-850/60">
                        <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            step.state === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            step.state === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}>
                            {step.state}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{step.reason}</td>
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{formatDate(step.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            No transaction selected. Perform a transfer or select from the dropdown above.
          </div>
        )}
      </div>

      {/* 5. Interactive DFA Simulation Testbed */}
      <div className="fintech-card rounded-2xl p-6 border border-navy-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Interactive DFA Transition Testbed</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Inject input symbols from Alphabet Σ to manually test deterministic state transitions
            </p>
          </div>

          <button
            onClick={handleSimReset}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Automaton</span>
          </button>
        </div>

        {/* Input Symbol Triggers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <button
            onClick={() => handleSimSymbol('VALID_TRANSACTION')}
            disabled={simState !== 'INITIATED'}
            className="p-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center text-center gap-1"
          >
            <span>VALID_TRANSACTION</span>
            <span className="text-[10px] font-normal text-emerald-400">➔ APPROVED</span>
          </button>

          <button
            onClick={() => handleSimSymbol('INVALID_RECEIVER')}
            disabled={simState !== 'INITIATED'}
            className="p-3 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center text-center gap-1"
          >
            <span>INVALID_RECEIVER</span>
            <span className="text-[10px] font-normal text-rose-400">➔ REJECTED</span>
          </button>

          <button
            onClick={() => handleSimSymbol('INSUFFICIENT_BALANCE')}
            disabled={simState !== 'INITIATED'}
            className="p-3 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center text-center gap-1"
          >
            <span>INSUFFICIENT_BALANCE</span>
            <span className="text-[10px] font-normal text-rose-400">➔ REJECTED</span>
          </button>

          <button
            onClick={() => handleSimSymbol('DATABASE_FAILURE')}
            disabled={simState !== 'INITIATED'}
            className="p-3 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center text-center gap-1"
          >
            <span>DATABASE_FAILURE</span>
            <span className="text-[10px] font-normal text-rose-400">➔ REJECTED</span>
          </button>
        </div>

        {/* Live Simulation Step Trace */}
        <div className="p-3 rounded-xl bg-navy-950 border border-navy-850 space-y-2 text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">
            Testbed Execution Log:
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {simHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300 text-[11px] border-b border-navy-900 pb-1">
                <span>
                  Step #{h.step}: <strong className="text-cyan-300">[{h.symbol}]</strong> ➔ State: <strong className={
                    h.state === 'APPROVED' ? 'text-emerald-400' :
                    h.state === 'REJECTED' ? 'text-rose-400' : 'text-blue-400'
                  }>{h.state}</strong>
                </span>
                <span className="text-slate-500">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
