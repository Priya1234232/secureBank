import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  History, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X,
  Lock,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatINR } from '../utils/formatters';

export default function Navbar() {
  const { user, account, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Check Balance', path: '/balance-enquiry', icon: Wallet },
    { name: 'Transfer Money', path: '/transfer', icon: ArrowLeftRight },
    { name: 'Transaction History', path: '/transactions', icon: History }
  ] : [
    { name: 'Home', path: '/', icon: Building2 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Bank Logo & Brand */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Secure<span className="text-cyan-400">Bank</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  DIGITAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Online Banking Services (₹ INR)
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-navy-900 border border-navy-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Authenticated User Status or Login Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/balance-enquiry"
                  className="hidden sm:flex flex-col text-right px-3 py-1 rounded-xl bg-navy-900 border border-navy-700/80 hover:border-cyan-500/40 transition-all"
                  title="Click for Balance Enquiry"
                >
                  <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[120px] flex items-center justify-end gap-1">
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>{user?.name}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {formatINR(account?.balance || 0)}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-900/60 hover:bg-rose-900/50 hover:text-white transition-colors"
                  title="Logout Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-cyan-300 hover:bg-navy-850 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 hover:from-cyan-400 hover:to-blue-500 shadow-glow transition-all"
                >
                  Open Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-navy-900 border border-navy-800 text-slate-300"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900/95 border-b border-navy-800 px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-navy-800"
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          {isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Session</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
