import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';

export default function RecentTransactionsCard({ transactions, onViewAll, onAddTransaction }) {
  // Fallback default list matching screenshot exactly
  const defaultTransactions = [
    { id: 1, displayDate: '11 Oct', title: 'Weekly dues', type: 'Income', formattedAmount: '+ Rp 800.000' },
    { id: 2, displayDate: '11 Oct', title: 'Meeting catering', type: 'Expense', formattedAmount: '- Rp 350.000' },
    { id: 3, displayDate: '04 Oct', title: 'Weekly dues', type: 'Income', formattedAmount: '+ Rp 900.000' },
    { id: 4, displayDate: '04 Oct', title: 'Venue rental', type: 'Expense', formattedAmount: '- Rp 500.000' },
    { id: 5, displayDate: '28 Sep', title: 'Equipment', type: 'Expense', formattedAmount: '- Rp 150.000' },
  ];

  const items = (transactions && transactions.length > 0) ? transactions : defaultTransactions;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100/90 dark:border-slate-700/60 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Transactions
        </h3>
        <div className="flex items-center gap-3">
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Kas</span>
            </button>
          )}
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {items.map((tx) => {
          const isIncome = tx.type === 'Income';

          return (
            <div
              key={tx.id}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-750 rounded-xl px-2 transition-colors"
            >
              {/* Left: Date + Title */}
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-400 w-14 shrink-0">
                  {tx.displayDate}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {tx.title}
                </span>
              </div>

              {/* Right: Badge + Amount */}
              <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isIncome
                      ? 'bg-[#eafbf1] text-[#16a34a] border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                      : 'bg-[#fef2f2] text-[#ef4444] border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                  }`}
                >
                  {tx.type}
                </span>
                <span
                  className={`text-sm font-bold w-28 text-right ${
                    isIncome ? 'text-[#16a34a] dark:text-emerald-400' : 'text-[#ef4444] dark:text-red-400'
                  }`}
                >
                  {tx.formattedAmount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
