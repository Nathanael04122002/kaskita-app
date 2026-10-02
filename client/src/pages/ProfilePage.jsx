import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Check, Save } from 'lucide-react';

export default function ProfilePage({ onDataReload }) {
  const [profile, setProfile] = useState({
    user_name: 'Natanael Christianto',
    user_initials: 'NC',
    user_role: 'Bendahara Umum',
    user_email: 'natanael@kaskita.id',
    user_phone: '+62 812-8899-7711'
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setProfile({
            user_name: json.data.user_name || 'Natanael Christianto',
            user_initials: json.data.user_initials || 'NC',
            user_role: json.data.user_role || 'Bendahara',
            user_email: json.data.user_email || 'natanael@kaskita.id',
            user_phone: json.data.user_phone || '+62 812-8899-7711'
          });
        }
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
        body: JSON.stringify(profile)
      });
      const json = await res.json();
      if (json.success) {
        setMessage('Profil berhasil diperbarui!');
        setTimeout(() => setMessage(''), 3000);
        if (onDataReload) onDataReload();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-xs">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-2xl flex items-center justify-center shadow-xs border border-blue-200 dark:border-blue-800">
            {profile.user_initials}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {profile.user_name}
            </h3>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{profile.user_role} · Komunitas Toba</span>
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={profile.user_name}
                onChange={(e) => setProfile({ ...profile, user_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inisial Avatar
              </label>
              <input
                type="text"
                maxLength={3}
                value={profile.user_initials}
                onChange={(e) => setProfile({ ...profile, user_initials: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan Kepengurusan
              </label>
              <input
                type="text"
                value={profile.user_role}
                onChange={(e) => setProfile({ ...profile, user_role: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / Kontak
              </label>
              <input
                type="text"
                value={profile.user_phone}
                onChange={(e) => setProfile({ ...profile, user_phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              value={profile.user_email}
              onChange={(e) => setProfile({ ...profile, user_email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Perbarui Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
