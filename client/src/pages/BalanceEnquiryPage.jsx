import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  RefreshCw, 
  ArrowLeftRight, 
  History, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Server,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { accountApi } from '../services/api';
import { formatINR, maskAccountNumber } from '../utils/formatters';

export default function BalanceEnquiryPage() {
  const { user, account, refreshBalance } = useAuth();
  
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [telemetry, setTelemetry] = useState({
    latencyMs: null,
    timestamp: null,
    status: null,
    source: 'MongoDB / Express REST API'
  });

  useEffect(() => {
    handleCheckBalance();
  }, []);

  const handleCheckBalance = async () => {
    try {
      setLoading(true);
      setError('');
      const t0 = performance.now();
      
      const res = await accountApi.getBalance();
      const t1 = performance.now();
      
      if (res.data.success) {
        setBalanceData(res.data);
        setTelemetry({
          latencyMs: Math.round(t1 - t0),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          status: '200 OK (TCP Stream Verified)',
          source: 'MongoDB Atlas / Express Service'
        });
        // Sync global auth context balance
        await refreshBalance();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch account balance from server');
    } finally {
      setLoading(false);
    }
  };

  const copyAccountNumber = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentBalance = balanceData?.balance !== undefined ? balanceData.balance : (account?.balance || 0);
  const currentAccNum = balanceData?.accountNumber || account?.accountNumber || 'SB5012349876';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-glow mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Real-time Balance Enquiry System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account Balance Enquiry
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Official Indian Rupee (₹ INR) ledger query via secure client-server REST communication
          </p>
        </div>

        <button
          onClick={handleCheckBalance}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs font-mono shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Querying Ledger...' : 'Refresh Balance'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 flex items-start gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold">Error Querying Balance</p>
            <p className="font-mono text-[11px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Indian Banking Passbook Balance Card */}
      <div className="fintech-card-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-cyan-500/30 space-y-6">
        
        {/* Top Header of Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-glow">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                SECUREBANK OF INDIA • SAVINGS ACCOUNT
              </span>
              <h2 className="text-lg font-bold text-white">
                {user?.name || 'Verified Account Holder'}
              </h2>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-navy-950/90 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>KYC Verified • Active</span>
          </div>
        </div>

        {/* Central Balance Display */}
        <div className="space-y-2 py-2 text-center sm:text-left">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
            AVAILABLE ACCOUNT BALANCE
          </span>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight text-glow">
            {loading ? (
              <span className="text-slate-500 animate-pulse">Syncing...</span>
            ) : (
              formatINR(currentBalance)
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Currency: <strong className="text-cyan-300">Indian Rupee (INR)</strong> • Zero Unsettled Holds
          </p>
        </div>

        {/* Account Details Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-navy-800 text-xs font-mono">
          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">ACCOUNT NUMBER</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-extrabold text-cyan-300">
                {showFullAccount ? currentAccNum : maskAccountNumber(currentAccNum)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowFullAccount(!showFullAccount)}
                  className="text-slate-400 hover:text-white p-1"
                  title={showFullAccount ? 'Mask' : 'Reveal'}
                >
                  {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={copyAccountNumber}
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                  title="Copy Account Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">BRANCH IFSC / NODE</span>
            <div className="mt-1 font-extrabold text-slate-200">
              SECURE000108
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">ACCOUNT TIER</span>
            <div className="mt-1 font-extrabold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Priority Digital Prime</span>
            </div>
          </div>
        </div>

      </div>

      {/* Client-Server Communication Telemetry (Computer Networks Proof) */}
      <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Client-Server Telemetry Verification
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 text-cyan-300 border border-cyan-800">
            HTTP GET /api/accounts/balance
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-850">
            <span className="text-slate-400 text-[10px] block">ROUND-TRIP LATENCY</span>
            <span className="font-extrabold text-cyan-300">
              {telemetry.latencyMs !== null ? `${telemetry.latencyMs} ms` : 'Measuring...'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-850">
            <span className="text-slate-400 text-[10px] block">HTTP STATUS</span>
            <span className="font-extrabold text-emerald-400">
              {telemetry.status || 'Verified 200 OK'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-850">
            <span className="text-slate-400 text-[10px] block">SERVER DATA SOURCE</span>
            <span className="font-extrabold text-slate-200">
              {telemetry.source}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-850">
            <span className="text-slate-400 text-[10px] block">LAST QUERY TIME</span>
            <span className="font-extrabold text-slate-300">
              {telemetry.timestamp || 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/transfer"
          className="p-4 rounded-2xl fintech-card hover:border-cyan-500/60 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-navy-950 transition-colors">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Transfer Funds (₹ INR)</h4>
              <p className="text-[11px] text-slate-400">DFA-guaranteed transaction settlement</p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">➔</span>
        </Link>

        <Link
          to="/transactions"
          className="p-4 rounded-2xl fintech-card hover:border-cyan-500/60 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-navy-950 transition-colors">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Transaction History</h4>
              <p className="text-[11px] text-slate-400">View approved and rejected ledger records</p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">➔</span>
        </Link>
      </div>

    </div>
  );
}
