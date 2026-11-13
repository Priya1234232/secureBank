import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Info, 
  Layers, 
  BookOpen, 
  Zap,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';
import DfaVisualizer from '../components/DfaVisualizer';
import TransactionDfaVisualizer from '../components/TransactionDfaVisualizer';
import { DFA_DEFINITION, TRANSACTION_DFA_DEFINITION, runDFA } from '../services/dfaLogic';
import { dfaApi } from '../services/api';

export default function DfaSimulatorPage() {
  // Model Selector: 'transaction' (Problem Statement Focus) or 'credential'
  const [dfaModel, setDfaModel] = useState('transaction');

  // Credential DFA State
  const [inputString, setInputString] = useState('rahul@securebank.com');
  const [activeStep, setActiveStep] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [presets, setPresets] = useState([]);

  // Transaction DFA Simulation State
  const [txState, setTxState] = useState('INITIATED');
  const [txSimulating, setTxSimulating] = useState(false);

  // Compute live trace for Credential DFA
  const dfaResult = runDFA(inputString);

  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await dfaApi.getPresets();
        if (res.data.success) {
          setPresets(res.data.presets);
        }
      } catch (err) {
        setPresets([
          { label: 'Valid Standard Account', input: 'rahul@securebank.com', expected: true, note: 'Fully accepted format' },
          { label: 'Valid Minimal Account', input: 'priya10@sb.in', expected: true, note: 'Valid alphanumeric username and domain' },
          { label: 'Invalid: Missing "@"', input: 'rahuldomain.com', expected: false, note: 'Fails to reach separator state q2' },
          { label: 'Invalid: Duplicate "@"', input: 'user@@securebank.com', expected: false, note: 'Second @ transitions to trap state qR' },
          { label: 'Invalid: Starts with Disallowed', input: '@securebank.com', expected: false, note: 'Initial symbol from q0 is invalid; traps to qR' },
          { label: 'Invalid: Trapped Symbol', input: 'user$#@bank.com', expected: false, note: 'Disallowed characters trap immediately in qR' }
        ]);
      }
    }
    loadPresets();
  }, []);

  // Step-by-step auto player for credential DFA
  useEffect(() => {
    let timer;
    if (isPlaying) {
      if (activeStep === null) {
        setActiveStep(0);
      } else if (activeStep < dfaResult.path.length - 1) {
        timer = setTimeout(() => {
          setActiveStep(prev => prev + 1);
        }, 700);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, dfaResult.path.length]);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(null);
  };

  const handleStepForward = () => {
    if (activeStep === null) {
      setActiveStep(0);
    } else if (activeStep < dfaResult.path.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (activeStep !== null && activeStep > 0) {
      setActiveStep(prev => prev - 1);
    } else {
      setActiveStep(null);
    }
  };

  // Transaction DFA Simulation Runners
  const runTxValidSimulation = async () => {
    try {
      setTxSimulating(true);
      setTxState('INITIATED');
      await new Promise(r => setTimeout(r, 450));
      setTxState('VALIDATING');
      await new Promise(r => setTimeout(r, 600));
      setTxState('APPROVED');
      await new Promise(r => setTimeout(r, 600));
      setTxState('COMPLETED');
    } finally {
      setTxSimulating(false);
    }
  };

  const runTxRejectSimulation = async () => {
    try {
      setTxSimulating(true);
      setTxState('INITIATED');
      await new Promise(r => setTimeout(r, 450));
      setTxState('VALIDATING');
      await new Promise(r => setTimeout(r, 600));
      setTxState('REJECTED');
    } finally {
      setTxSimulating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Model Switcher */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-glow">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Formal Languages and Automata Theory (FLAT) Simulator</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Deterministic Finite Automaton (DFA) Engineering Core
        </h1>

        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Explore both formal DFA engines implemented within SecureBank: the primary <strong>Transaction State Modeling DFA</strong> (governing fund transfers and account settlement) and the <strong>Credential Syntax DFA</strong> (gatekeeping login input format).
        </p>

        {/* Primary Model Tab Selector */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setDfaModel('transaction')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              dfaModel === 'transaction'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 shadow-glow'
                : 'bg-navy-900 border border-navy-700 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>1. Transaction Modeling DFA (Hackathon Focus)</span>
          </button>

          <button
            onClick={() => setDfaModel('credential')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              dfaModel === 'credential'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 shadow-glow'
                : 'bg-navy-900 border border-navy-700 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Credential Identifier DFA</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: TRANSACTION MODELING DFA (PROBLEM STATEMENT FOCUS) */}
      {/* ========================================================= */}
      {dfaModel === 'transaction' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 5-Tuple Mathematical Formal Definition Box */}
          <div className="fintech-card rounded-2xl p-5 border border-cyan-500/30 font-mono text-xs space-y-3">
            <div className="text-sm font-bold text-cyan-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Formal Mathematical 5-Tuple:</span>
                <span className="text-white text-base font-extrabold bg-navy-950 px-3 py-1 rounded-lg border border-cyan-500/40">
                  M_trans = (Q, Σ, δ, q₀, F)
                </span>
              </div>
              <span className="text-emerald-400 text-[10px]">TRANSACTION STATE MACHINE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">Q (States):</span>
                <span className="text-slate-300 text-[11px]">&#123; INITIATED, VALIDATING, APPROVED, COMPLETED, REJECTED &#125;</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">Σ (Alphabet):</span>
                <span className="text-slate-300 text-[11px]">&#123; SUBMIT, CHECK_PASS, CHECK_FAIL, COMMIT_PASS, COMMIT_FAIL &#125;</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">δ (Transition):</span>
                <span className="text-slate-300 text-[11px]">δ: Q × Σ → Q (Total & Deterministic)</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">q₀ (Start):</span>
                <span className="text-slate-300 text-[11px]">INITIATED (q₀ ∈ Q)</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-emerald-400 font-bold block mb-1">F (Final / Accept):</span>
                <span className="text-emerald-300 font-bold text-[11px]">&#123; COMPLETED &#125; ⊆ Q</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Transaction State Machine Runner</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Test the two fundamental transaction paths required by the hackathon problem statement
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runTxValidSimulation}
                  disabled={txSimulating}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 shadow-glow transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Approved Transfer</span>
                </button>

                <button
                  onClick={runTxRejectSimulation}
                  disabled={txSimulating}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 shadow-glow transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Simulate Overdraft Rejection</span>
                </button>

                <button
                  onClick={() => setTxState('INITIATED')}
                  disabled={txSimulating}
                  className="p-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-300 hover:text-white transition-colors"
                  title="Reset Machine"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Path description */}
            <div className="p-3 rounded-xl bg-navy-950 text-xs font-mono text-slate-300 flex items-center justify-between">
              <div>
                Current State: <strong className="text-cyan-300 text-sm">{txState}</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                {txState === 'COMPLETED' ? 'Path: INITIATED ➔ VALIDATING ➔ APPROVED ➔ COMPLETED (Accepted)' :
                 txState === 'REJECTED' ? 'Path: INITIATED ➔ VALIDATING ➔ REJECTED (Aborted in Trap State)' :
                 'Ready for event dispatch'}
              </div>
            </div>
          </div>

          {/* Interactive State Machine Graph & Table */}
          <TransactionDfaVisualizer currentState={txState} />

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: CREDENTIAL IDENTIFIER DFA */}
      {/* ========================================================= */}
      {dfaModel === 'credential' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 5-Tuple Mathematical Formal Definition Box */}
          <div className="fintech-card rounded-2xl p-5 border border-cyan-500/30 font-mono text-xs space-y-3">
            <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <span>Formal Mathematical 5-Tuple:</span>
              <span className="text-white text-base font-extrabold bg-navy-950 px-3 py-1 rounded-lg border border-cyan-500/40">
                M_login = (Q, Σ, δ, q₀, F)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">Q (States):</span>
                <span className="text-slate-300">&#123; q₀, q₁, q₂, q₃, q₄, q_R &#125;</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">Σ (Alphabet):</span>
                <span className="text-slate-300">&#123; [a-zA-Z0-9], @, ., [-_] &#125;</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">δ (Transition):</span>
                <span className="text-slate-300">δ: Q × Σ → Q (Total & Deterministic)</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-cyan-400 font-bold block mb-1">q₀ (Start):</span>
                <span className="text-slate-300">q₀ ∈ Q</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-emerald-400 font-bold block mb-1">F (Final / Accept):</span>
                <span className="text-emerald-300 font-bold">&#123; q₄ &#125; ⊆ Q</span>
              </div>
            </div>
          </div>

          {/* Input Testing & Playback Panel */}
          <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Automaton Input String & Execution Controls</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Test custom strings or step through character-by-character transitions
                </p>
              </div>

              {/* Stepper & Playback Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleStepBackward}
                  disabled={activeStep === null || activeStep === 0}
                  className="p-2 rounded-lg bg-navy-950 border border-navy-800 hover:border-cyan-500/40 text-slate-300 disabled:opacity-40 transition-all"
                  title="Step Backward"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-glow transition-all"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
                  <span>{isPlaying ? 'Pause' : 'Trace Step-by-Step'}</span>
                </button>

                <button
                  onClick={handleStepForward}
                  disabled={activeStep !== null && activeStep >= dfaResult.path.length - 1}
                  className="p-2 rounded-lg bg-navy-950 border border-navy-800 hover:border-cyan-500/40 text-slate-300 disabled:opacity-40 transition-all"
                  title="Step Forward"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-navy-950 border border-navy-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition-all"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Input Field */}
            <div className="relative">
              <input
                type="text"
                value={inputString}
                onChange={(e) => {
                  setInputString(e.target.value);
                  setActiveStep(null);
                }}
                placeholder="Type any test identifier, e.g. user@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white font-mono font-bold outline-none transition-all"
              />
            </div>

            {/* Curated Benchmark Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                BENCHMARK TEST CASES:
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputString(p.input);
                      setActiveStep(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
                      inputString === p.input
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-glow font-bold'
                        : 'bg-navy-950 border-navy-800 text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded ${p.expected ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {p.expected ? 'Accept' : 'Reject'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive SVG Automaton Graph */}
          <DfaVisualizer
            dfaResult={dfaResult}
            activeStepIndex={activeStep}
            onSelectStep={(idx) => setActiveStep(idx)}
          />

          {/* Transition Table for Credential DFA */}
          <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Credential DFA Transition Table δ: Q × Σ → Q</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-navy-950 px-2 py-1 rounded border border-navy-800">
                DETERMINISTIC
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3 text-left">State q ∈ Q</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-cyan-300">[a-zA-Z0-9]</th>
                    <th className="py-2.5 px-3 text-yellow-300">"@" (at)</th>
                    <th className="py-2.5 px-3 text-emerald-300">"." (dot)</th>
                    <th className="py-2.5 px-3 text-purple-300">[-_] (symbol)</th>
                    <th className="py-2.5 px-3 text-rose-300">Other</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {DFA_DEFINITION.states.map((st) => {
                    const meta = DFA_DEFINITION.stateMetadata[st];
                    const transitions = DFA_DEFINITION.transitions[st] || {};
                    const isAccepting = DFA_DEFINITION.finalStates.includes(st);
                    const isCurrent = dfaResult.finalState === st;

                    return (
                      <tr
                        key={st}
                        className={`transition-colors ${
                          isCurrent ? 'bg-cyan-950/40 font-bold' : 'hover:bg-navy-850/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-left">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            isAccepting ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-navy-900 text-cyan-300'
                          }`}>
                            {meta.isInitial ? '→ ' : ''}{st}{isAccepting ? ' *' : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-left text-slate-400 text-[11px]">
                          {meta.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">{transitions.alphanumeric || 'qR'}</td>
                        <td className="py-2.5 px-3 text-slate-200">{transitions.at || 'qR'}</td>
                        <td className="py-2.5 px-3 text-slate-200">{transitions.dot || 'qR'}</td>
                        <td className="py-2.5 px-3 text-slate-200">{transitions.symbol || 'qR'}</td>
                        <td className="py-2.5 px-3 text-rose-400">{transitions.other || 'qR'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 4. Academic Security Distinction Note */}
      <div className="fintech-card rounded-2xl p-6 border border-cyan-500/30 space-y-3">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
          <Info className="w-5 h-5 text-cyan-400" />
          <span>Academic Security Distinction: DFA Validation vs Cryptographic Authentication</span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            In academic automata theory and cybersecurity, <strong>Deterministic Finite Automata model workflow states and validate language syntax</strong>. The Transaction DFA guarantees that money cannot be marked as <code>COMPLETED</code> without progressing through <code>INITIATED</code> $\to$ <code>VALIDATING</code> $\to$ <code>APPROVED</code>, and traps bad transfers into <code>REJECTED</code>.
          </p>
          <p>
            Meanwhile, <strong>cryptographic authentication is handled separately</strong>: once DFA conditions pass, bcrypt hashes with 10 salt rounds and signed JWT Bearer tokens prove user identity.
          </p>
        </div>
      </div>

    </div>
  );
}
