import React from 'react';
import StatCard from '../components/StatCard';
import CashFlowChart from '../components/CashFlowChart';
import NextMeetingCard from '../components/NextMeetingCard';
import RecentTransactionsCard from '../components/RecentTransactionsCard';

export default function Overview({
  overviewData,
  onViewAllTransactions,
  onOpenAddTransaction,
  onViewMeeting
}) {
  const stats = overviewData?.stats || {
    currentBalance: { formatted: 'Rp 8.750.000', badge: '+8.4% this month', badgeType: 'success' },
    totalIncome: { formatted: 'Rp 15.000.000', badge: '32 transactions', badgeType: 'blue' },
    totalExpenses: { formatted: 'Rp 6.250.000', badge: '18 transactions', badgeType: 'danger' },
    members: { formatted: '42', badge: '35 active this week', badgeType: 'warning' },
  };

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Balance"
          value={stats.currentBalance?.formatted}
          badge={stats.currentBalance?.badge}
          badgeType={stats.currentBalance?.badgeType || 'success'}
        />
        <StatCard
          title="Total Income"
          value={stats.totalIncome?.formatted}
          badge={stats.totalIncome?.badge}
          badgeType={stats.totalIncome?.badgeType || 'blue'}
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses?.formatted}
          badge={stats.totalExpenses?.badge}
          badgeType={stats.totalExpenses?.badgeType || 'danger'}
        />
        <StatCard
          title="Members"
          value={stats.members?.formatted}
          badge={stats.members?.badge}
          badgeType={stats.members?.badgeType || 'warning'}
        />
      </div>

      {/* Middle Row: Cash Flow Chart (Left) & Next Meeting (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <CashFlowChart data={overviewData?.cashFlow} />
        </div>
        <div className="lg:col-span-5">
          <NextMeetingCard 
            meeting={overviewData?.nextMeeting} 
            onViewMeeting={onViewMeeting}
          />
        </div>
      </div>

      {/* Bottom Row: Recent Transactions */}
      <div>
        <RecentTransactionsCard
          transactions={overviewData?.recentTransactions}
          onViewAll={onViewAllTransactions}
          onAddTransaction={onOpenAddTransaction}
        />
      </div>
    </div>
  );
}
