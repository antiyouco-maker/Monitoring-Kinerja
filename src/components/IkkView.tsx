/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Target, CheckSquare, Sparkles, Save, Edit3, Trash2, Plus, Search, Calendar, Filter, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { IkkIndikator } from '../types';

interface IkkViewProps {
  ikkData: IkkIndikator[];
  onUpdateIkk: (data: IkkIndikator[]) => void;
  activeYear: number;
  triggerConfirm?: (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => void;
  triggerToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function IkkView({ ikkData, onUpdateIkk, activeYear, triggerConfirm, triggerToast }: IkkViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargets, setEditTargets] = useState<{ [key: number]: string }>({});
  const [editRealisasis, setEditRealisasis] = useState<{ [key: number]: string }>({});
  const [editNama, setEditNama] = useState<string>('');
  const [editPj, setEditPj] = useState<string>('');
  const [editSatuan, setEditSatuan] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newKode, setNewKode] = useState<string>('');
  const [newNama, setNewNama] = useState<string>('');
  const [newSatuan, setNewSatuan] = useState<string>('%');
  const [newPj, setNewPj] = useState<string>('Bidang Tanaman Pangan');
  const [newTargets, setNewTargets] = useState<{ [key: number]: string }>({
    2025: '90',
    2026: '92',
    2027: '94',
    2028: '96',
    2029: '98',
    2030: '100'
  });

  // Filters State 
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPj, setSelectedPj] = useState<string>('all');

  // Parse all unique PJ/Bidang values dynamically
  const uniquePjs = useMemo(() => {
    const list = ikkData.map((i) => i.penanggungjawab).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [ikkData]);

  // Helper: check achievement styled
  const getCapaian = (targetStr: string, realisasiStr: string) => {
    const targetVal = parseFloat(targetStr);
    const realisasiVal = parseFloat(realisasiStr);
    if (isNaN(targetVal) || isNaN(realisasiVal) || targetVal === 0) {
      return { label: '-', cls: 'text-slate-400 font-mono font-medium' };
    }
    const percent = (realisasiVal / targetVal) * 100;
    const roundedPercent = Math.round(percent * 10) / 10;
    
    let cls = 'font-mono inline-block font-bold px-2.5 py-0.5 rounded-full text-xs border ';
    if (percent >= 100) {
      cls += 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
    } else if (percent >= 90) {
      cls += 'text-blue-700 bg-blue-50 border-blue-200/50';
    } else {
      cls += 'text-amber-700 bg-amber-50 border-amber-250/50';
    }
    
    return { label: `${roundedPercent.toFixed(1)}%`, cls };
  };

  const startEdit = (item: IkkIndikator) => {
    setEditingId(item.id);
    setEditNama(item.nama);
    setEditPj(item.penanggungjawab);
    setEditSatuan(item.satuan);

    const tgts: { [key: number]: string } = {};
    const rlss: { [key: number]: string } = {};
    [2025, 2026, 2027, 2028, 2029, 2030].forEach((y) => {
      tgts[y] = item.targets && item.targets[y] !== undefined ? String(item.targets[y]) : '';
      rlss[y] = item.realisasi && item.realisasi[y] !== undefined ? String(item.realisasi[y]) : '';
    });
    setEditTargets(tgts);
    setEditRealisasis(rlss);
  };

  const saveEdit = (id: string) => {
    const updated = ikkData.map((item) => {
      if (item.id === id) {
        const parsedT = { ...item.targets };
        const parsedR = { ...item.realisasi };
        [2025, 2026, 2027, 2028, 2029, 2030].forEach((y) => {
          parsedT[y] = parseFloat(editTargets[y]) || 0;
          parsedR[y] = editRealisasis[y] !== '' ? parseFloat(editRealisasis[y]) : 0;
        });

        return {
          ...item,
          nama: editNama,
          penanggungjawab: editPj,
          satuan: editSatuan,
          targets: parsedT,
          realisasi: parsedR,
        };
      }
      return item;
    });
    onUpdateIkk(updated);
    setEditingId(null);
    if (triggerToast) {
      triggerToast('Perubahan Indikator IKK berhasil disimpan.', 'success');
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKode) return;

    const baseTargets: { [key: number]: number } = {};
    [2025, 2026, 2027, 2028, 2029, 2030].forEach((y) => {
      baseTargets[y] = parseFloat(newTargets[y]) || 0;
    });

    const newIndikator: IkkIndikator = {
      id: `IKK_${Date.now()}`,
      kode: newKode,
      nama: newNama,
      satuan: newSatuan,
      penanggungjawab: newPj,
      targets: baseTargets,
      realisasi: {
        2025: (parseFloat(newTargets[2025]) || 90) - 5,
        2026: (parseFloat(newTargets[2026]) || 92) - 2,
      },
    };

    onUpdateIkk([...ikkData, newIndikator]);
    setShowAddForm(false);
    setNewNama('');
    setNewKode('');
    if (triggerToast) {
      triggerToast('Indikator Kinerja Kegiatan baru berhasil ditambahkan.', 'success');
    }
  };

  const deleteIkk = (id: string) => {
    const targetItem = ikkData.find((i) => i.id === id);
    const itemName = targetItem ? targetItem.nama : 'Indikator ini';

    if (triggerConfirm) {
      triggerConfirm({
        title: 'Hapus Indikator Kinerja Kegiatan (IKK)',
        message: `Apakah Anda yakin ingin menghapus indikator "${itemName}" (${targetItem?.kode})? Data ini akan dihapus secara permanen.`,
        confirmText: 'Ya, Hapus',
        cancelText: 'Batalkan',
        type: 'danger',
        onConfirm: () => {
          onUpdateIkk(ikkData.filter((i) => i.id !== id));
          if (triggerToast) {
            triggerToast('Indikator IKK berhasil dihapus.', 'success');
          }
        },
      });
    } else {
      if (confirm('Apakah Anda yakin ingin menghapus Indikator Kinerja Kegiatan ini?')) {
        onUpdateIkk(ikkData.filter((i) => i.id !== id));
      }
    }
  };

  // Filtered IKK Data based on PJ, search query
  const filteredIkkData = useMemo(() => {
    return ikkData.filter((item) => {
      const matchesSearch = 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.satuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.penanggungjawab.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPj = selectedPj === 'all' || item.penanggungjawab === selectedPj;

      return matchesSearch && matchesPj;
    });
  }, [ikkData, searchQuery, selectedPj]);

  const statsYear = selectedYearFilter === 'all' ? activeYear : parseInt(selectedYearFilter);

  // Dynamic summary calculations for KPI blocks
  const stats = useMemo(() => {
    let totalCount = filteredIkkData.length;
    let metCount = 0;
    let validPairs = 0;
    const percentages: number[] = [];

    filteredIkkData.forEach((item) => {
      const tVal = item.targets[statsYear] !== undefined ? item.targets[statsYear] : NaN;
      const rVal = item.realisasi && item.realisasi[statsYear] !== undefined ? item.realisasi[statsYear] : NaN;

      if (!isNaN(tVal) && !isNaN(rVal) && tVal > 0) {
        const pct = (rVal / tVal) * 100;
        percentages.push(pct);
        validPairs++;
        if (rVal >= tVal) {
          metCount++;
        }
      }
    });

    const averageCapaian = percentages.length > 0 
      ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1) + '%' 
      : '0.0%';
    const lowestCapaian = percentages.length > 0 
      ? Math.min(...percentages).toFixed(1) + '%' 
      : '0.0%';
    const highestCapaian = percentages.length > 0 
      ? Math.max(...percentages).toFixed(1) + '%' 
      : '0.0%';

    return {
      totalCount,
      metCount,
      averageCapaian,
      lowestCapaian,
      highestCapaian,
    };
  }, [filteredIkkData, statsYear]);

  return (
    <div id="ikk-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#004882]" />
            Pemantauan Indikator Kinerja Kegiatan (IKK)
          </h3>
          <p className="text-xs text-slate-500">
            Kelola target, sasaran operasional, realisasi taktis, dan penanggungjawab IKK Dinas Ketahanan Pangan & Pertanian
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#004882] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Tambah Indikator IKK
        </button>
      </div>

      {/* Control Board Card */}
      <div id="ikk-control-panel" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left Side: Search & PJ Filter */}
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari indikator, kode, satuan..."
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004882]/20 focus:border-[#004882] transition duration-150"
              />
            </div>

            {/* PJ Filter Dropdown */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#004882]">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <select
                value={selectedPj}
                onChange={(e) => setSelectedPj(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#004882]/20 focus:border-[#004882] text-slate-700 font-medium transition duration-150"
              >
                <option value="all">Semua Bidang Pengampu</option>
                {uniquePjs.filter(pj => pj !== 'all').map((pj) => (
                  <option key={pj} value={pj}>{pj}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Side: Year Select Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Filter Tahun:
            </span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedYearFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition duration-150 ${
                  selectedYearFilter === 'all'
                    ? 'bg-[#004882] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                Semua
              </button>
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYearFilter(String(y))}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition duration-150 ${
                    selectedYearFilter === String(y)
                      ? 'bg-[#004882] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic KPI Cards to summarize selected view */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Card 1: Rata-rata Capaian */}
          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rata-rata Capaian {selectedYearFilter === 'all' ? `(${statsYear})` : `(${selectedYearFilter})`}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-emerald-700 font-mono">{stats.averageCapaian}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/30">
                  {stats.metCount} dari {stats.totalCount} IKK tuntas
                </span>
              </div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-full border border-emerald-100/30">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Card 2: Capaian Terendah */}
          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Capaian Terendah {selectedYearFilter === 'all' ? `(${statsYear})` : `(${selectedYearFilter})`}</span>
              <span className="text-lg font-black text-amber-700 font-mono">{stats.lowestCapaian}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-full border border-amber-100/30">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Card 3: Capaian Tertinggi */}
          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Capaian Tertinggi {selectedYearFilter === 'all' ? `(${statsYear})` : `(${selectedYearFilter})`}</span>
              <span className="text-lg font-black text-[#004882] font-mono">{stats.highestCapaian}</span>
            </div>
            <div className="p-2 bg-blue-50 rounded-full border border-blue-100/30">
              <Sparkles className="w-5 h-5 text-[#004882]" />
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNew} className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Indikator</label>
            <input
              type="text"
              required
              placeholder="Contoh: IKK.07"
              value={newKode}
              onChange={(e) => setNewKode(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Indikator Kinerja Kegiatan (IKK)</label>
            <input
              type="text"
              required
              placeholder="Sebutkan sasaran/indikator kegiatan..."
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Satuan Ukuran</label>
            <input
              type="text"
              required
              value={newSatuan}
              onChange={(e) => setNewSatuan(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bidang / PJ Pengampu</label>
            <input
              type="text"
              required
              value={newPj}
              onChange={(e) => setNewPj(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            />
          </div>
          
          <div className="md:col-span-3 border-t border-slate-250 pt-3">
            <span className="block text-xs font-bold text-slate-600 mb-2">Target Multi-Tahun (2025-2030)</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <div key={y}>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">{y}</label>
                  <input
                    type="text"
                    required
                    value={newTargets[y] || ''}
                    onChange={(e) => setNewTargets({ ...newTargets, [y]: e.target.value })}
                    className="w-full border border-slate-300 rounded text-center p-1 text-xs font-mono font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 shadow-sm"
            >
              Simpan Indikator
            </button>
          </div>
        </form>
      )}

      {/* Main Table for IKK Indicators */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <th className="py-3 px-4 font-bold w-16">Kode</th>
                <th className="py-3 px-4 font-bold max-w-[280px]">Indikator Kinerja Kegiatan (IKK)</th>
                <th className="py-3 px-4 font-bold w-20">Satuan</th>
                <th className="py-3 px-4 text-center font-bold w-28">Target ({statsYear})</th>
                <th className="py-3 px-4 text-center font-bold w-28">Realisasi ({statsYear})</th>
                <th className="py-3 px-4 text-center font-bold w-28">Capaian %</th>
                <th className="py-3 px-4 font-bold w-48">PJ / Bidang Pengampu</th>
                <th className="py-3 px-2 text-center font-bold w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIkkData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                      <p className="text-sm font-bold text-slate-700">Tidak ada Indikator IKK ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">Silakan sesuaikan filter pencarian atau penanggungjawab Anda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIkkData.map((item) => {
                  const isEditing = editingId === item.id;
                  
                  const targetVal = isEditing ? editTargets[statsYear] : (item.targets && item.targets[statsYear] !== undefined ? String(item.targets[statsYear]) : '');
                  const rlsVal = isEditing ? editRealisasis[statsYear] : (item.realisasi && item.realisasi[statsYear] !== undefined ? String(item.realisasi[statsYear]) : '');
                  const capaian = getCapaian(targetVal || '', rlsVal || '');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Kode */}
                      <td className="py-4 px-4 font-bold text-[#004882] font-mono">
                        <span className="bg-sky-50 text-[#004882] border border-blue-100/30 px-1.5 py-0.5 rounded text-xs">
                          {item.kode}
                        </span>
                      </td>

                      {/* Nama */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <textarea
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            rows={2}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                          />
                        ) : (
                          <div className="space-y-1 max-w-[280px]">
                            <p className="font-semibold text-slate-850 text-xs sm:text-[13px] leading-relaxed break-words">
                              {item.nama}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Satuan */}
                      <td className="py-4 px-4 text-slate-500 font-semibold font-mono text-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSatuan}
                            onChange={(e) => setEditSatuan(e.target.value)}
                            className="w-20 border border-slate-300 rounded p-1 text-xs text-center font-bold"
                          />
                        ) : (
                          item.satuan
                        )}
                      </td>

                      {/* Target */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            value={targetVal || ''}
                            onChange={(e) => setEditTargets({ ...editTargets, [statsYear]: e.target.value })}
                            className="w-20 border border-slate-300 rounded text-center p-1 text-xs font-mono bg-white font-extrabold mx-auto block"
                            placeholder="Target"
                          />
                        ) : (
                          <span className="font-mono text-xs font-bold text-blue-700">
                            {targetVal || '-'}
                          </span>
                        )}
                      </td>

                      {/* Realisasi */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            value={rlsVal || ''}
                            onChange={(e) => setEditRealisasis({ ...editRealisasis, [statsYear]: e.target.value })}
                            className="w-20 border border-slate-300 rounded text-center p-1 text-xs font-mono bg-white font-bold mx-auto block"
                            placeholder="Realisasi"
                          />
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {rlsVal !== '' ? rlsVal : '-'}
                          </span>
                        )}
                      </td>

                      {/* Capaian % */}
                      <td className="py-4 px-4 text-center">
                        <span className={capaian.cls}>{capaian.label}</span>
                      </td>

                      {/* Bidang PJ */}
                      <td className="py-4 px-4 text-slate-650">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPj}
                            onChange={(e) => setEditPj(e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs font-sans text-slate-700"
                          />
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-[11px] bg-slate-150 text-slate-600 border border-slate-200/50 rounded-lg font-semibold whitespace-normal leading-tight">
                            {item.penanggungjawab}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-2 text-center">
                        {isEditing ? (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="p-1 px-2 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-xs w-full"
                              title="Simpan"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan</span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 px-2 bg-slate-500 text-white rounded text-[11px] font-bold hover:bg-slate-650 transition flex items-center justify-center gap-1 shadow-xs w-full"
                              title="Batal"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 hover:text-[#004882] rounded-lg transition"
                              title="Ubah data target & realisasi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteIkk(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                              title="Hapus indikator"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Intelligence Card */}
      <div className="bg-blue-50/50 rounded-xl border border-blue-200 p-5 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-[#004882] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-800">Analisis Kinerja Operasional (IKK)</h4>
          <p className="text-xs text-blue-700 leading-relaxed mt-1">
            Indikator Kinerja Kegiatan (IKK) memberikan peta pencapaian yang bersifat taktis-operasional atas setiap program kerja dinas.
            Seluruh data IKK diklasifikasikan berdasarkan sasaran strategis, memastikan kontribusi konkret dari sub-kegiatan dan seksi-seksi teknis dalam mendukung RKPD Kabupaten Indramayu.
          </p>
        </div>
      </div>
    </div>
  );
}
