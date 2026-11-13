import React, { useState } from 'react';
import { 
  PiggyBank, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../services/api';
import { formatINR } from '../utils/formatters';
import TransactionReceiptModal from '../components/TransactionReceiptModal';

export default function DepositPage() {
  const { account, refreshBalance } = useAuth();
  const [amount, setAmount] = useState('25000');
  const [method, setMethod] = useState('UPI');
  const [description, setDescription] = useState('Personal savings deposit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const presets = ['5000', '10000', '25000', '50000', '100000'];

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Deposit amount must be greater than ₹0');
      return;
    }

    try {
      setLoading(true);
      const res = await transactionApi.deposit(numAmount, `${method} deposit: ${description}`);
      if (res.data.success) {
        setReceipt(res.data.transaction);
        await refreshBalance();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-cyan-400" />
          <span>Simulated Funds Deposit (₹ INR)</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Credit demo funds into your SecureBank savings account instantly
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">CURRENT ACCOUNT BALANCE</div>
            <div className="text-xl font-extrabold text-white font-mono">
              {formatINR(account?.balance || 0)}
            </div>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400">
          <div>Account Number:</div>
          <strong className="text-cyan-300">{account?.accountNumber}</strong>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="fintech-card rounded-2xl p-6 border border-navy-700/80 shadow-glow space-y-5">
        
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-4">
          
          {/* Deposit Method Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">
              Select Simulated Inbound Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR Pay', icon: QrCode },
                { id: 'NetBanking', label: 'Net Banking', icon: CreditCard },
                { id: 'CashCounter', label: 'Cash Counter', icon: PiggyBank }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      method === m.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-glow'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
              Deposit Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-cyan-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                required
                placeholder="25000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white font-mono font-bold outline-none transition-all"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    amount === preset
                      ? 'bg-cyan-500 text-navy-950 font-bold'
                      : 'bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800'
                  }`}
                >
                  +{formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
              Deposit Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Salary deposit, monthly savings"
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Processing Simulated Inflow...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Deposit {formatINR(amount || 0)} into Account</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* Confirmation Receipt Modal */}
      {receipt && (
        <TransactionReceiptModal
          transaction={receipt}
          onClose={() => setReceipt(null)}
        />
      )}

    </div>
  );
}
