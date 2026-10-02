import React from 'react';
import { MapPin } from 'lucide-react';

export default function NextMeetingCard({ meeting, onViewMeeting }) {
  const data = meeting || {
    title: 'Weekly Community Gathering',
    formattedDateTime: 'Sunday, 18 October 2026 · 19:00 WIB',
    location: 'Rumah Budi',
    duesFormatted: 'Rp 25.000 / member',
    attendanceText: '35 / 42 present',
    percentage: 83,
    badgeText: 'In 6 days',
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100/90 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Next Meeting
          </h3>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eafbf1] text-[#16a34a] border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
            {data.badgeText || 'In 6 days'}
          </span>
        </div>

        {/* Meeting Title & Details */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {data.title}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">
            {data.formattedDateTime}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
            <span className="text-red-500">📍</span>
            <span>{data.location}</span>
          </div>
        </div>

        {/* 2-column info: Weekly dues & Attendance */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Weekly dues
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {data.duesFormatted || 'Rp 25.000 / member'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Attendance
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {data.attendanceText || '35 / 42 present'}
            </p>
          </div>
        </div>

        {/* Attendance Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{ width: `${data.percentage || 83}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1.5 font-medium">
            {data.percentage || 83}% attendance
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onViewMeeting && onViewMeeting(data)}
          className="bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          View meeting
        </button>
      </div>
    </div>
  );
}
