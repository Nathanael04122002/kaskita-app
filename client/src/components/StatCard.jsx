import React from 'react';

export default function StatCard({ title, value, badge, badgeType = 'default' }) {
  // Badge styling matching the 4 colors in the reference screenshot
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-[#eafbf1] text-[#16a34a] border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'blue':
        return 'bg-[#edf4fe] text-[#2563eb] border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50';
      case 'danger':
        return 'bg-[#fef2f2] text-[#ef4444] border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50';
      case 'warning':
        return 'bg-[#fef9ee] text-[#d97706] border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100/90 dark:border-slate-700/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-normal">
          {title}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
          {value}
        </h3>
      </div>
      <div className="mt-3.5">
        <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${getBadgeStyle(badgeType)}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}
