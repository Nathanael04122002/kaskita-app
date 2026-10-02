import React, { useState, useEffect } from 'react';
import { CheckCircle2, UserCheck, Calendar, ArrowRight, Award } from 'lucide-react';

export default function AttendancePage({ onSelectMeeting }) {
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [meetRes, memRes] = await fetch('/api/meetings').then(r => r.json()),
              membersData = await fetch('/api/members').then(r => r.json());

        if (meetRes.success) setMeetings(meetRes.data);
        if (membersData.success) setMembers(membersData.data.members);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs">
          <p className="text-xs text-slate-400">Rata-rata Kehadiran</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">83.4%</h3>
          <p className="text-[11px] text-emerald-600 mt-2 font-semibold">Tingkat kehadiran sangat baik</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs">
          <p className="text-xs text-slate-400">Pertemuan Mendatang</p>
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">35 Hadir</h3>
          <p className="text-[11px] text-slate-400 mt-2">Dari total 42 anggota (Weekly Gathering)</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs">
          <p className="text-xs text-slate-400">Total Iuran Terverifikasi</p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">100%</h3>
          <p className="text-[11px] text-slate-400 mt-2">Semua anggota hadir tertib membayar iuran</p>
        </div>
      </div>

      {/* Quick Attendance Check-in for Meetings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Presensi Berdasarkan Pertemuan
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {meetings.map((m) => (
            <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    m.status === 'Upcoming' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {m.status}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {m.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  📅 {m.date} · ⏰ {m.time} · 📍 {m.location}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {m.presentAttendees} / {m.totalAttendees} Hadir
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {m.attendancePercentage}% partisipasi
                  </p>
                </div>
                <button
                  onClick={() => onSelectMeeting(m)}
                  className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Buka Lembar Presensi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
