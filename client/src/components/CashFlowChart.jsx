import React, { useState } from 'react';

export default function CashFlowChart({ data }) {
  const [viewMode, setViewMode] = useState('Weekly');
  const [hoveredWeek, setHoveredWeek] = useState(null);

  // Default 6 weeks data matching screenshot
  const defaultWeeklyData = [
    { week: 'W1', income: 2000000, expense: 800000 },
    { week: 'W2', income: 2800000, expense: 1200000 },
    { week: 'W3', income: 2200000, expense: 1100000 },
    { week: 'W4', income: 2900000, expense: 1150000 },
    { week: 'W5', income: 2600000, expense: 1300000 },
    { week: 'W6', income: 3000000, expense: 700000 },
  ];

  const monthlyData = [
    { week: 'May', income: 4500000, expense: 2100000 },
    { week: 'Jun', income: 5200000, expense: 2800000 },
    { week: 'Jul', income: 6100000, expense: 3400000 },
    { week: 'Aug', income: 7200000, expense: 3900000 },
    { week: 'Sep', income: 8400000, expense: 4500000 },
    { week: 'Oct', income: 15000000, expense: 6250000 },
  ];

  const activeData = viewMode === 'Weekly' ? (data || defaultWeeklyData) : monthlyData;

  // Find max value to scale bar heights relative to max
  const maxVal = Math.max(...activeData.flatMap(d => [d.income, d.expense])) * 1.15 || 3500000;

  const formatShortIDR = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num;
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100/90 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Cash Flow
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
            {viewMode === 'Weekly' ? 'Last 6 weeks' : 'Last 6 months'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
              Income
            </span>
            <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
              Expense
            </span>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-full text-xs">
            <button
              onClick={() => setViewMode('Weekly')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                viewMode === 'Weekly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('Monthly')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                viewMode === 'Monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-6">
        {/* Subtle grid line */}
        <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-100 dark:border-slate-700/50 pointer-events-none"></div>

        {/* Bars Container */}
        <div className="h-48 flex items-end justify-between gap-3 px-2 sm:px-6 border-b border-slate-100 dark:border-slate-700/60 pb-1">
          {activeData.map((item, idx) => {
            const incomeHeight = Math.max(12, Math.round((item.income / maxVal) * 100));
            const expenseHeight = Math.max(10, Math.round((item.expense / maxVal) * 100));
            const isHovered = hoveredWeek === idx;

            return (
              <div 
                key={item.week} 
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredWeek(idx)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-300">{item.week}</span>
                    <span className="text-blue-400">Masuk: Rp {item.income.toLocaleString('id-ID')}</span>
                    <span className="text-red-400">Keluar: Rp {item.expense.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {/* The 2 Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2">
                  {/* Income bar: Vibrant Blue */}
                  <div
                    style={{ height: `${incomeHeight}%` }}
                    className="w-3.5 sm:w-4 bg-[#2563eb] rounded-t-md hover:brightness-110 transition-all duration-300 shadow-2xs"
                  />
                  {/* Expense bar: Bright Red */}
                  <div
                    style={{ height: `${expenseHeight}%` }}
                    className="w-3.5 sm:w-4 bg-[#ef4444] rounded-t-md hover:brightness-110 transition-all duration-300 shadow-2xs"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between px-2 sm:px-6 pt-2">
          {activeData.map((item) => (
            <div key={item.week} className="flex-1 text-center">
              <span className="text-xs text-slate-400 font-medium">
                {item.week}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
