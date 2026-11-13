import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR, maskAccountNumber } from '../utils/formatters';

export default function Sidebar() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Check Balance', to: '/balance-enquiry', icon: Wallet },
    { name: 'Transfer Money', to: '/transfer', icon: ArrowLeftRight },
    { name: 'Transaction History', to: '/transactions', icon: History }
  ];

  return (
    <aside className="w-full lg:w-64 bg-navy-900/90 border-r border-navy-800/90 p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Account Summary Card */}
        <div className="p-4 mb-6 rounded-2xl bg-gradient-to-br from-navy-850 to-navy-950 border border-cyan-500/30 shadow-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              PRIMARY SAVINGS ACCOUNT
            </span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tracking-tight">
            {formatINR(account?.balance || 0)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-800 text-[11px] text-slate-400 font-mono">
            <span>A/C No:</span>
            <span className="text-slate-200 font-bold">{maskAccountNumber(account?.accountNumber)}</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            ONLINE BANKING MENU
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Security & Logout Footer */}
      <div className="mt-8 space-y-3">
        <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Secure Banking Session</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
            Backend DFA Transaction Guard • 256-bit encryption active
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
