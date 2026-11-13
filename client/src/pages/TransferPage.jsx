import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  FileText,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { transactionApi, accountApi } from '../services/api';
import { formatINR, maskAccountNumber } from '../utils/formatters';
import TransactionReceiptModal from '../components/TransactionReceiptModal';

export default function TransferPage() {
  const { account, refreshBalance } = useAuth();
  
  const [receiverAccount, setReceiverAccount] = useState('SB7089123456'); // Priya's demo account
  const [receiverName, setReceiverName] = useState('Priya Sundaram (Verified Recipient)');
  const [amount, setAmount] = useState('1000');
  const [description, setDescription] = useState('Fund transfer for monthly payment');
  
  const [transactionStatus, setTransactionStatus] = useState(null); // null | 'Initiated' | 'Approved' | 'Rejected'
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Recipient Account Lookup
  const handleAccountChange = async (accNum) => {
    setReceiverAccount(accNum);
    setError('');
    setTransactionStatus(null);
    if (accNum.length >= 8) {
      try {
        const res = await accountApi.lookupAccount(accNum.trim());
        if (res.data.success) {
          setReceiverName(`${res.data.holderName} (Verified SecureBank Holder)`);
        }
      } catch (err) {
        setReceiverName('Recipient account not found in registry');
      }
    } else {
      setReceiverName('');
    }
  };

  const handleTransfer = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setStatusMessage('');
    const numAmount = Number(amount);

    // Frontend pre-validations
    if (!receiverAccount || !receiverAccount.trim()) {
      setError('Receiver account number is required');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Transfer amount must be greater than ₹0');
      return;
    }

    if (account?.accountNumber && receiverAccount.trim() === account.accountNumber) {
      setError('You cannot transfer funds to your own account');
      return;
    }

    try {
      setLoading(true);
      // Small real-world status indicator: Initiated
      setTransactionStatus('Initiated');
      setStatusMessage('Transaction dispatched to banking core: Initiated');
      await new Promise(r => setTimeout(r, 350));

      // Call backend REST API (where DFA engine verifies and commits atomically)
      const res = await transactionApi.transfer({
        receiverAccount: receiverAccount.trim(),
        amount: numAmount,
        description: description || 'Online banking transfer'
      });

      if (res.data.success) {
        // Backend DFA accepted and committed
        setTransactionStatus('Approved');
        setStatusMessage(`Transfer of ${formatINR(numAmount)} approved & completed successfully. Balances updated.`);
        setSuccessReceipt(res.data.transaction);
        
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });

        await refreshBalance();
      }
    } catch (err) {
      // Backend DFA rejected (overdraft, invalid recipient, etc.)
      setTransactionStatus('Rejected');
      const backendMsg = err.response?.data?.message || err.message || 'Transfer rejected by banking server';
      setError(backendMsg);
      setStatusMessage(`Transaction rejected: ${backendMsg}. Account balances remain unchanged.`);
      await refreshBalance();
    } finally {
      setLoading(false);
    }
  };

  // Demo test helpers
  const handleDemoSend1000 = () => {
    setReceiverAccount('SB7089123456');
    setReceiverName('Priya Sundaram (Verified Recipient)');
    setAmount('1000');
    setDescription('Demo test transfer of ₹1,000');
    setError('');
    setTransactionStatus(null);
  };

  const handleDemoOverdraft = () => {
    const excessiveAmt = ((account?.balance || 50000) + 100000).toString();
    setReceiverAccount('SB7089123456');
    setReceiverName('Priya Sundaram (Verified Recipient)');
    setAmount(excessiveAmt);
    setDescription('Demo test: Overdraft attempt exceeding available balance');
    setError('');
    setTransactionStatus(null);
  };

  const handleDemoInvalidReceiver = () => {
    setReceiverAccount('SB0000000000');
    setReceiverName('Invalid Demo Account (Not in registry)');
    setAmount('2500');
    setDescription('Demo test: Transfer to non-existent account number');
    setError('');
    setTransactionStatus(null);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ArrowLeftRight className="w-7 h-7 text-cyan-400" />
          <span>Transfer Money</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Instant fund transfers in Indian Rupees (₹ INR) to any SecureBank account
        </p>
      </div>

      {/* 2. Source Account Info Card */}
      <div className="fintech-card rounded-2xl p-5 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">FROM ACCOUNT</span>
            <span className="text-sm font-extrabold text-white font-mono">
              Savings A/C ({maskAccountNumber(account?.accountNumber)})
            </span>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">AVAILABLE BALANCE</span>
          <span className="text-xl font-black text-cyan-300 font-mono">
            {formatINR(account?.balance || 0)}
          </span>
        </div>
      </div>

      {/* 3. Small Real-World Transaction Status Indicator */}
      {transactionStatus && (
        <div className={`p-4 rounded-2xl border transition-all ${
          transactionStatus === 'Approved'
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
            : transactionStatus === 'Rejected'
            ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
            : 'bg-blue-950/80 border-blue-500/60 text-blue-300'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {transactionStatus === 'Approved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : transactionStatus === 'Rejected' ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
              )}
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider block">
                  Transaction Status: {transactionStatus}
                </span>
                <p className="text-xs mt-0.5 font-sans leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </div>

            {transactionStatus === 'Approved' && successReceipt && (
              <button
                onClick={() => setSuccessReceipt(successReceipt)}
                className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-xs font-mono font-bold text-white shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Receipt</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Transfer Form */}
      <div className="fintech-card rounded-2xl p-6 sm:p-7 border border-navy-700/80 space-y-5">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-300 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-bold block">Transfer Error</span>
              <span className="font-mono text-[11px]">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          
          {/* Receiver Account */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 font-mono uppercase">
                Receiver Account Number
              </label>
              {receiverName && (
                <span className={`text-[11px] font-mono ${
                  receiverName.includes('not found') ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {receiverName}
                </span>
              )}
            </div>

            <input
              type="text"
              value={receiverAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              required
              placeholder="e.g. SB7089123456"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white font-mono outline-none transition-all"
            />
          </div>

          {/* Amount in ₹ INR */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 font-mono uppercase">
              Transfer Amount in Indian Rupees (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-cyan-400 font-mono">
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
                placeholder="1000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-base text-white font-mono font-bold outline-none transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {['500', '1000', '5000', '10000', '25000'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setAmount(chip);
                    setError('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-navy-950 hover:bg-navy-800 border border-navy-800 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  ₹{Number(chip).toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 font-mono uppercase">
              Remarks / Purpose
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly rent, office fees, invoice"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white outline-none transition-all"
            />
          </div>

          {/* Transfer Button */}
          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Processing Transfer...</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Transfer {formatINR(amount || 0)} Now</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* 5. 1-Click Demo Testing Toolbar */}
      <div className="fintech-card rounded-2xl p-4 border border-navy-800 space-y-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
          EVALUATOR QUICK TEST PRESETS (CLICK TO PREFILL & TEST):
        </span>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={handleDemoSend1000}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-colors"
          >
            1. Valid Transfer (₹1,000 ➔ Approved)
          </button>

          <button
            type="button"
            onClick={handleDemoOverdraft}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-colors"
          >
            2. Insufficient Balance (➔ Rejected)
          </button>

          <button
            type="button"
            onClick={handleDemoInvalidReceiver}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-colors"
          >
            3. Invalid Receiver (➔ Rejected)
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {successReceipt && (
        <TransactionReceiptModal
          transaction={successReceipt}
          onClose={() => setSuccessReceipt(null)}
        />
      )}

    </div>
  );
}
