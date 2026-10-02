import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Users, CheckCircle2, Clock } from 'lucide-react';

export default function MeetingsPage({ onOpenAddMeeting, onSelectMeeting }) {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/meetings');
      const json = await res.json();
      if (json.success) {
        setMeetings(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Jadwal Pertemuan Komunitas Toba
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar pertemuan rutin mingguan, rapat koordinasi, dan absensi kehadiran
          </p>
        </div>
        <button
          onClick={onOpenAddMeeting}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Jadwalkan Pertemuan Baru</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Memuat jadwal pertemuan...</div>
        ) : meetings.map((m) => {
          const isUpcoming = m.status === 'Upcoming';

          return (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    isUpcoming
                      ? 'bg-[#eafbf1] text-[#16a34a] border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {isUpcoming ? 'Akan Datang' : 'Selesai'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Iuran: Rp {(m.dues_amount || 25000).toLocaleString('id-ID')}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {m.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  📅 {m.date} · ⏰ {m.time}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                  <span className="text-red-500">📍</span>
                  <span>{m.location}</span>
                </div>

                {m.agenda_topics && (
                  <div className="mt-3.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Topik Rapat:</p>
                    <p className="whitespace-pre-line text-[11px] text-slate-500 dark:text-slate-400">{m.agenda_topics}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{m.presentAttendees} / {m.totalAttendees} Hadir ({m.attendancePercentage}%)</span>
                  </div>
                  <div className="w-32 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-[#2563eb] h-full rounded-full" style={{ width: `${m.attendancePercentage}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => onSelectMeeting(m)}
                  className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Kelola Presensi
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
