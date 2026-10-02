import React from 'react';
import { Search, Moon, Sun, Menu } from 'lucide-react';

export default function Header({ 
  title = 'Overview', 
  subtitle, 
  searchQuery, 
  setSearchQuery, 
  darkMode, 
  setDarkMode, 
  userData, 
  onMenuClick 
}) {
  // Default formatted date matching design: "Sunday, 11 October 2026"
  const defaultDate = subtitle || 'Sunday, 11 October 2026';

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 pt-1">
      {/* Title & Date */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-400">
            {defaultDate}
          </p>
        </div>
      </div>

      {/* Right Controls: Search, Theme Toggle, Profile */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-56 pl-9 pr-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Ganti Tema"
          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shadow-2xs border border-blue-200 dark:border-blue-800">
            {userData?.initials || 'NC'}
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden md:inline">
            {userData?.name ? userData.name.split(' ')[0] : 'Natanael'}
          </span>
        </div>
      </div>
    </header>
  );
}
