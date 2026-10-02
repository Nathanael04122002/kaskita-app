import React, { useState, useEffect } from 'react';
import { X, Check, CheckCircle2, UserX, AlertCircle, RefreshCw } from 'lucide-react';

export default function MeetingDetailModal({ meetingId, isOpen, onClose, onUpdated }) {
  const [meetingData, setMeetingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchDetail = async () => {
    if (!meetingId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/meetings/${meetingId}`);
      const json = await res.json();
      if (json.success) {
        setMeetingData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && meetingId) {
      fetchDetail();
    }
  }, [isOpen, meetingId]);

  if (!isOpen) return null;

  const handleAttendanceChange = async (memberId, newStatus, currentDues) => {
    try {
      await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          status: newStatus,
          dues_paid: newStatus === 'Present' ? 1 : currentDues
        })
      });
      fetchDetail();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuesToggle = async (memberId, currentStatus, currentDues) => {
    try {
      await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          status: currentStatus,
          dues_paid: currentDues === 1 ? 0 : 1
        })
      });
      fetchDetail();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllPresent = async () => {
    if (!confirm('Tandai semua anggota hadir dan lunas iuran untuk pertemuan ini?')) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/meetings/${meetingId}/mark-all-present`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        fetchDetail();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const attendees = meetingData?.attendees || [];
  const filteredAttendees = attendees.filter(a => 
    a.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    a.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                meetingData?.meeting?.status === 'Upcoming' 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {meetingData?.meeting?.status}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {meetingData?.meeting?.title || 'Detail Pertemuan'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              📅 {meetingData?.meeting?.date} · ⏰ {meetingData?.meeting?.time} · 📍 {meetingData?.meeting?.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Stats Summary */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-5">
            <div>
              <span className="text-slate-400">Kehadiran: </span>
              <span className="font-bold text-slate-800 dark:text-white">
                {meetingData?.stats?.present} / {meetingData?.stats?.total} ({meetingData?.stats?.percentage}%)
              </span>
            </div>
            <div>
              <span className="text-slate-400">Iuran Lunas: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {meetingData?.stats?.duesPaid} anggota (Rp {((meetingData?.stats?.duesPaid || 0) * (meetingData?.meeting?.dues_amount || 25000)).toLocaleString('id-ID')})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari anggota..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Hadir Semua
            </button>
          </div>
        </div>

        {/* Member Attendance List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 dark:divide-slate-700/60">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Memuat data kehadiran...</div>
          ) : (
            filteredAttendees.map((a) => {
              const isPresent = a.attendance_status === 'Present';
              const isPaid = a.dues_paid === 1;

              return (
                <div key={a.member_id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-750 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: a.avatar_color || '#3b82f6' }}
                    >
                      {a.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {a.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {a.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => handleAttendanceChange(a.member_id, 'Present', a.dues_paid)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          isPresent 
                            ? 'bg-emerald-600 text-white shadow-2xs' 
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(a.member_id, 'Absent', a.dues_paid)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          a.attendance_status === 'Absent' 
                            ? 'bg-red-500 text-white shadow-2xs' 
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Alpa
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(a.member_id, 'Permission', a.dues_paid)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          a.attendance_status === 'Permission' 
                            ? 'bg-amber-500 text-white shadow-2xs' 
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Izin
                      </button>
                    </div>

                    {/* Dues Paid Toggle */}
                    <button
                      onClick={() => handleDuesToggle(a.member_id, a.attendance_status, a.dues_paid)}
                      title="Klik untuk ubah status iuran"
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isPaid 
                          ? 'bg-[#eafbf1] text-[#16a34a] border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {isPaid ? '✓ Lunas Iuran' : 'Belum Bayar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
