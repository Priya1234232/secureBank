import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { DFA_DEFINITION } from '../services/dfaLogic';

export default function DfaVisualizer({ dfaResult, activeStepIndex = null, onSelectStep = null }) {
  const result = dfaResult || {
    input: '',
    accepted: false,
    finalState: 'q0',
    statesVisited: ['q0'],
    path: [],
    stateInfo: DFA_DEFINITION.stateMetadata['q0'],
    evaluation: 'Ready for input'
  };

  // Determine which state to highlight (either user-selected step or final state)
  const currentStep = (activeStepIndex !== null && result.path[activeStepIndex]) 
    ? result.path[activeStepIndex] 
    : (result.path.length > 0 ? result.path[result.path.length - 1] : null);

  const activeStateId = currentStep ? currentStep.toState : (result.statesVisited[0] || 'q0');

  // SVG Coordinates for states
  const states = [
    { id: 'q0', label: 'q0', sub: 'Start', cx: 90, cy: 110, isInitial: true, isFinal: false },
    { id: 'q1', label: 'q1', sub: 'Ident', cx: 240, cy: 110, isInitial: false, isFinal: false },
    { id: 'q2', label: 'q2', sub: '@-Sep', cx: 390, cy: 110, isInitial: false, isFinal: false },
    { id: 'q3', label: 'q3', sub: 'Domain', cx: 540, cy: 110, isInitial: false, isFinal: false },
    { id: 'q4', label: 'q4', sub: 'Accept', cx: 690, cy: 110, isInitial: false, isFinal: true },
    { id: 'qR', label: 'qR', sub: 'Trap/Reject', cx: 390, cy: 230, isInitial: false, isFinal: false, isDead: true }
  ];

  return (
    <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
      {/* Header with Formal Model Tuple */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              FLAT Automaton Transition Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Formal Model: <span className="text-cyan-300 font-bold">M = (Q, Σ, δ, q₀, F)</span>
          </p>
        </div>

        {/* Acceptance / Rejection Status Badge */}
        <div className="flex items-center gap-2">
          {result.accepted ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold shadow-glow">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ACCEPTED (q₄ ∈ F)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-xs font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>REJECTED ({result.finalState} ∉ F)</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive SVG Diagram */}
      <div className="w-full overflow-x-auto bg-navy-950/90 rounded-xl p-3 border border-navy-800">
        <svg viewBox="0 0 780 270" className="w-full min-w-[700px] h-auto select-none">
          <defs>
            {/* Arrowhead marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00B4D8" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F43F5E" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
            </marker>

            {/* Glowing filter */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Start Arrow pointing to q0 */}
          <line x1="20" y1="110" x2="60" y2="110" stroke="#00B4D8" strokeWidth="2.5" markerEnd="url(#arrow)" />
          <text x="35" y="100" fill="#67E8F9" fontSize="10" fontFamily="monospace" fontWeight="bold">start</text>

          {/* State Transitions (Horizontal Forward Transitions) */}
          {/* q0 -> q1 on [a-zA-Z0-9] */}
          <line x1="90" y1="110" x2="240" y2="110" stroke="#00B4D8" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="165" y="98" fill="#A5F3FC" fontSize="10" textAnchor="middle" fontFamily="monospace">[a-z,0-9]</text>

          {/* q1 self-loop on [a-zA-Z0-9, -_] */}
          <path d="M 230 83 C 210 40, 270 40, 250 83" fill="none" stroke="#00B4D8" strokeWidth="1.8" markerEnd="url(#arrow)" />
          <text x="240" y="42" fill="#A5F3FC" fontSize="9" textAnchor="middle" fontFamily="monospace">[a-z, 0-9, -]</text>

          {/* q1 -> q2 on @ */}
          <line x1="240" y1="110" x2="390" y2="110" stroke="#00B4D8" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="315" y="98" fill="#FDE047" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">"@"</text>

          {/* q2 -> q3 on [a-zA-Z0-9] */}
          <line x1="390" y1="110" x2="540" y2="110" stroke="#00B4D8" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="465" y="98" fill="#A5F3FC" fontSize="10" textAnchor="middle" fontFamily="monospace">[a-z,0-9]</text>

          {/* q3 self loop on [a-z0-9] */}
          <path d="M 530 83 C 510 40, 570 40, 550 83" fill="none" stroke="#00B4D8" strokeWidth="1.8" markerEnd="url(#arrow)" />
          <text x="540" y="42" fill="#A5F3FC" fontSize="9" textAnchor="middle" fontFamily="monospace">[a-z,0-9]</text>

          {/* q3 -> q4 on "." */}
          <line x1="540" y1="110" x2="690" y2="110" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
          <text x="615" y="98" fill="#86EFAC" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">"."</text>

          {/* q4 self loop on [a-z] */}
          <path d="M 680 83 C 660 40, 720 40, 700 83" fill="none" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />
          <text x="690" y="42" fill="#86EFAC" fontSize="9" textAnchor="middle" fontFamily="monospace">[a-z]</text>

          {/* Rejection transitions into qR */}
          {/* q0 -> qR */}
          <path d="M 105 130 Q 200 230 360 230" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-red)" />
          
          {/* q1 -> qR */}
          <line x1="255" y1="135" x2="365" y2="215" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-red)" />

          {/* q2 -> qR */}
          <line x1="390" y1="140" x2="390" y2="200" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-red)" />

          {/* q3 -> qR */}
          <line x1="525" y1="135" x2="415" y2="215" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-red)" />

          {/* qR self loop on any */}
          <path d="M 380 255 C 360 295, 420 295, 400 255" fill="none" stroke="#F43F5E" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
          <text x="390" y="268" fill="#FDA4AF" fontSize="9" textAnchor="middle" fontFamily="monospace">any / trap</text>

          {/* State Nodes */}
          {states.map((st) => {
            const isActive = st.id === activeStateId;
            const isDead = st.isDead;
            const isAccepting = st.isFinal;

            return (
              <g key={st.id} className="cursor-pointer transition-transform duration-300">
                {/* Active Pulsing Glow Outer Ring */}
                {isActive && (
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r={36}
                    fill="none"
                    stroke={isDead ? '#F43F5E' : (isAccepting ? '#10B981' : '#00F0FF')}
                    strokeWidth="3"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Accepting state outer double ring */}
                {isAccepting && (
                  <circle
                    cx={st.cx}
                    cy={st.cy}
                    r={33}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                  />
                )}

                {/* State main circle */}
                <circle
                  cx={st.cx}
                  cy={st.cy}
                  r={28}
                  fill={isActive ? (isDead ? '#4C0519' : (isAccepting ? '#064E3B' : '#083344')) : '#0F172A'}
                  stroke={
                    isActive
                      ? (isDead ? '#F43F5E' : (isAccepting ? '#34D399' : '#22D3EE'))
                      : (isDead ? '#881337' : '#1E293B')
                  }
                  strokeWidth={isActive ? 3 : 1.8}
                />

                {/* State Label */}
                <text
                  x={st.cx}
                  y={st.cy - 3}
                  textAnchor="middle"
                  fill={isActive ? '#FFFFFF' : '#94A3B8'}
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {st.label}
                </text>

                {/* State Sub-label */}
                <text
                  x={st.cx}
                  y={st.cy + 12}
                  textAnchor="middle"
                  fill={isActive ? '#67E8F9' : '#64748B'}
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {st.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Input Tape / String Reader */}
      <div className="bg-navy-900/80 rounded-xl p-3 border border-navy-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>AUTOMATON INPUT TAPE (Σ*):</span>
          <span>CURRENT STATE: <strong className="text-cyan-300 font-bold">{activeStateId}</strong></span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {result.input ? (
            result.input.split('').map((ch, idx) => {
              const isCurrentChar = currentStep && currentStep.index === idx;
              const hasBeenRead = currentStep ? idx <= currentStep.index : true;

              return (
                <div
                  key={idx}
                  onClick={() => onSelectStep && onSelectStep(idx)}
                  className={`flex flex-col items-center justify-center min-w-[28px] h-9 px-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    isCurrentChar
                      ? 'bg-cyan-500 text-navy-950 ring-2 ring-cyan-300 shadow-glow scale-105'
                      : hasBeenRead
                      ? 'bg-navy-800 text-cyan-200 border border-cyan-800/60'
                      : 'bg-navy-950 text-slate-500 border border-navy-800'
                  }`}
                  title={`Step ${idx + 1}: Symbol '${ch}'`}
                >
                  <span>{ch}</span>
                  <span className="text-[8px] opacity-75">{idx}</span>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-500 font-mono py-1">
              [Empty input tape λ / ε - Engine at initial state q₀]
            </div>
          )}
        </div>
      </div>

      {/* Current State Diagnostic & Evaluation Explanation */}
      <div className="p-3 rounded-lg bg-navy-950/90 border border-navy-800/80 flex items-start gap-3 text-xs">
        {result.accepted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-200">
            {DFA_DEFINITION.stateMetadata[activeStateId]?.name || activeStateId} ({activeStateId})
          </div>
          <p className="text-slate-400">
            {DFA_DEFINITION.stateMetadata[activeStateId]?.desc}
          </p>
          <p className="text-cyan-300 font-mono text-[11px] pt-1">
            {result.evaluation}
          </p>
        </div>
      </div>
    </div>
  );
}
