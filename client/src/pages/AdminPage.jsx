import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Users, 
  ArrowLeftRight, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  Clock,
  Search
} from 'lucide-react';
import { adminApi } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import TransactionReceiptModal from '../components/TransactionReceiptModal';

export default function AdminPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'transactions'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, txRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        adminApi.getTransactions()
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (txRes.data.success) setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.warn('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.senderAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiverAccount?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-mono mb-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>CENTRAL BANK CONTROLLER • RESTRICTED ACCESS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bank Administration & Audit Console
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            System overview • User registries • Immutable ledger audit logs
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All Systems</span>
        </button>
      </div>

      {/* 2. Admin System Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="fintech-card rounded-2xl p-5 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>REGISTERED USERS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">
            {dashboardData?.stats?.totalUsers || users.length}
          </div>
          <div className="text-[11px] text-cyan-300 font-mono mt-1">
            Accounts with active balances
          </div>
        </div>

        {/* Total Transactions */}
        <div className="fintech-card rounded-2xl p-5 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL TRANSACTIONS</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-2">
            {dashboardData?.stats?.totalTransactions || transactions.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Settled via FLAT FSM
          </div>
        </div>

        {/* Total Volume INR */}
        <div className="fintech-card rounded-2xl p-5 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL VOLUME SETTLED</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">
            {formatINR(dashboardData?.stats?.totalVolumeINR || 0)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Standard Currency: ₹ INR
          </div>
        </div>

        {/* Persistence Engine Status */}
        <div className="fintech-card rounded-2xl p-5 border border-navy-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>LEDGER ENGINE</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-2 truncate">
            {dashboardData?.stats?.dbStatus?.mode || 'Demo Engine'}
          </div>
          <div className="text-[10px] text-purple-300 font-mono mt-1 truncate">
            {dashboardData?.stats?.dbStatus?.label || 'Safe Memory Store'}
          </div>
        </div>

      </div>

      {/* 3. Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800 self-start">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
              activeTab === 'users'
                ? 'bg-cyan-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
              activeTab === 'transactions'
                ? 'bg-cyan-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transaction Monitoring ({transactions.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-navy-800 focus:border-cyan-400 text-xs text-white font-mono outline-none"
          />
        </div>
      </div>

      {/* 4. Tab 1: User Management Table */}
      {activeTab === 'users' && (
        <div className="fintech-card rounded-2xl p-5 border border-navy-700/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email Identifier</th>
                  <th className="py-2.5 px-3">Account Number</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-right">Demo Balance (₹)</th>
                  <th className="py-2.5 px-3 text-center">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {u.name}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">
                      {u.email}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {u.accountNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {u.phone}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                      {formatINR(u.balance)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-navy-900 text-slate-300 border border-navy-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Transaction Monitoring Table */}
      {activeTab === 'transactions' && (
        <div className="fintech-card rounded-2xl p-5 border border-navy-700/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Sender Account</th>
                  <th className="py-2.5 px-3">Receiver Account</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.transactionId || tx._id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {tx.transactionId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {tx.senderAccount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {tx.receiverAccount}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-navy-900 border border-navy-700 text-slate-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-white">
                      {formatINR(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="p-1 rounded bg-navy-900 hover:bg-cyan-500 hover:text-navy-950 text-cyan-300 border border-cyan-800/80 transition-colors"
                        title="Audit Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
