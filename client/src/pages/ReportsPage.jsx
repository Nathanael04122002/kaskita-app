import React, { useState, useEffect } from 'react';
import { Printer, Download, FileSpreadsheet, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/reports');
        const json = await res.json();
        if (json.success) setReportData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || { totalIncome: 15000000, totalExpenses: 6250000, balance: 8750000 };
  const incomeCategories = reportData?.incomeByCategory || [];
  const expenseCategories = reportData?.expenseByCategory || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Print Button */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Laporan Keuangan & Rekonsiliasi Kas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan pertanggungjawaban kas periode berjalan Komunitas Toba
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs hover:opacity-90"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Area (Print-optimized) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-700 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 mb-8 text-center">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
            KOMUNITAS TOBA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Organization Management & Financial Transparency
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 underline decoration-2 underline-offset-4">
            LAPORAN KAS & ARUS DANA PERIODE OKTOBER 2026
          </p>
        </div>

        {/* 3 Main KPI Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
              <span>Total Penerimaan Kas</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              Rp {summary.totalIncome.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-emerald-600/80 mt-1">32 Transaksi Pemasukan</p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <div className="flex items-center justify-between text-xs text-red-800 dark:text-red-300 font-semibold mb-1">
              <span>Total Pengeluaran Kas</span>
              <TrendingDown className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">
              Rp {summary.totalExpenses.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-red-500/80 mt-1">18 Transaksi Pengeluaran</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 font-semibold mb-1">
              <span>Sisa Saldo Kas Aktif</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
              Rp {summary.balance.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-blue-600/80 mt-1">Tersedia di Kas Fisik & Bank</p>
          </div>
        </div>

        {/* Category Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Income by Category */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Rincian Pemasukan Kas</span>
            </h4>
            <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Jumlah</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {incomeCategories.map(c => (
                    <tr key={c.category}>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{c.category}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{c.count} tx</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {c.total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense by Category */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Rincian Pengeluaran Kas</span>
            </h4>
            <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Jumlah</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {expenseCategories.map(c => (
                    <tr key={c.category}>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{c.category}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{c.count} tx</td>
                      <td className="py-2 px-3 text-right font-bold text-red-500 dark:text-red-400">
                        Rp {c.total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Signature Blocks for Official Print */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 mt-10">
          <div className="flex justify-between items-end text-xs text-center px-6">
            <div className="w-48">
              <p className="text-slate-500 dark:text-slate-400">Mengetahui,</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">Ketua Komunitas</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 dark:text-white border-b border-slate-400 pb-0.5 inline-block min-w-[140px]">
                Budi Santoso
              </p>
            </div>

            <div className="w-48">
              <p className="text-slate-500 dark:text-slate-400">Disusun oleh,</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">Bendahara Umum</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 dark:text-white border-b border-slate-400 pb-0.5 inline-block min-w-[140px]">
                Natanael Christianto
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
