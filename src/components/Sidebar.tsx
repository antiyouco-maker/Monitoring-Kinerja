/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutGrid, TrendingUp, CheckSquare, GitBranch, BarChart2, FileText, RefreshCw, Database, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickReset?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onQuickReset, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'iku', label: 'Monitoring IKU', icon: TrendingUp },
    { id: 'ikk', label: 'Monitoring IKK', icon: CheckSquare },
    { id: 'cascading', label: 'Cascading Kinerja', icon: GitBranch },
    { id: 'database', label: 'Database Renstra', icon: Database },
    { id: 'charts', label: 'Grafik Kinerja', icon: BarChart2 },
    { id: 'reports', label: 'Laporan', icon: FileText },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      id="app-sidebar" 
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#004882] text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div id="sidebar-header" className="p-6 border-b border-white/10 bg-[#003b6e] flex justify-between items-center relative">
        <div className="flex flex-col gap-1">
          <h1 id="sidebar-brand-title" className="text-xl font-extrabold tracking-wider leading-tight text-white flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-xs font-black">DKPP</span>
            INDRAMAYU
          </h1>
          <p id="sidebar-brand-sub" className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
            Kabupaten Indramayu
          </p>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-white/10 text-blue-250 hover:text-white rounded-lg transition-colors"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav id="sidebar-nav" className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`btn-menu-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-250 group ${
                isActive
                  ? 'bg-white/15 text-white border-l-4 border-amber-400 font-semibold shadow-inner'
                  : 'text-blue-100 hover:bg-white/5 hover:text-white'
              }`}
            >
              <IconComponent 
                id={`icon-menu-${item.id}`} 
                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-amber-400 scale-105' : 'text-blue-200'
                }`} 
              />
              <span id={`label-menu-${item.id}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with system utilities */}
      <div id="sidebar-footer" className="p-4 border-t border-white/10 bg-[#003b6e]/40 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-blue-200">
          <span>Database State</span>
          <span className="bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
            Lokal
          </span>
        </div>
        {onQuickReset && (
          <button
            id="btn-sidebar-reset"
            onClick={onQuickReset}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-red-600/20 hover:bg-red-600 hover:text-white rounded text-xs text-red-300 border border-red-500/30 transition-all font-medium py-1.5"
            title="Reset storage to initial state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Data Default
          </button>
        )}
      </div>
    </div>
  );
}
