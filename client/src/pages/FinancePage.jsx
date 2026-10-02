import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

export default function FinancePage({ onOpenAddTransaction, refresh }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0, totalCount: 0 });
  const [categories, setCategories] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'All') params.append('type', typeFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
        setSummary(json.data.summary);
        setCategories(json.data.categories);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, search, refresh]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini dari buku kas?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchTransactions();
      }
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Judul', 'Tipe', 'Kategori', 'Nominal (Rp)', 'Metode', 'Keterangan'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.payment_method || 'Cash',
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_ON_FIRE_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Saldo Akhir Kas</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Rp {summary.balance.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Kas Masuk</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              + Rp {summary.totalIncome.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Kas Keluar</p>
            <h3 className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">
              - Rp {summary.totalExpenses.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi / keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs">
            {['All', 'Income', 'Expense'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {t === 'All' ? 'Semua' : t === 'Income' ? 'Kas Masuk' : 'Kas Keluar'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
          >
            <option value="All">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Keterangan / Transaksi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Memuat data kas...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'Income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tx.title}
                        </div>
                        {tx.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {tx.payment_method || 'Cash'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isIncome
                            ? 'bg-[#eafbf1] text-[#16a34a] border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-[#fef2f2] text-[#ef4444] border border-red-100 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-[#16a34a] dark:text-emerald-400' : 'text-[#ef4444] dark:text-red-400'}>
                          {isIncome ? '+ ' : '- '}Rp {tx.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
