import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Download,
  Share2
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';

export default function TransactionReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-navy-900 border border-cyan-500/40 shadow-glow-lg overflow-hidden text-slate-100">
        
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-navy-850 via-navy-900 to-navy-850 p-6 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                SecureBank Electronic Receipt
              </h3>
              <p className="text-xs text-cyan-300 font-mono">
                Official Transaction Confirmation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 print:p-8">
          
          {/* Status & Amount Highlight */}
          <div className="text-center py-4 bg-navy-950/70 rounded-xl border border-navy-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>TRANSACTION SETTLED</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              {formatINR(transaction.amount)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Indian Rupees (INR) • No Real Funds Involved
            </p>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
              <span className="text-slate-400">TRANSACTION ID:</span>
              <span className="text-cyan-300 font-bold">{transaction.transactionId}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
              <span className="text-slate-400">DATE & TIME:</span>
              <span className="text-slate-200">{formatDate(transaction.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
              <span className="text-slate-400">TRANSFER TYPE:</span>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-cyan-300 border border-cyan-800/60 font-bold">
                {transaction.type}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
              <span className="text-slate-400">FROM ACCOUNT:</span>
              <span className="text-slate-200">{transaction.senderAccount}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
              <span className="text-slate-400">TO ACCOUNT:</span>
              <span className="text-slate-200">{transaction.receiverAccount}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
              <span className="text-slate-400">PURPOSE / REMARKS:</span>
              <span className="text-slate-200 truncate max-w-[200px]">{transaction.description || 'N/A'}</span>
            </div>
          </div>

          {/* FSM Verification Stamp */}
          <div className="p-3 rounded-lg bg-navy-950 border border-cyan-900/60 text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-cyan-300">
              <span>FLAT Automata Verification:</span>
              <span className="text-emerald-400 font-bold">STATE: COMPLETED</span>
            </div>
            <p className="text-[10px] text-slate-400">
              FSM Step Trace: INITIATED ➔ VALIDATING ➔ APPROVED ➔ COMPLETED
            </p>
          </div>
        </div>

        {/* Receipt Footer Buttons */}
        <div className="p-4 bg-navy-950 border-t border-navy-800 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close Receipt
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-navy-950 hover:bg-cyan-400 shadow-glow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
