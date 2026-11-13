import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Network, Code, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Brand & Academic Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center text-white shadow-glow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                SecureBank
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Academic Fintech demonstration integrating Full Stack Web Development, Computer Networks, and Formal Languages and Automata Theory into a unified banking system.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 font-bold">
              Standard Currency: ₹ Indian Rupee (INR)
            </div>
          </div>

          {/* Column 2: 3-Subject Integration */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">
              Academic Disciplines
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Stack Web Development</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Network className="w-3.5 h-3.5 text-blue-400" />
                <span>Computer Networks (TCP/IP)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Formal Languages & Automata</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">
              Key Features
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/dfa-simulator" className="hover:text-cyan-300 transition-colors">
                  DFA Authenticator Simulator
                </Link>
              </li>
              <li>
                <Link to="/network-monitor" className="hover:text-cyan-300 transition-colors">
                  Live Network & Latency Monitor
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-300 transition-colors">
                  Savings Ledger & Transfers
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyan-300 transition-colors">
                  Bank Administration Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Disclaimer & Security Note */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
            <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
              <span>Demo Simulation Notice</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              This application is an educational prototype built for hackathon demonstration. Balances, account numbers, and transfers are purely fictional and execute safely in a sandbox environment.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 SecureBank • Secure Online Banking System Using DFA. All rights reserved.</p>
          <p className="font-mono text-cyan-400">
            Academic Project: Web Dev • Networks • FLAT
          </p>
        </div>

      </div>
    </footer>
  );
}
