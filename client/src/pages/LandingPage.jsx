import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  Lock, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeftRight, 
  History,
  TrendingUp,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function LandingPage() {
  const navigate = useNavigate();

  const demoAccounts = [
    { name: 'Rahul Sharma', email: 'rahul@securebank.com', pass: 'Demo1234!', balance: 150000, acc: 'SB5012349876' },
    { name: 'Priya Sundaram', email: 'priya@securebank.com', pass: 'Demo1234!', balance: 275000, acc: 'SB7089123456' },
    { name: 'Administrator', email: 'admin@securebank.com', pass: 'Admin1234!', balance: 1000000, acc: 'SB9990001122' }
  ];

  const handleQuickLogin = (email, pass) => {
    navigate('/login', { state: { prefillEmail: email, prefillPass: pass } });
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-16 border-b border-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,180,216,0.12),rgba(255,255,255,0))]"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-glow">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Digital NetBanking Platform • Secure Online Banking (₹ INR)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Fast, Simple & Secure <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Online Banking
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Manage your account balance and send money instantly in Indian Rupees (₹). Powered by automated state machine validation for guaranteed transaction reliability.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 hover:from-cyan-400 hover:to-blue-500 shadow-glow transition-all flex items-center gap-2"
            >
              <span>Login to NetBanking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-navy-900 border border-cyan-500/40 text-cyan-300 hover:bg-navy-850 hover:border-cyan-400 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>Open Savings Account</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Instant 1-Click Demo Credentials Chip */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="fintech-card rounded-2xl p-6 border border-cyan-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Instant Demo Access (Click to Test)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Password: Demo1234!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleQuickLogin(acc.email, acc.pass)}
                className="p-3.5 rounded-xl bg-navy-950/80 hover:bg-navy-850 border border-navy-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {acc.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-extrabold">
                    {formatINR(acc.balance)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {acc.email}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  A/C: {acc.acc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Core Banking Services */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Digital Banking Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Everything you need for daily digital banking in Indian Rupees (₹)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="fintech-card rounded-2xl p-6 border border-navy-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instant Balance Enquiries</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Check your verified available account balance in real time directly from our secure core database with one click.
            </p>
          </div>

          <div className="fintech-card rounded-2xl p-6 border border-navy-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Seamless Fund Transfers</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Send money to any registered account number with recipient lookup, overdraft guard, and atomic balance debit/credit.
            </p>
          </div>

          <div className="fintech-card rounded-2xl p-6 border border-navy-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Complete Transaction History</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Review every transfer and deposit with status labels (Initiated, Approved, Rejected) and printable electronic receipts.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Security Highlights */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-300 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>DFA-Governed Transaction State Machine</span>
            </div>
            <p className="text-xs text-slate-400 font-sans max-w-lg">
              Every fund transfer is controlled on the backend: Initiated ➔ Approved (on valid commit) or Initiated ➔ Rejected (on overdraft/invalid recipient). Balances remain 100% safe.
            </p>
          </div>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs font-mono shadow-glow transition-all shrink-0"
          >
            Access Account →
          </Link>
        </div>
      </section>

    </div>
  );
}
