/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Search, 
  HelpCircle,
  FolderTree,
  FileSpreadsheet,
  Link2,
  Calendar,
  Users
} from 'lucide-react';
import { Tujuan, Sasaran, Program, Kegiatan, SubKegiatan, PPTK, IndikatorTarget } from '../types';

interface DatabaseSakipViewProps {
  tujuanDb: Tujuan[];
  sasaranDb: Sasaran[];
  programDb: Program[];
  kegiatanDb: Kegiatan[];
  subKegiatanDb: SubKegiatan[];
  pptkDb?: PPTK[];
  
  onUpdateTujuan: (data: Tujuan[]) => void;
  onUpdateSasaran: (data: Sasaran[]) => void;
  onUpdateProgram: (data: Program[]) => void;
  onUpdateKegiatan: (data: Kegiatan[]) => void;
  onUpdateSubKegiatan: (data: SubKegiatan[]) => void;
  onUpdatePPTK?: (data: PPTK[]) => void;
  
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

type ModeType = 'tujuan' | 'sasaran' | 'program' | 'kegiatan' | 'sub_kegiatan' | 'pptk';

export default function DatabaseSakipView({
  tujuanDb,
  sasaranDb,
  programDb,
  kegiatanDb,
  subKegiatanDb,
  pptkDb = [],
  onUpdateTujuan,
  onUpdateSasaran,
  onUpdateProgram,
  onUpdateKegiatan,
  onUpdateSubKegiatan,
  onUpdatePPTK,
  triggerConfirm,
  triggerToast
}: DatabaseSakipViewProps) {
  const [currentSubTab, setCurrentSubTab] = useState<ModeType>('tujuan');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newIndikator, setNewIndikator] = useState('');
  const [newTarget, setNewTarget] = useState('');
  
  // Year-specific target fields for 2025-2030
  const [newTarget2025, setNewTarget2025] = useState('');
  const [newTarget2026, setNewTarget2026] = useState('');
  const [newTarget2027, setNewTarget2027] = useState('');
  const [newTarget2028, setNewTarget2028] = useState('');
  const [newTarget2029, setNewTarget2029] = useState('');
  const [newTarget2030, setNewTarget2030] = useState('');

  const [newIndikatorList, setNewIndikatorList] = useState<IndikatorTarget[]>([]);
  const [parentSelectionId, setParentSelectionId] = useState('');
  const [newPptkId, setNewPptkId] = useState('');

  // PPTK Specific Add Form states
  const [newPptkNama, setNewPptkNama] = useState('');
  const [newPptkNip, setNewPptkNip] = useState('');
  const [newPptkJabatan, setNewPptkJabatan] = useState('');
  const [newPptkBidang, setNewPptkBidang] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKode, setEditKode] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editIndikator, setEditIndikator] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editIndikatorList, setEditIndikatorList] = useState<IndikatorTarget[]>([]);
  const [editParentId, setEditParentId] = useState('');
  const [editPptkId, setEditPptkId] = useState('');

  // PPTK Specific Edit states
  const [editPptkNama, setEditPptkNama] = useState('');
  const [editPptkNip, setEditPptkNip] = useState('');
  const [editPptkJabatan, setEditPptkJabatan] = useState('');
  const [editPptkBidang, setEditPptkBidang] = useState('');

  // Helper helper
  const getIndikatorList = (item: any): IndikatorTarget[] => {
    if (item.indikatorList && item.indikatorList.length > 0) {
      return item.indikatorList;
    }
    if (item.indikator) {
      return [{ 
        id: '0', 
        indikator: item.indikator, 
        target: item.target || '',
        target2025: item.target || '-',
        target2026: item.target || '-',
        target2027: item.target || '-',
        target2028: item.target || '-',
        target2029: item.target || '-',
        target2030: item.target || '-'
      }];
    }
    return [];
  };

  // Reset form helper
  const resetForm = () => {
    setNewKode('');
    setNewNama('');
    setNewIndikator('');
    setNewTarget('');
    setNewTarget2025('');
    setNewTarget2026('');
    setNewTarget2027('');
    setNewTarget2028('');
    setNewTarget2029('');
    setNewTarget2030('');
    setNewIndikatorList([]);
    setParentSelectionId('');
    setNewPptkId('');
    
    // Reset PPTK fields
    setNewPptkNama('');
    setNewPptkNip('');
    setNewPptkJabatan('');
    setNewPptkBidang('');
    
    setShowAddForm(false);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentSubTab === 'pptk') {
      if (!newPptkNama.trim() || !newPptkNip.trim() || !newPptkJabatan.trim() || !newPptkBidang.trim()) {
        triggerToast?.('Semua kolom data PPTK/Pejabat wajib diisi!', 'error');
        return;
      }
      const newPptk: PPTK = {
        id: `PPTK_${Date.now()}`,
        nama: newPptkNama.trim(),
        nip: newPptkNip.trim(),
        jabatan: newPptkJabatan.trim(),
        bidang: newPptkBidang.trim()
      };
      onUpdatePPTK?.([...pptkDb, newPptk]);
      triggerToast?.('Pejabat / PPTK baru berhasil ditambahkan.', 'success');
      resetForm();
      return;
    }

    if (!newKode.trim() || !newNama.trim()) {
      triggerToast?.('Kode dan Nama harus diisi!', 'error');
      return;
    }

    const trimmedKode = newKode.trim();
    const trimmedNama = newNama.trim();

    // Compile multiple indicators
    const finalIndicatorList = [...newIndikatorList];
    if (newIndikator.trim()) {
      finalIndicatorList.push({
        id: `IND_${Date.now()}`,
        indikator: newIndikator.trim(),
        target: newTarget2026.trim() || newTarget.trim() || '-',
        target2025: newTarget2025.trim() || '-',
        target2026: newTarget2026.trim() || '-',
        target2027: newTarget2027.trim() || '-',
        target2028: newTarget2028.trim() || '-',
        target2029: newTarget2029.trim() || '-',
        target2030: newTarget2030.trim() || '-'
      });
    }

    const primaryIndikator = finalIndicatorList.length > 0 ? finalIndicatorList[0].indikator : '';
    const primaryTarget = finalIndicatorList.length > 0 ? (finalIndicatorList[0].target2026 || finalIndicatorList[0].target || '') : '';

    if (currentSubTab === 'tujuan') {
      const exists = tujuanDb.some((t) => t.kode.toLowerCase() === trimmedKode.toLowerCase());
      if (exists) {
        triggerToast?.('Kode Tujuan sudah ada!', 'error');
        return;
      }
      const newRecord: Tujuan = {
        id: `T_${Date.now()}`,
        kode: trimmedKode,
        nama: trimmedNama,
        indikator: primaryIndikator,
        target: primaryTarget,
        indikatorList: finalIndicatorList,
        pptkId: newPptkId || undefined
      };
      onUpdateTujuan([...tujuanDb, newRecord]);
      triggerToast?.('Tujuan Strategis baru berhasil ditambahkan.', 'success');
    } else if (currentSubTab === 'sasaran') {
      if (!parentSelectionId) {
        triggerToast?.('Harap pilih Hubungan dengan Tujuan Strategis!', 'error');
        return;
      }
      const exists = sasaranDb.some((s) => s.kode.toLowerCase() === trimmedKode.toLowerCase());
      if (exists) {
        triggerToast?.('Kode Sasaran sudah ada!', 'error');
        return;
      }
      const newRecord: Sasaran = {
        id: `S_${Date.now()}`,
        tujuanId: parentSelectionId,
        kode: trimmedKode,
        nama: trimmedNama,
        indikator: primaryIndikator,
        target: primaryTarget,
        indikatorList: finalIndicatorList,
        pptkId: newPptkId || undefined
      };
      onUpdateSasaran([...sasaranDb, newRecord]);
      triggerToast?.('Sasaran Rencana baru berhasil ditambahkan.', 'success');
    } else if (currentSubTab === 'program') {
      if (!parentSelectionId) {
        triggerToast?.('Harap pilih Hubungan dengan Sasaran Rencana!', 'error');
        return;
      }
      const exists = programDb.some((p) => p.kode.toLowerCase() === trimmedKode.toLowerCase());
      if (exists) {
        triggerToast?.('Kode Program sudah ada!', 'error');
        return;
      }
      const newRecord: Program = {
        id: `P_${Date.now()}`,
        sasaranId: parentSelectionId,
        kode: trimmedKode,
        nama: trimmedNama,
        indikator: primaryIndikator,
        target: primaryTarget,
        indikatorList: finalIndicatorList,
        pptkId: newPptkId || undefined
      };
      onUpdateProgram([...programDb, newRecord]);
      triggerToast?.('Program Kerja baru berhasil ditambahkan.', 'success');
    } else if (currentSubTab === 'kegiatan') {
      if (!parentSelectionId) {
        triggerToast?.('Harap pilih Hubungan dengan Program Kerja!', 'error');
        return;
      }
      const exists = kegiatanDb.some((k) => k.kode.toLowerCase() === trimmedKode.toLowerCase());
      if (exists) {
        triggerToast?.('Kode Kegiatan sudah ada!', 'error');
        return;
      }
      const newRecord: Kegiatan = {
        id: `K_${Date.now()}`,
        programId: parentSelectionId,
        kode: trimmedKode,
        nama: trimmedNama,
        indikator: primaryIndikator,
        target: primaryTarget,
        indikatorList: finalIndicatorList,
        pptkId: newPptkId || undefined
      };
      onUpdateKegiatan([...kegiatanDb, newRecord]);
      triggerToast?.('Kegiatan baru berhasil ditambahkan.', 'success');
    } else if (currentSubTab === 'sub_kegiatan') {
      if (!parentSelectionId) {
        triggerToast?.('Harap pilih Hubungan dengan Kegiatan Kerja!', 'error');
        return;
      }
      const exists = subKegiatanDb.some((sk) => sk.kode.toLowerCase() === trimmedKode.toLowerCase());
      if (exists) {
        triggerToast?.('Kode Sub Kegiatan sudah ada!', 'error');
        return;
      }
      const newRecord: SubKegiatan = {
        id: `SK_${Date.now()}`,
        kegiatanId: parentSelectionId,
        kode: trimmedKode,
        nama: trimmedNama,
        indikator: primaryIndikator,
        target: primaryTarget,
        indikatorList: finalIndicatorList,
        pptkId: newPptkId || undefined
      };
      onUpdateSubKegiatan([...subKegiatanDb, newRecord]);
      triggerToast?.('Sub Kegiatan baru berhasil ditambahkan ke database.', 'success');
    }

    resetForm();
  };

  const startEdit = (item: any, parentId: string = '') => {
    setEditingId(item.id);
    
    if (currentSubTab === 'pptk') {
      setEditPptkNama(item.nama);
      setEditPptkNip(item.nip);
      setEditPptkJabatan(item.jabatan);
      setEditPptkBidang(item.bidang);
      return;
    }

    setEditKode(item.kode);
    setEditNama(item.nama);
    setEditParentId(parentId);
    setEditPptkId(item.pptkId || '');
    setEditIndikator(item.indikator || '');
    setEditTarget(item.target || '');
    
    // Set up editIndikatorList
    const list = getIndikatorList(item);
    setEditIndikatorList(list.map(x => ({ ...x })));
  };

  const saveEdit = (id: string) => {
    if (currentSubTab === 'pptk') {
      if (!editPptkNama.trim() || !editPptkNip.trim() || !editPptkJabatan.trim() || !editPptkBidang.trim()) {
        triggerToast?.('Seluruh kolom data PPTK/Pejabat tidak boleh kosong!', 'error');
        return;
      }
      const updated = pptkDb.map((p) => (p.id === id ? {
        ...p,
        nama: editPptkNama.trim(),
        nip: editPptkNip.trim(),
        jabatan: editPptkJabatan.trim(),
        bidang: editPptkBidang.trim()
      } : p));
      onUpdatePPTK?.(updated);
      triggerToast?.('Data Pejabat / PPTK berhasil diperbarui.', 'success');
      setEditingId(null);
      return;
    }

    if (!editKode.trim() || !editNama.trim()) {
      triggerToast?.('Kode dan Nama tidak boleh kosong!', 'error');
      return;
    }

    const trimmedKode = editKode.trim();
    const trimmedNama = editNama.trim();

    // Clean up empty indicators
    const cleanedList: IndikatorTarget[] = editIndikatorList
      .filter((x) => x.indikator.trim() !== '')
      .map((x) => ({ 
        id: x.id, 
        indikator: x.indikator.trim(), 
        target: x.target2026?.trim() || x.target?.trim() || '-',
        target2025: x.target2025?.trim() || '-',
        target2026: x.target2026?.trim() || '-',
        target2027: x.target2027?.trim() || '-',
        target2028: x.target2028?.trim() || '-',
        target2029: x.target2029?.trim() || '-',
        target2030: x.target2030?.trim() || '-'
      }));

    const primaryIndikator = cleanedList.length > 0 ? cleanedList[0].indikator : '';
    const primaryTarget = cleanedList.length > 0 ? (cleanedList[0].target2026 || cleanedList[0].target || '') : '';

    if (currentSubTab === 'tujuan') {
      const updated = tujuanDb.map((t) => (t.id === id ? { ...t, kode: trimmedKode, nama: trimmedNama, indikator: primaryIndikator, target: primaryTarget, indikatorList: cleanedList, pptkId: editPptkId || undefined } : t));
      onUpdateTujuan(updated);
      triggerToast?.('Tujuan Strategis berhasil diperbarui.', 'success');
    } else if (currentSubTab === 'sasaran') {
      if (!editParentId) return;
      const updated = sasaranDb.map((s) => (s.id === id ? { ...s, tujuanId: editParentId, kode: trimmedKode, nama: trimmedNama, indikator: primaryIndikator, target: primaryTarget, indikatorList: cleanedList, pptkId: editPptkId || undefined } : s));
      onUpdateSasaran(updated);
      triggerToast?.('Sasaran Rencana berhasil diperbarui.', 'success');
    } else if (currentSubTab === 'program') {
      if (!editParentId) return;
      const updated = programDb.map((p) => (p.id === id ? { ...p, sasaranId: editParentId, kode: trimmedKode, nama: trimmedNama, indikator: primaryIndikator, target: primaryTarget, indikatorList: cleanedList, pptkId: editPptkId || undefined } : p));
      onUpdateProgram(updated);
      triggerToast?.('Program Kerja berhasil diperbarui.', 'success');
    } else if (currentSubTab === 'kegiatan') {
      if (!editParentId) return;
      const updated = kegiatanDb.map((k) => (k.id === id ? { ...k, programId: editParentId, kode: trimmedKode, nama: trimmedNama, indikator: primaryIndikator, target: primaryTarget, indikatorList: cleanedList, pptkId: editPptkId || undefined } : k));
      onUpdateKegiatan(updated);
      triggerToast?.('Kegiatan berhasil diperbarui.', 'success');
    } else if (currentSubTab === 'sub_kegiatan') {
      if (!editParentId) return;
      const updated = subKegiatanDb.map((sk) => (sk.id === id ? { ...sk, kegiatanId: editParentId, kode: trimmedKode, nama: trimmedNama, indikator: primaryIndikator, target: primaryTarget, indikatorList: cleanedList, pptkId: editPptkId || undefined } : sk));
      onUpdateSubKegiatan(updated);
      triggerToast?.('Sub Kegiatan berhasil diperbarui.', 'success');
    }

    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    // Check constraints
    let hasChildren = false;
    let message = `Apakah Anda yakin ingin menghapus "${name}"? Tindakan ini permanen.`;

    if (currentSubTab === 'tujuan') {
      hasChildren = sasaranDb.some((s) => s.tujuanId === id);
      if (hasChildren) {
        triggerToast?.('Tidak dapat menghapus! Tujuan ini sedang digunakan oleh Sasaran Rencana.', 'error');
        return;
      }
    } else if (currentSubTab === 'sasaran') {
      hasChildren = programDb.some((p) => p.sasaranId === id);
      if (hasChildren) {
        triggerToast?.('Tidak dapat menghapus! Sasaran ini sedang digunakan oleh Program Kerja.', 'error');
        return;
      }
    } else if (currentSubTab === 'program') {
      hasChildren = kegiatanDb.some((k) => k.programId === id);
      if (hasChildren) {
        triggerToast?.('Tidak dapat menghapus! Program ini sedang digunakan oleh Kegiatan.', 'error');
        return;
      }
    } else if (currentSubTab === 'kegiatan') {
      hasChildren = subKegiatanDb.some((sk) => sk.kegiatanId === id);
      if (hasChildren) {
        triggerToast?.('Tidak dapat menghapus! Kegiatan ini sedang digunakan oleh Sub Kegiatan.', 'error');
        return;
      }
    }

    const action = () => {
      if (currentSubTab === 'tujuan') {
        onUpdateTujuan(tujuanDb.filter((t) => t.id !== id));
      } else if (currentSubTab === 'sasaran') {
        onUpdateSasaran(sasaranDb.filter((s) => s.id !== id));
      } else if (currentSubTab === 'program') {
        onUpdateProgram(programDb.filter((p) => p.id !== id));
      } else if (currentSubTab === 'kegiatan') {
        onUpdateKegiatan(kegiatanDb.filter((k) => k.id !== id));
      } else if (currentSubTab === 'sub_kegiatan') {
        onUpdateSubKegiatan(subKegiatanDb.filter((sk) => sk.id !== id));
      } else if (currentSubTab === 'pptk') {
        onUpdatePPTK?.(pptkDb.filter((p) => p.id !== id));
      }
      triggerToast?.('Item berhasil dihapus dari SAKIP database.', 'success');
    };

    if (triggerConfirm) {
      triggerConfirm({
        title: 'Konfirmasi Penghapusan',
        message,
        confirmText: 'Ya, Hapus',
        cancelText: 'Batal',
        type: 'danger',
        onConfirm: action,
      });
    } else {
      if (confirm(message)) {
        action();
      }
    }
  };

  // Searching logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (currentSubTab === 'tujuan') {
      return tujuanDb.filter((t) => t.kode.toLowerCase().includes(query) || t.nama.toLowerCase().includes(query));
    } else if (currentSubTab === 'sasaran') {
      return sasaranDb.filter((s) => s.kode.toLowerCase().includes(query) || s.nama.toLowerCase().includes(query));
    } else if (currentSubTab === 'program') {
      return programDb.filter((p) => p.kode.toLowerCase().includes(query) || p.nama.toLowerCase().includes(query));
    } else if (currentSubTab === 'kegiatan') {
      return kegiatanDb.filter((k) => k.kode.toLowerCase().includes(query) || k.nama.toLowerCase().includes(query));
    } else if (currentSubTab === 'pptk') {
      return pptkDb.filter((p) => 
        p.nama.toLowerCase().includes(query) || 
        p.nip.toLowerCase().includes(query) || 
        p.jabatan.toLowerCase().includes(query) || 
        p.bidang.toLowerCase().includes(query)
      );
    } else {
      return subKegiatanDb.filter((sk) => sk.kode.toLowerCase().includes(query) || sk.nama.toLowerCase().includes(query));
    }
  }, [currentSubTab, searchQuery, tujuanDb, sasaranDb, programDb, kegiatanDb, subKegiatanDb, pptkDb]);

  return (
    <div id="database-sakip-view" className="space-y-6 animate-fade-in">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#004882]" />
            Pengelolaan Database Master SAKIP / Renstra
          </h3>
          <p className="text-xs text-slate-500">
            Kelola data dasar Rencana Strategis (Tujuan, Sasaran, Program, Kegiatan, dan Sub Kegiatan) untuk merancang Pohon Kinerja DKPP Kabupaten Indramayu.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#004882] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Tutup Formulir' : 'Tambah Data Master'}
        </button>
      </div>

      {/* CREATOR WIZARD */}
      {showAddForm && (
        <form onSubmit={handleAddNew} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-slide-down">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tambah Data Master Baru: {currentSubTab.replace('_', ' ').toUpperCase()}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentSubTab === 'pptk' ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Pegawai (PPTK)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hj. Endang Sri Mulyani, S.P., M.P."
                    value={newPptkNama}
                    onChange={(e) => setNewPptkNama(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-white focus:outline-[#004882] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">NIP Pegawai</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 197905142006042011"
                    value={newPptkNip}
                    onChange={(e) => setNewPptkNip(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-white font-mono focus:outline-[#004882]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jabatan Pegawai</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kasubag Perencanaan dan Evaluasi"
                    value={newPptkJabatan}
                    onChange={(e) => setNewPptkJabatan(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-white focus:outline-[#004882]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Bidang / Unit Kerja</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sekretariat atau Bidang Tanaman Pangan"
                    value={newPptkBidang}
                    onChange={(e) => setNewPptkBidang(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-white focus:outline-[#004882]"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Conditional Parent Selection */}
                {currentSubTab !== 'tujuan' && (
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {currentSubTab === 'sasaran' && 'Hubungkan dengan Tujuan Strategis'}
                      {currentSubTab === 'program' && 'Hubungkan dengan Sasaran Rencana'}
                      {currentSubTab === 'kegiatan' && 'Hubungkan dengan Program Kerja'}
                      {currentSubTab === 'sub_kegiatan' && 'Hubungkan dengan Kegiatan Kerja'}
                    </label>
                    <select
                      required
                      value={parentSelectionId}
                      onChange={(e) => setParentSelectionId(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded p-2.5 bg-slate-50 font-medium text-slate-800 focus:outline-[#004882]"
                    >
                      {currentSubTab === 'sasaran' && <option value="">-- Pilih Relasi Tujuan --</option>}
                      {currentSubTab === 'program' && <option value="">-- Pilih Relasi Sasaran Rencana --</option>}
                      {currentSubTab === 'kegiatan' && <option value="">-- Pilih Relasi Program Kerja --</option>}
                      {currentSubTab === 'sub_kegiatan' && <option value="">-- Pilih Relasi Kegiatan --</option>}
                      {currentSubTab === 'sasaran' &&
                        tujuanDb.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.kode}] {t.nama}
                          </option>
                        ))}
                      {currentSubTab === 'program' &&
                        sasaranDb.map((s) => (
                          <option key={s.id} value={s.id}>
                            [{s.kode}] {s.nama}
                          </option>
                        ))}
                      {currentSubTab === 'kegiatan' &&
                        programDb.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.kode}] {p.nama}
                          </option>
                        ))}
                      {currentSubTab === 'sub_kegiatan' &&
                        kegiatanDb.map((k) => (
                          <option key={k.id} value={k.id}>
                            [{k.kode}] {k.nama}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Kodean</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      currentSubTab === 'tujuan'
                        ? 'Contoh: TUJ.04'
                        : currentSubTab === 'sasaran'
                        ? 'Contoh: SAS.06'
                        : currentSubTab === 'program'
                        ? 'Contoh: PRG.06'
                        : currentSubTab === 'kegiatan'
                        ? 'Contoh: KEG.11'
                        : 'Contoh: SUB.11.01'
                    }
                    value={newKode}
                    onChange={(e) => setNewKode(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-white font-mono uppercase focus:outline-[#004882]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Deskripsi Elemen (Uraian)</label>
                  <input
                    type="text"
                    required
                    placeholder="Rincian deskripsi / uraian nama instansi kerja SAKIP..."
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-white focus:outline-[#004882]"
                  />
                </div>

                <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Daftar Indikator Kinerja & Target (Bisa lebih dari 1)</span>
                  
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs mb-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">Nama Indikator Kinerja</label>
                      <input
                        type="text"
                        placeholder="Contoh: Skor Pola Pangan Harapan, Persentase JUT layak..."
                        value={newIndikator}
                        onChange={(e) => setNewIndikator(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-[#004882]"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center font-mono">Target 2025</label>
                        <input
                          type="text"
                          placeholder="e.g. 96.7"
                          value={newTarget2025}
                          onChange={(e) => setNewTarget2025(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white text-center font-semibold focus:outline-[#004882]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center font-mono">Target 2026</label>
                        <input
                          type="text"
                          placeholder="e.g. 96.9"
                          value={newTarget2026}
                          onChange={(e) => setNewTarget2026(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white text-center font-semibold focus:outline-[#004882]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center font-mono">Target 2027</label>
                        <input
                          type="text"
                          placeholder="e.g. 97.1"
                          value={newTarget2027}
                          onChange={(e) => setNewTarget2027(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white text-center font-semibold focus:outline-[#004882]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center font-mono">Target 2028</label>
                        <input
                          type="text"
                          placeholder="e.g. 97.3"
                          value={newTarget2028}
                          onChange={(e) => setNewTarget2028(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white text-center font-semibold focus:outline-[#004882]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center font-mono">Target 2029</label>
                        <input
                          type="text"
                          placeholder="e.g. 97.5"
                          value={newTarget2029}
                          onChange={(e) => setNewTarget2029(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white text-center font-semibold focus:outline-[#004882]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center font-mono">Target 2030</label>
                        <input
                          type="text"
                          placeholder="e.g. 97.7"
                          value={newTarget2030}
                          onChange={(e) => setNewTarget2030(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white text-center font-semibold focus:outline-[#004882]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newIndikator.trim()) {
                            triggerToast?.('Tulis nama indikator terlebih dahulu!', 'error');
                            return;
                          }
                          const id = `IND_${Date.now()}`;
                          setNewIndikatorList([
                            ...newIndikatorList,
                            { 
                              id, 
                              indikator: newIndikator.trim(), 
                              target: newTarget2026.trim() || '-',
                              target2025: newTarget2025.trim() || '-',
                              target2026: newTarget2026.trim() || '-',
                              target2027: newTarget2027.trim() || '-',
                              target2028: newTarget2028.trim() || '-',
                              target2029: newTarget2029.trim() || '-',
                              target2030: newTarget2030.trim() || '-'
                            }
                          ]);
                          setNewIndikator('');
                          setNewTarget2025('');
                          setNewTarget2026('');
                          setNewTarget2027('');
                          setNewTarget2028('');
                          setNewTarget2029('');
                          setNewTarget2030('');
                          setNewTarget('');
                          triggerToast?.('Indikator Renstra berhasil ditambahkan.', 'success');
                        }}
                        className="px-4 py-2 bg-[#004882] hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center justify-center shadow-xs"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Indikator
                      </button>
                    </div>
                  </div>

                  {/* Display temporarily added list */}
                  {newIndikatorList.length > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 shadow-2xs">
                      {newIndikatorList.map((item, idx) => (
                        <div key={item.id} className="p-3 px-4 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-2.5 pr-4">
                            <span className="font-extrabold text-slate-400 bg-slate-100 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-700 leading-snug">{item.indikator}</p>
                              <div className="text-[10px] font-medium text-slate-450 mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-slate-400">
                                <span className="font-mono text-slate-500">2025: <span className="font-bold text-[#004882] bg-blue-50 px-1 py-0.2 rounded border border-blue-100/50">{item.target2025 || '-'}</span></span>
                                <span className="font-mono text-slate-500">2026: <span className="font-bold text-[#004882] bg-blue-50 px-1 py-0.2 rounded border border-blue-100/50">{item.target2026 || '-'}</span></span>
                                <span className="font-mono text-slate-500">2027: <span className="font-bold text-[#004882] bg-blue-50 px-1 py-0.2 rounded border border-blue-100/50">{item.target2027 || '-'}</span></span>
                                <span className="font-mono text-slate-500">2028: <span className="font-bold text-[#004882] bg-blue-50 px-1 py-0.2 rounded border border-blue-100/50">{item.target2028 || '-'}</span></span>
                                <span className="font-mono text-slate-500">2029: <span className="font-bold text-[#004882] bg-blue-50 px-1 py-0.2 rounded border border-blue-100/50">{item.target2029 || '-'}</span></span>
                                <span className="font-mono text-slate-500">2030: <span className="font-bold text-[#004882] bg-blue-50 px-1 py-0.2 rounded border border-blue-100/50">{item.target2030 || '-'}</span></span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewIndikatorList(newIndikatorList.filter((x) => x.id !== item.id));
                              triggerToast?.('Indikator dihapus.', 'info');
                            }}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            title="Hapus dari daftar sementara"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 italic">
                      Belum ada indikator ditambahkan ke daftar. Gunakan form di atas untuk menambah satu/lebih indikator.
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 mt-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Pengampu (Pejabat / PPTK / Bidang)</label>
                  <select
                    value={newPptkId}
                    onChange={(e) => setNewPptkId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2.5 bg-slate-50 font-medium text-slate-800 focus:outline-[#004882]"
                  >
                    <option value="">-- Pilih Relasi Pengampu (Pejabat / PPTK / Bidang) --</option>
                    {pptkDb.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} - {p.jabatan} ({p.bidang})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 shadow-sm transition"
            >
              Simpan Data Master
            </button>
          </div>
        </form>
      )}

      {/* METRIC TYPE TABS SWITCHER */}
      <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1.5 rounded-xl border border-slate-300 w-fit">
        <button
          onClick={() => {
            setCurrentSubTab('tujuan');
            setSearchQuery('');
            resetForm();
            setEditingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all ${
            currentSubTab === 'tujuan' ? 'bg-[#004882] text-white shadow-md' : 'text-slate-650 hover:bg-slate-100/50'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          1. Tujuan Strategis
        </button>
        <button
          onClick={() => {
            setCurrentSubTab('sasaran');
            setSearchQuery('');
            resetForm();
            setEditingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all ${
            currentSubTab === 'sasaran' ? 'bg-[#004882] text-white shadow-md' : 'text-slate-650 hover:bg-slate-100/50'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          2. Sasaran Rencana
        </button>
        <button
          onClick={() => {
            setCurrentSubTab('program');
            setSearchQuery('');
            resetForm();
            setEditingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all ${
            currentSubTab === 'program' ? 'bg-[#004882] text-white shadow-md' : 'text-slate-650 hover:bg-slate-100/50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          3. Program Kerja
        </button>
        <button
          onClick={() => {
            setCurrentSubTab('kegiatan');
            setSearchQuery('');
            resetForm();
            setEditingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all ${
            currentSubTab === 'kegiatan' ? 'bg-[#004882] text-white shadow-md' : 'text-slate-650 hover:bg-slate-100/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          4. Kegiatan Kerja
        </button>
        <button
          onClick={() => {
            setCurrentSubTab('sub_kegiatan');
            setSearchQuery('');
            resetForm();
            setEditingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all ${
            currentSubTab === 'sub_kegiatan' ? 'bg-[#004882] text-white shadow-md' : 'text-slate-650 hover:bg-slate-100/50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          5. Sub Kegiatan Kerja
        </button>
        <button
          onClick={() => {
            setCurrentSubTab('pptk');
            setSearchQuery('');
            resetForm();
            setEditingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all ${
            currentSubTab === 'pptk' ? 'bg-[#004882] text-white shadow-md' : 'text-slate-650 hover:bg-slate-100/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          6. Pejabat / PPTK & Bidang
        </button>
      </div>

      {/* SEARCH AND CAPTION CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 w-full md:max-w-xs transition-focus-within focus-within:ring-2 focus-within:ring-[#004882]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={currentSubTab === 'pptk' ? "Cari nama, NIP, jabatan atau bidang..." : "Cari kode atau deskripsi..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-700 bg-transparent outline-none"
          />
        </div>
        <div className="text-[10px] bg-[#004882]/5 text-[#004882] px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 border border-[#004882]/20">
          <span>Relasi database terjaga secara kaskade (Pohon Renstra).</span>
        </div>
      </div>

      {/* MASTER DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {currentSubTab === 'pptk' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                  <th className="py-3 px-4 font-bold text-center w-10">No</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Nama Pegawai</th>
                  <th className="py-3 px-4 font-bold w-48">NIP</th>
                  <th className="py-3 px-4 font-bold min-w-[220px]">Jabatan</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Nama Bidang / Unit Kerja</th>
                  <th className="py-3 px-4 text-center font-bold w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 italic font-medium">
                      Belum ada data Pejabat / PPTK. Tambahkan data master baru untuk melengkapi database.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => {
                    const isEditing = editingId === item.id;
                    const pptkItem = item as PPTK;
                    return (
                      <tr key={pptkItem.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPptkNama}
                              onChange={(e) => setEditPptkNama(e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-bold focus:outline-[#004882]"
                            />
                          ) : (
                            <span className="font-bold text-slate-800 text-xs">{pptkItem.nama}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPptkNip}
                              onChange={(e) => setEditPptkNip(e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono focus:outline-[#004882]"
                            />
                          ) : (
                            <span className="text-slate-600 font-semibold">{pptkItem.nip}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPptkJabatan}
                              onChange={(e) => setEditPptkJabatan(e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-700 focus:outline-[#004882]"
                            />
                          ) : (
                            <span className="text-slate-650 font-medium">{pptkItem.jabatan}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPptkBidang}
                              onChange={(e) => setEditPptkBidang(e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-700 focus:outline-[#004882]"
                            />
                          ) : (
                            <span className="inline-block bg-blue-50/70 text-[#004882] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-blue-100/40">
                              {pptkItem.bidang}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => saveEdit(pptkItem.id)}
                                className="p-1 px-2.5 bg-[#004882] text-white rounded text-[11px] font-bold hover:bg-[#003862] transition flex items-center gap-1 shadow-xs"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 px-2 text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEdit(pptkItem)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                                title="Edit Pejabat"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(pptkItem.id, pptkItem.nama)}
                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                title="Hapus Pejabat"
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
          ) : (
            <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <th className="py-3 px-3 font-bold text-center w-10">No</th>
                <th className="py-3 px-3 font-bold w-24">Kode</th>
                <th className="py-3 px-3 font-bold min-w-[200px]">Uraian</th>
                <th className="py-3 px-3 font-bold min-w-[220px]">Indikator</th>
                <th className="py-3 px-1 font-bold text-center w-20">Tgt 2025</th>
                <th className="py-3 px-1 font-bold text-center w-20">Tgt 2026</th>
                <th className="py-3 px-1 font-bold text-center w-20">Tgt 2027</th>
                <th className="py-3 px-1 font-bold text-center w-20">Tgt 2028</th>
                <th className="py-3 px-1 font-bold text-center w-20">Tgt 2029</th>
                <th className="py-3 px-1 font-bold text-center w-20">Tgt 2030</th>
                <th className="py-3 px-2 text-center font-bold w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                    Belum ada data master untuk kategori ini. Tambahkan data master baru untuk melengkapi Renstra.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const isEditing = editingId === item.id;
                  
                  // Resolve parent descriptive text
                  let parentName = '';
                  if (currentSubTab === 'sasaran') {
                    parentName = tujuanDb.find((t) => t.id === (item as Sasaran).tujuanId)?.nama || (item as Sasaran).tujuanId;
                  } else if (currentSubTab === 'program') {
                    parentName = sasaranDb.find((s) => s.id === (item as Program).sasaranId)?.nama || (item as Program).sasaranId;
                  } else if (currentSubTab === 'kegiatan') {
                    parentName = programDb.find((p) => p.id === (item as Kegiatan).programId)?.nama || (item as Kegiatan).programId;
                  } else if (currentSubTab === 'sub_kegiatan') {
                    parentName = kegiatanDb.find((k) => k.id === (item as SubKegiatan).kegiatanId)?.nama || (item as SubKegiatan).kegiatanId;
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                      
                      {/* Kode */}
                      <td className="py-4 px-4 font-bold text-slate-700 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editKode}
                            onChange={(e) => setEditKode(e.target.value)}
                            className="w-full border border-slate-300 rounded p-1 text-xs font-mono uppercase font-black focus:outline-[#004882]"
                          />
                        ) : (
                          <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded font-mono font-extrabold">
                            {item.kode}
                          </span>
                        )}
                      </td>

                      {/* Deskripsi / Uraian */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <div className="space-y-1.5 w-full">
                            <textarea
                              value={editNama}
                              onChange={(e) => setEditNama(e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800 focus:outline-[#004882]"
                              rows={2}
                            />
                            {currentSubTab !== 'tujuan' && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  {currentSubTab === 'sasaran' && 'Pilih Relasi Tujuan (Parent):'}
                                  {currentSubTab === 'program' && 'Pilih Relasi Sasaran Rencana (Parent):'}
                                  {currentSubTab === 'kegiatan' && 'Pilih Relasi Program Kerja (Parent):'}
                                  {currentSubTab === 'sub_kegiatan' && 'Pilih Relasi Kegiatan Kerja (Parent):'}
                                </span>
                                <select
                                  value={editParentId}
                                  onChange={(e) => setEditParentId(e.target.value)}
                                  className="w-full text-xs border border-slate-200 rounded p-1 font-medium bg-slate-50 text-slate-700"
                                >
                                  {currentSubTab === 'sasaran' &&
                                    tujuanDb.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        [{t.kode}] {t.nama}
                                      </option>
                                    ))}
                                  {currentSubTab === 'program' &&
                                    sasaranDb.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        [{s.kode}] {s.nama}
                                      </option>
                                    ))}
                                  {currentSubTab === 'kegiatan' &&
                                    programDb.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        [{p.kode}] {p.nama}
                                      </option>
                                    ))}
                                  {currentSubTab === 'sub_kegiatan' &&
                                    kegiatanDb.map((k) => (
                                      <option key={k.id} value={k.id}>
                                        [{k.kode}] {k.nama}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Pilih Pengampu (Pejabat / Bidang):</span>
                              <select
                                value={editPptkId}
                                onChange={(e) => setEditPptkId(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded p-1 font-medium bg-slate-50 text-slate-700 focus:outline-[#004882]"
                              >
                                <option value="">-- Pilih Relasi Pengampu (Pejabat / PPTK / Bidang) --</option>
                                {pptkDb.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nama} - {p.jabatan} ({p.bidang})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-relaxed">{item.nama}</p>
                            {parentName && (
                              <p className="text-[10.5px] font-medium text-[#004882] bg-[#004882]/5 px-2 py-0.5 mt-1.5 rounded border border-[#004882]/10 w-fit">
                                {currentSubTab === 'sasaran' ? 'Tujuan Strategis: ' : ''}
                                {currentSubTab === 'program' ? 'Sasaran Rencana: ' : ''}
                                {currentSubTab === 'kegiatan' ? 'Program Kerja: ' : ''}
                                {currentSubTab === 'sub_kegiatan' ? 'Kegiatan Kerja: ' : ''}
                                {parentName}
                              </p>
                            )}

                            {/* Display Pengampu Badge */}
                            {(() => {
                              const pptkItem = pptkDb.find((p) => p.id === item.pptkId);
                              if (pptkItem) {
                                return (
                                  <div className="text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 mt-1.5 rounded w-fit flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>Pengampu: {pptkItem.nama} - {pptkItem.jabatan} ({pptkItem.bidang})</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </td>

                      {/* Indikator */}
                      <td className="py-3 px-3 text-slate-650 max-w-[280px]">
                        {isEditing ? (
                          <div className="space-y-2">
                            {editIndikatorList.map((ind, indIdx) => (
                              <div key={ind.id} className="flex flex-col gap-1 bg-slate-50 p-1.5 rounded border border-slate-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] uppercase font-bold text-[#004882]">Indikator #{indIdx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditIndikatorList(editIndikatorList.filter((x) => x.id !== ind.id));
                                    }}
                                    className="p-0.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0 transition"
                                    title="Hapus indikator"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <textarea
                                  value={ind.indikator}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, indikator: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] text-slate-800 focus:outline-[#004882]"
                                  rows={1}
                                  placeholder="Isi nama indikator..."
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setEditIndikatorList([
                                  ...editIndikatorList,
                                  { 
                                    id: `IND_NEW_${Date.now()}_${Math.random()}`, 
                                    indikator: '', 
                                    target: '',
                                    target2025: '',
                                    target2026: '',
                                    target2027: '',
                                    target2028: '',
                                    target2029: '',
                                    target2030: ''
                                  }
                                ]);
                              }}
                              className="w-full py-1 text-center border border-dashed border-slate-300 hover:border-[#004882] text-[#004882] hover:bg-blue-50/50 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Tambah Indikator
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="text-xs text-slate-700 font-medium min-h-[34px] py-1 flex items-start">
                                <span className="mr-1.5 text-slate-400 font-extrabold">{getIndikatorList(item).length > 1 ? `${idx + 1}.` : '•'}</span>
                                <span className="leading-snug">{ind.indikator}</span>
                              </div>
                            ))}
                            {getIndikatorList(item).length === 0 && (
                              <span className="text-slate-300 italic text-[11px]">Belum diisi</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Tgt 2025 */}
                      <td className="py-3 px-1 text-center">
                        <div className="space-y-1.5">
                          {isEditing ? (
                            editIndikatorList.map((ind) => (
                              <div key={ind.id} className="h-[44px] flex items-center justify-center">
                                <input
                                  type="text"
                                  value={ind.target2025 || ''}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, target2025: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-16 border border-slate-300 rounded text-center p-1 text-xs focus:outline-[#004882] font-mono font-semibold"
                                  placeholder="2025"
                                />
                              </div>
                            ))
                          ) : (
                            getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="min-h-[34px] py-1 flex items-center justify-center">
                                <span className="font-mono text-xs font-black bg-blue-50/40 border border-blue-100/40 px-2 py-0.5 rounded text-[#014175]">
                                  {ind.target2025 || ind.target || '-'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Tgt 2026 */}
                      <td className="py-3 px-1 text-center">
                        <div className="space-y-1.5">
                          {isEditing ? (
                            editIndikatorList.map((ind) => (
                              <div key={ind.id} className="h-[44px] flex items-center justify-center">
                                <input
                                  type="text"
                                  value={ind.target2026 || ''}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, target2026: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-16 border border-slate-300 rounded text-center p-1 text-xs focus:outline-[#004882] font-mono font-semibold"
                                  placeholder="2026"
                                />
                              </div>
                            ))
                          ) : (
                            getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="min-h-[34px] py-1 flex items-center justify-center">
                                <span className="font-mono text-xs font-black bg-blue-50/40 border border-blue-100/40 px-2 py-0.5 rounded text-[#014175]">
                                  {ind.target2026 || ind.target || '-'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Tgt 2027 */}
                      <td className="py-3 px-1 text-center">
                        <div className="space-y-1.5">
                          {isEditing ? (
                            editIndikatorList.map((ind) => (
                              <div key={ind.id} className="h-[44px] flex items-center justify-center">
                                <input
                                  type="text"
                                  value={ind.target2027 || ''}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, target2027: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-16 border border-slate-300 rounded text-center p-1 text-xs focus:outline-[#004882] font-mono font-semibold"
                                  placeholder="2027"
                                />
                              </div>
                            ))
                          ) : (
                            getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="min-h-[34px] py-1 flex items-center justify-center">
                                <span className="font-mono text-xs font-black bg-blue-50/40 border border-blue-100/40 px-2 py-0.5 rounded text-[#014175]">
                                  {ind.target2027 || ind.target || '-'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Tgt 2028 */}
                      <td className="py-3 px-1 text-center">
                        <div className="space-y-1.5">
                          {isEditing ? (
                            editIndikatorList.map((ind) => (
                              <div key={ind.id} className="h-[44px] flex items-center justify-center">
                                <input
                                  type="text"
                                  value={ind.target2028 || ''}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, target2028: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-16 border border-slate-300 rounded text-center p-1 text-xs focus:outline-[#004882] font-mono font-semibold"
                                  placeholder="2028"
                                />
                              </div>
                            ))
                          ) : (
                            getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="min-h-[34px] py-1 flex items-center justify-center">
                                <span className="font-mono text-xs font-black bg-blue-50/40 border border-blue-100/40 px-2 py-0.5 rounded text-[#014175]">
                                  {ind.target2028 || ind.target || '-'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Tgt 2029 */}
                      <td className="py-3 px-1 text-center">
                        <div className="space-y-1.5">
                          {isEditing ? (
                            editIndikatorList.map((ind) => (
                              <div key={ind.id} className="h-[44px] flex items-center justify-center">
                                <input
                                  type="text"
                                  value={ind.target2029 || ''}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, target2029: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-16 border border-slate-300 rounded text-center p-1 text-xs focus:outline-[#004882] font-mono font-semibold"
                                  placeholder="2029"
                                />
                              </div>
                            ))
                          ) : (
                            getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="min-h-[34px] py-1 flex items-center justify-center">
                                <span className="font-mono text-xs font-black bg-blue-50/40 border border-blue-100/40 px-2 py-0.5 rounded text-[#014175]">
                                  {ind.target2029 || ind.target || '-'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Tgt 2030 */}
                      <td className="py-3 px-1 text-center">
                        <div className="space-y-1.5">
                          {isEditing ? (
                            editIndikatorList.map((ind) => (
                              <div key={ind.id} className="h-[44px] flex items-center justify-center">
                                <input
                                  type="text"
                                  value={ind.target2030 || ''}
                                  onChange={(e) => {
                                    const updatedList = editIndikatorList.map((x) =>
                                      x.id === ind.id ? { ...x, target2030: e.target.value } : x
                                    );
                                    setEditIndikatorList(updatedList);
                                  }}
                                  className="w-16 border border-slate-300 rounded text-center p-1 text-xs focus:outline-[#004882] font-mono font-semibold"
                                  placeholder="2030"
                                />
                              </div>
                            ))
                          ) : (
                            getIndikatorList(item).map((ind, idx) => (
                              <div key={idx} className="min-h-[34px] py-1 flex items-center justify-center">
                                <span className="font-mono text-xs font-black bg-blue-50/40 border border-blue-100/40 px-2 py-0.5 rounded text-[#014175]">
                                  {ind.target2030 || ind.target || '-'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition flex items-center gap-1 hover:scale-101 shadow-xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 px-2 text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                if (currentSubTab === 'tujuan') startEdit(item);
                                if (currentSubTab === 'sasaran') startEdit(item, (item as Sasaran).tujuanId);
                                if (currentSubTab === 'program') startEdit(item, (item as Program).sasaranId);
                                if (currentSubTab === 'kegiatan') startEdit(item, (item as Kegiatan).programId);
                                if (currentSubTab === 'sub_kegiatan') startEdit(item, (item as SubKegiatan).kegiatanId);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                              title="Edit item ini"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.nama)}
                              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                              title="Hapus item ini"
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
          )}
        </div>
      </div>
    </div>
  );
}
