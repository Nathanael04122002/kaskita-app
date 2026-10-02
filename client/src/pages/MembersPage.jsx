import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, Mail, MapPin, Trash2, DollarSign, Calendar, FileText } from 'lucide-react';

export default function MembersPage({ onOpenAddMember, refresh }) {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalDuesCollected: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [payingMember, setPayingMember] = useState(null);
  const [duesAmount, setDuesAmount] = useState('25000');
  const [expandedId, setExpandedId] = useState(null);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'All') params.append('role', roleFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await fetch(`/api/members?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setMembers(json.data.members);
        setStats(json.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter, refresh]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus anggota ${name} dari daftar?`)) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchMembers();
      }
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const handlePayDues = async (e) => {
    e.preventDefault();
    if (!payingMember) return;
    try {
      const res = await fetch(`/api/members/${payingMember.id}/pay-dues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(duesAmount) })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setPayingMember(null);
        fetchMembers();
      }
    } catch (err) {
      alert('Gagal membayar iuran: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400">Total Anggota</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
          <span className="text-[11px] font-semibold text-blue-500 mt-1 block">Terdaftar</span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400">Aktif</p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</h3>
          <span className="text-[11px] font-semibold text-emerald-500 mt-1 block">Berpartisipasi</span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400">Non-Aktif</p>
          <h3 className="text-2xl font-bold text-slate-500 mt-1">{stats.inactive}</h3>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Follow-up</span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400">Total Iuran</p>
          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">Rp {stats.totalDuesCollected.toLocaleString('id-ID')}</h3>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Terkumpul</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, no. HP, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
        >
          <option value="All">Semua Status</option>
          <option value="Active">Aktif</option>
          <option value="Inactive">Non-Aktif</option>
        </select>
        <p className="text-xs text-slate-400 ml-auto">{members.length} anggota ditemukan</p>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl">Memuat data anggota...</div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold text-slate-600 dark:text-slate-400">Belum ada anggota</p>
            <p className="text-xs mt-1">Klik tombol Tambah Anggota untuk mendaftarkan anggota baru.</p>
          </div>
        ) : members.map((m) => {
          const isActive = m.status === 'Active';
          const isExpanded = expandedId === m.id;

          return (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all"
            >
              {/* Member Header Row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition"
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
              >
                <div
                  className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0"
                  style={{ backgroundColor: m.avatar_color || '#3b82f6' }}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {isActive ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{m.role}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPayingMember(m); }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span className="hidden sm:inline">Bayar Kas</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id, m.name); }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Hapus anggota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className={`text-slate-400 transition-transform text-xs ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2.5">
                    {m.phone && (
                      <div className="flex items-start gap-2 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-400 text-[10px]">No. HP / WhatsApp</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{m.phone}</p>
                        </div>
                      </div>
                    )}
                    {m.email && (
                      <div className="flex items-start gap-2 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-400 text-[10px]">Email</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 break-all">{m.email}</p>
                        </div>
                      </div>
                    )}
                    {m.address && (
                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-400 text-[10px]">Alamat</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{m.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {m.joined_date && (
                      <div className="flex items-start gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-400 text-[10px]">Bergabung</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{m.joined_date}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-400 text-[10px]">Total Iuran Dibayar</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">Rp {(m.dues_paid || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    {m.notes && (
                      <div className="flex items-start gap-2 text-xs">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-400 text-[10px]">Catatan</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{m.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Pay Modal */}
      {payingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Catat Iuran Kas Anggota
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Untuk: <span className="font-semibold text-slate-800 dark:text-white">{payingMember.name}</span>
            </p>

            <form onSubmit={handlePayDues} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={duesAmount}
                  onChange={(e) => setDuesAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingMember(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
