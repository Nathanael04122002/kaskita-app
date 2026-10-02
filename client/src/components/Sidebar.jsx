import React from 'react';
import { DollarSign, Users, FolderOpen, X } from 'lucide-react';
import logoOnFire from '../assets/logo_domain.png';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, darkMode, setDarkMode }) {
  const navItems = [
    {
      id: 'finance',
      label: 'Kas Keuangan',
      sublabel: 'Masuk & Keluar',
      icon: DollarSign,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-600',
    },
    {
      id: 'members',
      label: 'Data Anggota',
      sublabel: 'Direktori & Info',
      icon: Users,
      color: 'text-blue-400',
      activeBg: 'bg-blue-600',
    },
    {
      id: 'documentation',
      label: 'Dokumentasi',
      sublabel: 'Foto & Bukti',
      icon: FolderOpen,
      color: 'text-violet-400',
      activeBg: 'bg-violet-600',
    },
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col
        bg-gradient-to-b from-[#0f172a] to-[#111e35]
        border-r border-slate-800/60
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src={logoOnFire}
                alt="ON FIRE Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-md shadow-orange-500/20 ring-2 ring-orange-500/30"
              />
              <div>
                <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 tracking-tight leading-none">
                  ON FIRE
                </h1>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Grup Rohani</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Menu Utama</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all text-left group
                  ${isActive
                    ? `${item.activeBg} text-white shadow-lg`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  isActive ? 'bg-white/20' : 'bg-slate-800/80 group-hover:bg-slate-700'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {item.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    {item.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Dark Mode Toggle at Bottom */}
        <div className="px-4 pb-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Tampilan</p>
            <button
              onClick={() => setDarkMode && setDarkMode(!darkMode)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                darkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{darkMode ? '☀️  Mode Terang' : '🌙  Mode Gelap'}</span>
              <div className={`w-8 h-4 rounded-full transition-all relative ${darkMode ? 'bg-blue-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${darkMode ? 'left-4' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
