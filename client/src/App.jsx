import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FinancePage from './pages/FinancePage';
import MembersPage from './pages/MembersPage';
import DocumentationPage from './pages/DocumentationPage';
import AddTransactionModal from './components/AddTransactionModal';
import AddMemberModal from './components/AddMemberModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('finance');
  const [members, setMembers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [transactionRefresh, setTransactionRefresh] = useState(0);
  const [memberRefresh, setMemberRefresh] = useState(0);

  const fetchMembersList = async () => {
    try {
      const res = await fetch('/api/members');
      const json = await res.json();
      if (json.success) setMembers(json.data.members);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    fetchMembersList();
  }, [memberRefresh]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-[#f0f4ff] dark:bg-[#0d1424] text-slate-800 dark:text-slate-100 flex font-sans`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Backdrop mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111828]/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTab === 'finance' ? '💰 Kas Keuangan' : activeTab === 'members' ? '👥 Daftar Anggota' : '📸 Dokumentasi Kegiatan'}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                {activeTab === 'finance' ? 'Kelola pemasukan dan pengeluaran kas' : activeTab === 'members' ? 'Kelola data seluruh anggota' : 'Foto kegiatan, nota, kuitansi & dokumen'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {activeTab === 'finance' && (
              <button
                onClick={() => setIsAddTransactionOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 text-xs"
              >
                <span className="text-base leading-none">+</span>
                <span>Catat Transaksi</span>
              </button>
            )}
            {activeTab === 'members' && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 text-xs"
              >
                <span className="text-base leading-none">+</span>
                <span>Tambah Anggota</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'finance' && (
            <FinancePage
              onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
              members={members}
              refresh={transactionRefresh}
            />
          )}
          {activeTab === 'members' && (
            <MembersPage
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              refresh={memberRefresh}
            />
          )}
          {activeTab === 'documentation' && (
            <DocumentationPage />
          )}
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-800/50">
          ON FIRE — Grup Rohani Management
        </footer>
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSaved={() => setTransactionRefresh(r => r + 1)}
        members={members}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSaved={() => setMemberRefresh(r => r + 1)}
      />
    </div>
  );
}

