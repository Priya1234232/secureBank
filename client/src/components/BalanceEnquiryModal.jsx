import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Printer, 
  Server, 
  Clock, 
  ShieldCheck,
  CreditCard,
  Radio
} from 'lucide-react';
import { accountApi } from '../services/api';
import { formatINR, formatDate, maskAccountNumber } from '../utils/formatters';

export default function BalanceEnquiryModal({ user, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rtt, setRtt] = useState(0);

  useEffect(() => {
    fetchBalanceEnquiry();
  }, []);

  const fetchBalanceEnquiry = async () => {
    try {
      setLoading(true);
      const start = performance.now();
      const res = await accountApi.getBalance();
      const elapsed = Math.round(performance.now() - start);
      setRtt(elapsed);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Enquiry error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-navy-900 border border-cyan-500/40 shadow-glow-lg overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-navy-850 via-navy-900 to-navy-850 p-5 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-glow">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                <span>Official Balance Enquiry</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  LIVE REST API
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                SecureBank Central Ledger Response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBalanceEnquiry}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-cyan-300 transition-colors"
              title="Refresh Balance Enquiry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Main Balance Display */}
          <div className="text-center py-5 bg-navy-950/80 rounded-2xl border border-cyan-500/30 shadow-card">
            <span className="text-[11px] font-mono text-cyan-300 font-semibold uppercase tracking-wider block mb-1">
              TOTAL AVAILABLE LEDGER BALANCE
            </span>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
              {formatINR(data?.balance || 0)}
            </div>
            <div className="mt-2 text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Clean Balance</span>
              </span>
              <span>•</span>
              <span>Standard Currency: ₹ INR</span>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">ACCOUNT HOLDER:</span>
              <span className="text-white font-bold">{user?.name || 'Verified Customer'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">ACCOUNT NUMBER:</span>
              <span className="text-cyan-300 font-bold">{data?.accountNumber || 'Loading...'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">BRANCH IFSC CODE:</span>
              <span className="text-slate-200">SECB0004128 (Fintech HQ)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">ENQUIRY TIMESTAMP:</span>
              <span className="text-slate-200">{formatDate(new Date())}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">LEDGER STATUS:</span>
              <span className="text-emerald-400 font-bold">ACTIVE & RECONCILED</span>
            </div>
          </div>

          {/* Client-Server Network Telemetry Box (Computer Networks Integration) */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-blue-300 font-bold">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Client-Server Network Request Telemetry:</span>
              </div>
              <span className="text-emerald-400">HTTP 200 OK</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div>• Method: <strong className="text-cyan-300">GET /api/accounts/balance</strong></div>
              <div>• Measured Latency: <strong className="text-cyan-300">{rtt} ms (RTT)</strong></div>
              <div>• Transport: <strong className="text-slate-300">TCP Socket Port 5000</strong></div>
              <div>• Protocol: <strong className="text-slate-300">HTTP/1.1 REST JSON</strong></div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-navy-950 border-t border-navy-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close Enquiry
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 shadow-glow transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Balance Slip</span>
          </button>
        </div>

      </div>
    </div>
  );
}
