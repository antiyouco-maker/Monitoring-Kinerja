/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database, RefreshCw, Calendar, CheckCircle2, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  activeYear: number;
  setActiveYear: (year: number) => void;
  onSyncSakip: () => void;
  isSyncing: boolean;
  lastSynced: string;
  onMenuToggle?: () => void;
}

export default function Header({
  title,
  subtitle,
  activeYear,
  setActiveYear,
  onSyncSakip,
  isSyncing,
  lastSynced,
  onMenuToggle,
}: HeaderProps) {
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const formatTime = (isoString: string) => {
    if (!isoString) return 'Belum Pernah';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <header id="app-header" className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm z-10">
      <div id="header-titles" className="flex items-center gap-3 w-full md:w-auto">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shrink-0"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 flex-1 md:flex-none">
          <h2 id="header-main-title" className="text-lg md:text-2xl font-black text-slate-800 tracking-tight truncate leading-tight">
            {title}
          </h2>
          <p id="header-sub-title" className="text-[10px] md:text-xs text-slate-500 font-medium truncate mt-0.5 md:mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div id="header-controls" className="flex flex-wrap items-center gap-3">
        {/* Year Selector replaced with permanent Badge */}
        <div id="header-year-selector" className="flex items-center gap-2 bg-[#004882]/10 border border-[#004882]/20 px-3.5 py-1.5 rounded-lg border-solid">
          <Calendar className="w-4 h-4 text-[#004882]" />
          <span className="text-xs font-black text-[#004882] uppercase tracking-wider">
            Dokumen Renstra 2025 - 2030
          </span>
        </div>

        {/* SAKIP Sync Button */}
        <div className="flex flex-col items-end gap-0.5">
          <button
            id="btn-header-sync"
            onClick={onSyncSakip}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm border border-emerald-500 tracking-wide transition-all ${
              isSyncing ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sinkron SAKIP...' : 'Sinkron SAKIP'}
          </button>
          {lastSynced && (
            <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 inline" />
              Synced: {formatDate(lastSynced)}, {formatTime(lastSynced)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
