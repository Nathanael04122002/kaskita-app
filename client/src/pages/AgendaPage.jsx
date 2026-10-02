import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertTriangle, Trash2, Calendar, User } from 'lucide-react';

export default function AgendaPage() {
  const [agendas, setAgendas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [desc, setDesc] = useState('');

  const fetchAgendas = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/agendas');
      const json = await res.json();
      if (json.success) setAgendas(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`/api/agendas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAgendas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus agenda ini?')) return;
    try {
      await fetch(`/api/agendas/${id}`, { method: 'DELETE' });
      fetchAgendas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      const res = await fetch('/api/agendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          target_date: targetDate || '2026-10-31',
          priority,
          assigned_to: assignedTo,
          description: desc
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setNewTitle('');
        setAssignedTo('');
        setDesc('');
        fetchAgendas();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Agenda & Program Kerja Komunitas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar kegiatan, target kepengurusan, dan checklist program kas
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Grid of Agendas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {['To Do', 'In Progress', 'Completed'].map((statusCol) => {
          const colItems = agendas.filter(a => a.status === statusCol);

          return (
            <div key={statusCol} className="bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {statusCol}
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                  {colItems.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-2xs flex flex-col justify-between hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.priority === 'High' 
                            ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/40' 
                            : item.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40'
                            : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40'
                        }`}>
                          {item.priority}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-300 hover:text-red-500 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.target_date || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <User className="w-3 h-3 text-blue-500" />
                        <span>{item.assigned_to || 'Tim'}</span>
                      </div>
                    </div>

                    {/* Status change buttons */}
                    <div className="mt-3 pt-2 flex items-center gap-1 justify-end">
                      {statusCol !== 'To Do' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'To Do')}
                          className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200"
                        >
                          To Do
                        </button>
                      )}
                      {statusCol !== 'In Progress' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'In Progress')}
                          className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 rounded hover:bg-blue-100"
                        >
                          In Progress
                        </button>
                      )}
                      {statusCol !== 'Completed' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'Completed')}
                          className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded hover:bg-emerald-100"
                        >
                          Done ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Tambah Agenda Komunitas</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Agenda *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  placeholder="Contoh: Pengadaan Sound System"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Tanggal</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Contoh: Daniel Simanjuntak"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563eb] rounded-lg shadow-xs"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
