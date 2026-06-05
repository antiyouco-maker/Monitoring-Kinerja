/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Sparkles, Save, Edit3, Trash2, Plus, Link as LinkIcon, RefreshCw, Search, Calendar, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { IkuIndikator, Sasaran } from '../types';

interface IkuViewProps {
  ikuData: IkuIndikator[];
  onUpdateIku: (data: IkuIndikator[]) => void;
  sasaranDb: Sasaran[];
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

export default function IkuView({ ikuData, onUpdateIku, sasaranDb, activeYear, triggerConfirm, triggerToast }: IkuViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargets, setEditTargets] = useState<{ [key: number]: string }>({});
  const [editRealisasis, setEditRealisasis] = useState<{ [key: number]: string }>({});
  const [editNama, setEditNama] = useState<string>('');
  const [editPj, setEditPj] = useState<string>('');
  const [editSatuan, setEditSatuan] = useState<string>('');
  const [editSasaranIndikatorId, setEditSasaranIndikatorId] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newKode, setNewKode] = useState<string>('');
  const [newNama, setNewNama] = useState<string>('');
  const [newSatuan, setNewSatuan] = useState<string>('Skor');
  const [newPj, setNewPj] = useState<string>('Bidang Ketahanan Pangan');
  const [newSasaranIndikatorId, setNewSasaranIndikatorId] = useState<string>('');
  const [newTargets, setNewTargets] = useState<{ [key: number]: string }>({
    2025: '95.0', 
    2026: '95.2', 
    2027: '95.4', 
    2028: '95.6', 
    2029: '95.8', 
    2030: '96.0'
  });

  // Year filter, search query, and Bidang/PJ filter state variables
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPj, setSelectedPj] = useState<string>('all');

  // Parse all unique PJ/Bidang values dynamically
  const uniquePjs = useMemo(() => {
    const list = ikuData.map(i => i.penanggungjawab).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [ikuData]);

  // Helper: Find linked sasaran target or local fallback
  const getIkuTargetForYear = (item: IkuIndikator, year: number): string => {
    if (item.sasaranIndikatorId) {
      for (const sas of sasaranDb || []) {
        const ind = (sas.indikatorList || []).find((i) => i.id === item.sasaranIndikatorId);
        if (ind) {
          const key = `target${year}` as keyof typeof ind;
          if (ind[key]) return String(ind[key]);
        }
      }
    }
    return item.targets && item.targets[year] !== undefined ? String(item.targets[year]) : '-';
  };

  // Helper: Find connection info
  const getSasaranConnectionInfo = (item: IkuIndikator) => {
    if (!item.sasaranIndikatorId) return null;
    for (const sas of sasaranDb || []) {
      const ind = (sas.indikatorList || []).find((i) => i.id === item.sasaranIndikatorId);
      if (ind) {
        return {
          sasaranNama: sas.nama,
          indikatorNama: ind.indikator,
        };
      }
    }
    return null;
  };

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

  const startEdit = (item: IkuIndikator) => {
    setEditingId(item.id);
    setEditNama(item.nama);
    setEditPj(item.penanggungjawab);
    setEditSatuan(item.satuan);
    setEditSasaranIndikatorId(item.sasaranIndikatorId || '');

    const tgts: { [key: number]: string } = {};
    const rlss: { [key: number]: string } = {};
    [2025, 2026, 2027, 2028, 2029, 2030].forEach((y) => {
      tgts[y] = getIkuTargetForYear(item, y);
      rlss[y] = item.realisasi && item.realisasi[y] !== undefined ? String(item.realisasi[y]) : '';
    });
    setEditTargets(tgts);
    setEditRealisasis(rlss);
  };

  const saveEdit = (id: string) => {
    const updated = ikuData.map((item) => {
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
          sasaranIndikatorId: editSasaranIndikatorId || undefined,
        };
      }
      return item;
    });
    onUpdateIku(updated);
    setEditingId(null);
    if (triggerToast) {
      triggerToast('Perubahan Indikator IKU berhasil disimpan.', 'success');
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKode) return;

    const parsedTargets: { [key: number]: number } = {};
    [2025, 2026, 2027, 2028, 2029, 2030].forEach((y) => {
      parsedTargets[y] = parseFloat(newTargets[y]) || 0;
    });

    const newIndikator: IkuIndikator = {
      id: `IKU_${Date.now()}`,
      kode: newKode,
      nama: newNama,
      satuan: newSatuan,
      penanggungjawab: newPj,
      targets: parsedTargets,
      realisasi: {
        2025: (parseFloat(newTargets[2025]) || 95) - 0.2,
        2026: (parseFloat(newTargets[2026]) || 95) - 0.1,
      },
      sasaranIndikatorId: newSasaranIndikatorId || undefined,
    };

    onUpdateIku([...ikuData, newIndikator]);
    setShowAddForm(false);
    setNewNama('');
    setNewKode('');
    setNewSasaranIndikatorId('');
    if (triggerToast) {
      triggerToast('Indikator Kinerja Utama baru berhasil ditambahkan.', 'success');
    }
  };

  const deleteIku = (id: string) => {
    const targetItem = ikuData.find((i) => i.id === id);
    const itemName = targetItem ? targetItem.nama : 'Indikator ini';

    if (triggerConfirm) {
      triggerConfirm({
        title: 'Hapus Indikator Kinerja Utama (IKU)',
        message: `Apakah Anda yakin ingin menghapus indikator "${itemName}" (${targetItem?.kode})? Data ini akan dihapus secara permanen.`,
        confirmText: 'Ya, Hapus',
        cancelText: 'Batalkan',
        type: 'danger',
        onConfirm: () => {
          onUpdateIku(ikuData.filter((i) => i.id !== id));
          if (triggerToast) {
            triggerToast('Indikator IKU berhasil dihapus.', 'success');
          }
        },
      });
    } else {
      if (confirm('Apakah Anda yakin ingin menghapus Indikator Kinerja Utama ini?')) {
        onUpdateIku(ikuData.filter((i) => i.id !== id));
      }
    }
  };

  // Filtered IKU Data based on PJ, search query and active tab
  const filteredIkuData = useMemo(() => {
    return ikuData.filter((item) => {
      const matchesSearch = 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.satuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.penanggungjawab.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPj = selectedPj === 'all' || item.penanggungjawab === selectedPj;

      return matchesSearch && matchesPj;
    });
  }, [ikuData, searchQuery, selectedPj]);

  const yearsList = [2025, 2026, 2027, 2028, 2029, 2030];
  const visibleYears = selectedYearFilter === 'all' 
    ? yearsList 
    : [parseInt(selectedYearFilter)];

  // Stats calculations for the selected year (or activeYear if 'all')
  const statsYear = selectedYearFilter === 'all' ? activeYear : parseInt(selectedYearFilter);
  
  const stats = useMemo(() => {
    let totalCount = filteredIkuData.length;
    let metCount = 0;
    let validPairs = 0;

    let totalCapaianPct = 0;
    let maxCapaian = -1;
    let minCapaian = 999999;
    
    let maxCapaianItem: IkuIndikator | null = null;
    let minCapaianItem: IkuIndikator | null = null;

    filteredIkuData.forEach((item) => {
      const tStr = getIkuTargetForYear(item, statsYear);
      const rStr = item.realisasi && item.realisasi[statsYear] !== undefined ? String(item.realisasi[statsYear]) : '';
      
      const tVal = parseFloat(tStr);
      const rVal = parseFloat(rStr);

      if (!isNaN(tVal) && !isNaN(rVal) && tVal > 0) {
        const pct = (rVal / tVal) * 100;
        totalCapaianPct += pct;
        validPairs++;

        if (pct > maxCapaian) {
          maxCapaian = pct;
          maxCapaianItem = item;
        }
        if (pct < minCapaian) {
          minCapaian = pct;
          minCapaianItem = item;
        }

        if (rVal >= tVal) {
          metCount++;
        }
      }
    });

    const averageCapaian = validPairs > 0 ? (totalCapaianPct / validPairs) : 0;
    const peakCapaian = maxCapaian >= 0 ? maxCapaian : 0;
    const floorCapaian = minCapaian !== 999999 ? minCapaian : 0;

    return {
      totalCount,
      metCount,
      validPairs,
      averageCapaian,
      peakCapaian,
      floorCapaian,
      maxCapaianItem,
      minCapaianItem,
    };
  }, [filteredIkuData, statsYear, sasaranDb]);

  return (
    <div id="iku-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#004882]" />
            Dokumen Indikator Kinerja Utama (IKU) 2025-2030
          </h3>
          <p className="text-xs text-slate-500">
            Pemantauan target terintegrasi Sasaran Renstra beserta realisasi pencapaian Dinas Ketahanan Pangan & Pertanian
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#004882] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Indikator IKU
        </button>
      </div>

      {/* Control Board Card */}
      <div id="iku-control-panel" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
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
          {/* Card 1: RATA-RATA PERSENTASE CAPAIAN IKU */}
          <div
            id="iku-card-ketercapaian"
            className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/30 flex items-center justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 transform border-l-4 border-l-emerald-500 hover:border-l-emerald-600"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                Rata-Rata Persentase Capaian IKU {selectedYearFilter === 'all' ? `(${statsYear})` : `(${selectedYearFilter})`}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {stats.averageCapaian.toFixed(1)}%
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {stats.metCount} dari {stats.validPairs} Tercapai
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 truncate">
                Rerata rasio realisasi berbanding target kinerja
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 ring-4 ring-emerald-50 text-emerald-600 rounded-xl shrink-0 ml-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: CAPAIAN IKU TERTINGGI */}
          <div
            id="iku-card-tar-rata"
            className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/30 flex items-center justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 transform border-l-4 border-l-blue-500 hover:border-l-blue-600"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                Capaian IKU Tertinggi {selectedYearFilter === 'all' ? `(${statsYear})` : `(${selectedYearFilter})`}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#004882] font-mono leading-none">
                  {stats.peakCapaian.toFixed(1)}%
                </span>
                {stats.maxCapaianItem && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 font-mono truncate max-w-[120px]">
                    {stats.maxCapaianItem.kode}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-400 truncate animate-pulse" title={stats.maxCapaianItem?.nama || '-'}>
                {stats.maxCapaianItem ? stats.maxCapaianItem.nama : '-'}
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 border border-blue-100 ring-4 ring-blue-50 text-blue-600 rounded-xl shrink-0 ml-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          {/* Card 3: CAPAIAN IKU TERENDAH */}
          <div
            id="iku-card-rls-rata"
            className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/30 flex items-center justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 transform border-l-4 border-l-amber-500 hover:border-l-amber-600"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                Capaian IKU Terendah {selectedYearFilter === 'all' ? `(${statsYear})` : `(${selectedYearFilter})`}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 font-mono leading-none">
                  {stats.floorCapaian.toFixed(1)}%
                </span>
                {stats.minCapaianItem && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono truncate max-w-[120px]">
                    {stats.minCapaianItem.kode}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-400 truncate" title={stats.minCapaianItem?.nama || '-'}>
                {stats.minCapaianItem ? stats.minCapaianItem.nama : '-'}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-100 ring-4 ring-amber-50 text-amber-500 rounded-xl shrink-0 ml-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {showAddForm && (
        <form onSubmit={handleAddNew} className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Indikator</label>
            <input
              type="text"
              required
              placeholder="Contoh: IKU.08"
              value={newKode}
              onChange={(e) => setNewKode(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white font-mono uppercase"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-[#004882] uppercase tracking-wider mb-1">
              Hubungkan Sasaran Renstra (Ambil Target Otomatis)
            </label>
            <select
              value={newSasaranIndikatorId}
              onChange={(e) => {
                const val = e.target.value;
                setNewSasaranIndikatorId(val);
                if (val) {
                  let matchedInd: any = null;
                  for (const sas of sasaranDb || []) {
                    const found = (sas.indikatorList || []).find((i) => i.id === val);
                    if (found) {
                      matchedInd = found;
                      break;
                    }
                  }
                  if (matchedInd) {
                    setNewNama(matchedInd.indikator);
                    setNewTargets({
                      2025: matchedInd.target2025 || matchedInd.target || '',
                      2026: matchedInd.target2026 || matchedInd.target || '',
                      2027: matchedInd.target2027 || matchedInd.target || '',
                      2028: matchedInd.target2028 || matchedInd.target || '',
                      2029: matchedInd.target2029 || matchedInd.target || '',
                      2030: matchedInd.target2030 || matchedInd.target || '',
                    });
                  }
                }
              }}
              className="w-full text-xs border border-[#004882]/35 rounded p-2 bg-white font-semibold text-slate-700 focus:outline-[#004882]"
            >
              <option value="">- Input Manual (Tanpa Hubungan Ke Sasaran Renstra) -</option>
              {sasaranDb.map((sas) => (
                <optgroup key={sas.id} label={`[${sas.kode}] ${sas.nama.substring(0, 50)}...`}>
                  {(sas.indikatorList || []).map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      ↳ {ind.indikator.substring(0, 75)}...
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Indikator Kinerja Utama (IKU)</label>
            <input
              type="text"
              required
              placeholder="Sebutkan sasaran/indikasi utama..."
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Satuan Ukuran</label>
            <input
              type="text"
              required
              value={newSatuan}
              onChange={(e) => setNewSatuan(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bidang / PJ Pengampu</label>
            <input
              type="text"
              required
              value={newPj}
              onChange={(e) => setNewPj(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            />
          </div>

          {/* targets input for 6 years */}
          <div className="md:col-span-3 border-t border-slate-200 pt-4 mt-2">
            <span className="block text-[11px] font-extrabold text-[#004882] uppercase mb-3">Targets Tahunan 2025 - 2030:</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <div key={y}>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1 text-center">Tahun {y}</label>
                  <input
                    type="text"
                    disabled={!!newSasaranIndikatorId}
                    required
                    value={newTargets[y] || ''}
                    onChange={(e) => setNewTargets({ ...newTargets, [y]: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded p-2 text-center bg-white font-mono disabled:bg-slate-100 disabled:text-slate-500 font-extrabold"
                    placeholder="Nilai"
                  />
                </div>
              ))}
            </div>
            {newSasaranIndikatorId && (
              <p className="text-[10px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Target dikunci & sinkron dengan Sasaran Renstra yang dipilih.
              </p>
            )}
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded animate-fade-in"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-[#004882] text-white font-bold rounded hover:bg-blue-800 shadow-sm transition"
            >
              Simpan Indikator
            </button>
          </div>
        </form>
      )}      {/* Main Table for IKU Indicators */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <th className="py-3 px-4 font-bold w-16">Kode</th>
                <th className="py-3 px-4 font-bold max-w-[280px]">Indikator Kinerja Utama (IKU) / Hubungan Renstra</th>
                <th className="py-3 px-4 font-bold w-20">Satuan</th>
                <th className="py-3 px-4 text-center font-bold w-28">Target ({statsYear})</th>
                <th className="py-3 px-4 text-center font-bold w-28">Realisasi ({statsYear})</th>
                <th className="py-3 px-4 text-center font-bold w-28">Capaian %</th>
                <th className="py-3 px-4 font-bold w-48">PJ / Bidang Pengampu</th>
                <th className="py-3 px-2 text-center font-bold w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIkuData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                      <p className="text-sm font-bold text-slate-700">Tidak ada Indikator IKU ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">Gunakan kata kunci atau penanggung jawab yang berbeda, atau atur ulang filter Anda.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedPj('all');
                          setSelectedYearFilter('all');
                        }}
                        className="mt-4 px-4 py-1.5 bg-[#004882] hover:bg-blue-800 text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                      >
                        Reset Pencarian
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIkuData.map((item) => {
                  const isEditing = editingId === item.id;
                  const conn = getSasaranConnectionInfo(item);
                  
                  const targetVal = isEditing ? editTargets[statsYear] : getIkuTargetForYear(item, statsYear);
                  const rlsVal = isEditing ? editRealisasis[statsYear] : item.realisasi && item.realisasi[statsYear] !== undefined ? String(item.realisasi[statsYear]) : '';
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
                      <td className="py-4 px-4 max-w-[280px]">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editNama}
                              onChange={(e) => setEditNama(e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                              rows={2}
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Hubungkan Sasaran Renstra (Auto-Target):</span>
                              <select
                                value={editSasaranIndikatorId || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditSasaranIndikatorId(val);
                                  if (val) {
                                    let foundTgtObj: any = null;
                                    for (const sas of sasaranDb || []) {
                                      const matched = (sas.indikatorList || []).find((ind) => ind.id === val);
                                      if (matched) {
                                        foundTgtObj = matched;
                                        break;
                                      }
                                    }
                                    if (foundTgtObj) {
                                      setEditTargets({
                                        2025: foundTgtObj.target2025 || foundTgtObj.target || '',
                                        2026: foundTgtObj.target2026 || foundTgtObj.target || '',
                                        2027: foundTgtObj.target2027 || foundTgtObj.target || '',
                                        2028: foundTgtObj.target2028 || foundTgtObj.target || '',
                                        2029: foundTgtObj.target2029 || foundTgtObj.target || '',
                                        2030: foundTgtObj.target2030 || foundTgtObj.target || '',
                                      });
                                      if (!editNama) {
                                        setEditNama(foundTgtObj.indikator);
                                      }
                                    }
                                  }
                                }}
                                className="w-full text-xs border border-slate-200 rounded p-1 font-medium bg-slate-50 text-slate-700"
                              >
                                <option value="">- Input Manual (Tanpa Sambungan) -</option>
                                {sasaranDb.map((sas) => (
                                  <optgroup key={sas.id} label={`[${sas.kode}] ${sas.nama.substring(0, 40)}...`}>
                                    {(sas.indikatorList || []).map((ind) => (
                                      <option key={ind.id} value={ind.id}>
                                        ↳ {ind.indikator.substring(0, 50)}...
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-relaxed">{item.nama}</p>
                            {conn ? (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/30 w-fit">
                                <LinkIcon className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                <span>Sasaran Renstra: {conn.indikatorNama.substring(0, 40)}...</span>
                              </div>
                            ) : (
                              <span className="text-[9.5px] uppercase font-bold text-slate-400 mt-1 block">Tipe Target: Manual</span>
                            )}
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
                            disabled={!!editSasaranIndikatorId}
                            value={targetVal || ''}
                            onChange={(e) => setEditTargets({ ...editTargets, [statsYear]: e.target.value })}
                            className="w-20 border border-slate-300 rounded text-center p-1 text-xs font-mono bg-white disabled:bg-slate-100 disabled:text-slate-400 font-extrabold mx-auto block"
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
                            {rlsVal || '-'}
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
                            className="w-full border border-slate-300 rounded p-1 text-xs"
                          />
                        ) : (
                          <span className="text-[10.5px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded font-bold uppercase tracking-wide">
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
                            >
                              <Save className="w-3 h-3" />
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 px-2 text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] w-full"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit target dan realisasi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteIku(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Hapus indikator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-5 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Prinsip Sinkronisasi Sasaran Renstra & IKU</h4>
          <p className="text-xs text-amber-700 leading-relaxed mt-1">
            Indikator Kinerja Utama (IKU) di atas telah disesuaikan langsung dengan dokumen jangka panjang Renstra <strong>2025-2030</strong>. 
            Menghubungkan IKU dengan Sasaran Renstra mengunci nilai target tahunan secara otomatis yang akan diperbarui secara real-time apabila database Renstra berubah.
          </p>
        </div>
      </div>
    </div>
  );
}
