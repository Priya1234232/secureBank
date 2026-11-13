import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileText, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  XCircle,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../services/api';
import { formatINR, formatDate, maskAccountNumber } from '../utils/formatters';
import TransactionReceiptModal from '../components/TransactionReceiptModal';

export default function TransactionsPage() {
  const { account } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, statusFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;

      const res = await transactionApi.getHistory(params);
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.warn('History fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const userAccNum = account?.accountNumber;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Banking Transaction History</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete immutable ledger of deposits and transfers in Indian Rupees (₹)
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="fintech-card rounded-2xl p-4 border border-navy-700/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID, sender, receiver, or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white font-mono outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Types</option>
            <option value="TRANSFER">Transfers Only</option>
            <option value="DEPOSIT">Deposits Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved (Green)</option>
            <option value="REJECTED">Rejected (Red)</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 text-navy-950 text-xs font-bold font-mono hover:bg-cyan-400 shadow-glow transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="fintech-card rounded-2xl p-5 border border-navy-700/80 space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Flow</th>
                  <th className="py-3 px-3">Sender Account</th>
                  <th className="py-3 px-3">Receiver Account</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                  <th className="py-3 px-3 text-center">DFA Status</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {transactions.map((tx) => {
                  const isCredit = tx.receiverAccount === userAccNum;
                  const isApproved = tx.status === 'APPROVED' || tx.status === 'COMPLETED';
                  const isRejected = tx.status === 'REJECTED';
                  const displayStatus = isApproved ? 'APPROVED' : tx.status;

                  return (
                    <tr key={tx.transactionId || tx._id} className="hover:bg-navy-850/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        {tx.transactionId}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCredit ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                        }`}>
                          {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isCredit ? 'CREDIT' : 'DEBIT'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {maskAccountNumber(tx.senderAccount)}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {maskAccountNumber(tx.receiverAccount)}
                      </td>
                      <td className="py-3 px-3 text-slate-400 max-w-[180px] truncate" title={tx.description}>
                        {tx.description || 'Banking transaction'}
                      </td>
                      <td className={`py-3 px-3 text-right font-extrabold text-sm ${
                        isRejected ? 'text-slate-400 line-through' : isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isRejected ? '' : isCredit ? '+' : '-'}{formatINR(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
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
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedReceipt(tx)}
                          className="p-1.5 rounded-lg bg-navy-900 hover:bg-cyan-500 hover:text-navy-950 text-cyan-300 border border-cyan-800/80 transition-all"
                          title="Generate & View Printable Receipt"
                        >
                          <FileText className="w-4 h-4" />
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
