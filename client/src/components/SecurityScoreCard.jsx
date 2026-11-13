import React from 'react';
import { ShieldCheck, Lock, Cpu, Network, Check, Award } from 'lucide-react';

export default function SecurityScoreCard() {
  const pillars = [
    {
      title: 'FLAT DFA Input Barrier',
      subject: 'FLAT',
      score: '98%',
      desc: 'Deterministic finite-state automaton verifies credential syntax before cryptographic hashing.',
      icon: Cpu,
      color: 'text-cyan-400'
    },
    {
      title: 'bcrypt Password Salting',
      subject: 'Full Stack Web',
      score: '99%',
      desc: 'Adaptive one-way hashing with 10 salt rounds protects user passwords against brute force.',
      icon: Lock,
      color: 'text-blue-400'
    },
    {
      title: 'JWT Bearer Authentication',
      subject: 'Full Stack Web',
      score: '96%',
      desc: 'Signed HMAC-SHA256 session tokens with automatic expiration and role validation.',
      icon: ShieldCheck,
      color: 'text-indigo-400'
    },
    {
      title: 'Network Transport & TLS 1.3',
      subject: 'Computer Networks',
      score: '97%',
      desc: 'Encrypted client-server communications over TCP/IP with strict CORS and latency monitoring.',
      icon: Network,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
      <div className="flex items-center justify-between border-b border-navy-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Banking Security Rating</h3>
            <p className="text-[11px] text-slate-400">Triple-Discipline Cybersecurity Assessment</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 bg-navy-950 px-3 py-1 rounded-xl border border-cyan-500/30">
          <span className="text-xl font-extrabold text-cyan-400 font-mono">98</span>
          <span className="text-xs text-slate-400 font-mono">/100 (A+)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="font-semibold text-xs text-white">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-navy-900 text-cyan-300 border border-navy-700">
                  {item.score}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
