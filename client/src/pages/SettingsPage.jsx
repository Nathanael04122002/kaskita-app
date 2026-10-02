import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Building2, Moon, Sun, Check } from 'lucide-react';

export default function SettingsPage({ darkMode, setDarkMode, onDataReload }) {
  const [settings, setSettings] = useState({
    org_name: 'Komunitas Toba',
    org_tagline: 'Organization Management',
    weekly_dues: 25000,
    user_name: 'Natanael Christianto',
    user_initials: 'NC',
    user_role: 'Bendahara Umum',
    user_email: 'natanael@kaskita.id',
    user_phone: '+62 812-8899-7711'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) setSettings(json.data);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        setMessage('Pengaturan berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
        if (onDataReload) onDataReload();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Peringatan: Reset akan mengembalikan semua data kas, anggota, dan pertemuan ke kondisi awal screenshot referensi (Saldo Rp 8.750.000, 42 Anggota). Lanjutkan?')) return;
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        window.location.reload();
      }
    } catch (err) {
      alert('Gagal reset: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Pengaturan Organisasi & Aplikasi
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola identitas komunitas dan konfigurasi kas default
        </p>

        {message && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Organisasi
              </label>
              <input
                type="text"
                value={settings.org_name}
                onChange={(e) => setSettings({ ...settings, org_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline Organisasi
              </label>
              <input
                type="text"
                value={settings.org_tagline}
                onChange={(e) => setSettings({ ...settings, org_tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarif Iuran Kas Mingguan (Rp)
              </label>
              <input
                type="number"
                value={settings.weekly_dues}
                onChange={(e) => setSettings({ ...settings, weekly_dues: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mode Tampilan (Theme)
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDarkMode(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    !darkMode ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light Mode (Sesuai Desain)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    darkMode ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Reset Section */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
          Reset Data ke Default Screenshot
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Jika Anda telah menambahkan atau menghapus data dan ingin mengembalikan angka-angka statistik kembali sama persis dengan screenshot referensi (Saldo Rp 8.750.000, Masuk 15.000.000, Keluar 6.250.000, 42 anggota), klik tombol di bawah ini.
        </p>
        <button
          onClick={handleResetData}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Data Referensi Desain</span>
        </button>
      </div>
    </div>
  );
}
