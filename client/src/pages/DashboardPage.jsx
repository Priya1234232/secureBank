import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  ArrowLeftRight, 
  History, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw,
  Building2,
  TrendingDown,
  TrendingUp,
  FileText,
  Radio,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../services/api';
import { formatINR, formatDate, maskAccountNumber } from '../utils/formatters';
import TransactionReceiptModal from '../components/TransactionReceiptModal';

export default function DashboardPage() {
  const { user, account, refreshBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await refreshBalance();
      const res = await transactionApi.getHistory();
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
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

  const userAccNum = account?.accountNumber;
  const approvedTx = transactions.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED');
  
  const totalMoneyIn = transactions
    .filter(t => t.receiverAccount === userAccNum && (t.status === 'APPROVED' || t.status === 'COMPLETED'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMoneyOut = transactions
    .filter(t => t.senderAccount === userAccNum && (t.status === 'APPROVED' || t.status === 'COMPLETED'))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SecureBank NetBanking Portal • Primary Account: <span className="text-slate-200">{maskAccountNumber(userAccNum)}</span>
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
          title="Refresh account balance and recent transactions"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Primary Account Card */}
      <div className="fintech-card-glow rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-cyan-500/30 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-300">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-wider uppercase">PRIMARY SAVINGS ACCOUNT</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-bold text-[10px]">
            Active • Verified
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            AVAILABLE ACCOUNT BALANCE
          </span>
          <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight text-glow">
            {formatINR(account?.balance || 0)}
          </div>
        </div>

        {/* Account Details Strip */}
        <div className="pt-4 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">ACCOUNT NUMBER</span>
              <strong className="text-white mt-0.5 block text-xs">
                {showFullAccount ? account?.accountNumber : maskAccountNumber(account?.accountNumber)}
              </strong>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFullAccount(!showFullAccount)}
                className="text-slate-400 hover:text-white p-1"
                title={showFullAccount ? 'Mask account' : 'Show account'}
              >
                {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={copyAccountNumber}
                className="text-cyan-400 hover:text-cyan-300 p-1"
                title="Copy account number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase">BRANCH IFSC</span>
            <strong className="text-white mt-0.5 block text-xs">SECURE000108</strong>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase">CURRENCY STANDARD</span>
            <strong className="text-cyan-300 mt-0.5 block text-xs">Indian Rupee (₹ INR)</strong>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Cards (Required in Section 3) */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          QUICK BANKING ACTIONS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <Link
            to="/balance-enquiry"
            className="p-5 rounded-2xl fintech-card hover:border-cyan-400/80 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-navy-950 transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Check Balance
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Instant real-time ledger query
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/transfer"
            className="p-5 rounded-2xl fintech-card hover:border-cyan-400/80 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-navy-950 transition-colors">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Transfer Money
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Send funds to any account (₹)
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/transactions"
            className="p-5 rounded-2xl fintech-card hover:border-cyan-400/80 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-navy-950 transition-colors">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Transaction History
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  View records & download receipts
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </Link>

        </div>
      </div>

      {/* 4. Activity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fintech-card rounded-2xl p-4 border border-navy-700/80 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TOTAL TRANSACTIONS</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {transactions.length}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Logged on database ledger</span>
        </div>

        <div className="fintech-card rounded-2xl p-4 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">TOTAL CREDITED</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {formatINR(totalMoneyIn)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Approved incoming funds</span>
        </div>

        <div className="fintech-card rounded-2xl p-4 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">TOTAL TRANSFERRED</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {formatINR(totalMoneyOut)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Approved outgoing funds</span>
        </div>
      </div>

      {/* 5. Recent Transactions Table */}
      <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Recent Transactions</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live updates recorded across your bank account
            </p>
          </div>

          <Link
            to="/transactions"
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
          >
            View All →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 font-mono">
            No transactions found. Transfer money or deposit funds to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Counterparty</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {transactions.slice(0, 5).map((tx) => {
                  const isCredit = tx.receiverAccount === userAccNum;
                  const isApproved = tx.status === 'APPROVED' || tx.status === 'COMPLETED';
                  const isRejected = tx.status === 'REJECTED';
                  const displayStatus = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Initiated';

                  return (
                    <tr key={tx.transactionId || tx._id} className="hover:bg-navy-850/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {tx.transactionId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {isCredit ? `From: ${maskAccountNumber(tx.senderAccount)}` : `To: ${maskAccountNumber(tx.receiverAccount)}`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[180px] truncate" title={tx.description}>
                        {tx.description || 'Bank transfer'}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${
                        isRejected ? 'text-slate-400 line-through' : isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isRejected ? '' : isCredit ? '+' : '-'}{formatINR(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isApproved
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/60'
                            : isRejected
                            ? 'bg-rose-950/80 text-rose-400 border-rose-500/60'
                            : 'bg-blue-950/80 text-blue-400 border-blue-500/60'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedReceipt(tx)}
                          className="p-1 rounded bg-navy-900 hover:bg-cyan-500 hover:text-navy-950 text-cyan-300 border border-cyan-800/80 transition-colors"
                          title="View Official Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <TransactionReceiptModal
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
}
