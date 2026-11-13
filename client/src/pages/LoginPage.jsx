import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight,
  Key,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('rahul@securebank.com');
  const [password, setPassword] = useState('Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.prefillEmail) {
      setEmail(location.state.prefillEmail);
    }
    if (location.state?.prefillPass) {
      setPassword(location.state.prefillPass);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-glow mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Secure Member Login
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Login to your SecureBank NetBanking Account
          </p>
        </div>

        {/* Card */}
        <div className="fintech-card rounded-2xl p-6 sm:p-7 border border-navy-700/80 shadow-glow space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Identifier */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase font-mono">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address / NetBanking ID</span>
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                placeholder="e.g. rahul@securebank.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white font-mono outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white outline-none transition-all font-mono"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to SecureBank</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold uppercase">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quick Fill Demo Logins:</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDemoCredentials('rahul@securebank.com', 'Demo1234!')}
                className="p-2 rounded-lg bg-navy-950 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-cyan-300 text-left transition-colors"
              >
                <div className="font-bold text-white text-[11px]">Rahul Sharma</div>
                <div className="text-[10px] text-slate-400">rahul@securebank.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('priya@securebank.com', 'Demo1234!')}
                className="p-2 rounded-lg bg-navy-950 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-cyan-300 text-left transition-colors"
              >
                <div className="font-bold text-white text-[11px]">Priya Sundaram</div>
                <div className="text-[10px] text-slate-400">priya@securebank.com</div>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="pt-2 text-center text-xs text-slate-400 font-mono">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold underline ml-1">
              Open an Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
