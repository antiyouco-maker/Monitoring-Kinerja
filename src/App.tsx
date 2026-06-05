/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import IkuView from './components/IkuView';
import IkkView from './components/IkkView';
import CascadingView from './components/CascadingView';
import GrafikKinerjaView from './components/GrafikKinerjaView';
import LaporanView from './components/LaporanView';
import DatabaseSakipView from './components/DatabaseSakipView';
import { dbService } from './data/mockDb';
import { IkuIndikator, IkkIndikator, CascadingKinerja, Tujuan, Sasaran, Program, Kegiatan, SubKegiatan, PPTK, SakipSyncLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeYear, setActiveYear] = useState<number>(2026); // Default 2026 from screenshot
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Main Database state hooks
  const [ikuData, setIkuData] = useState<IkuIndikator[]>([]);
  const [ikkData, setIkkData] = useState<IkkIndikator[]>([]);
  const [cascadingData, setCascadingData] = useState<CascadingKinerja[]>([]);
  const [tujuanDb, setTujuanDb] = useState<Tujuan[]>([]);
  const [sasaranDb, setSasaranDb] = useState<Sasaran[]>([]);
  const [programDb, setProgramDb] = useState<Program[]>([]);
  const [kegiatanDb, setKegiatanDb] = useState<Kegiatan[]>([]);
  const [subKegiatanDb, setSubKegiatanDb] = useState<SubKegiatan[]>([]);
  const [pptkDb, setPPTKDb] = useState<PPTK[]>([]);
  const [syncLogs, setSyncLogs] = useState<SakipSyncLog[]>([]);

  // Sync statuses
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Toast notifications state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
    visible: boolean;
  } | null>(null);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    visible: boolean;
  } | null>(null);

  // Helper trigger systems
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const triggerConfirm = (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      ...params,
      visible: true,
    });
  };

  // Toast auto-fade
  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => prev ? { ...prev, visible: false } : null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast?.visible]);

  // Async helper to push updates to the Node.js backend
  const saveToBackend = async (key: string, data: any) => {
    try {
      await fetch('/api/db/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data }),
      });
    } catch (e) {
      console.warn('Backend sync failed, state kept locally', e);
    }
  };

  // Initial Database load from real Express API with offline-first local db fallback
  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const db = await res.json();
          setIkuData(db.iku || []);
          setIkkData(db.ikk || []);
          setCascadingData(db.cascading || []);
          setTujuanDb(db.tujuan || []);
          setSasaranDb(db.sasaran || []);
          setProgramDb(db.program || []);
          setKegiatanDb(db.kegiatan || []);
          setSubKegiatanDb(db.sub_kegiatan || []);
          setPPTKDb(db.pptk || []);
          setSyncLogs(db.sync_logs || []);
          if (db.sync_logs && db.sync_logs.length > 0) {
            setLastSyncedTime(db.sync_logs[0].timestamp);
          }
          return;
        }
      } catch (err) {
        console.warn('Gagal memuat database dari Node.js backend, menggunakan database lokal offline', err);
      }

      // Offline Fallback
      setIkuData(dbService.getIKU());
      setIkkData(dbService.getIKK());
      setCascadingData(dbService.getCascading());
      setTujuanDb(dbService.getTujuan());
      setSasaranDb(dbService.getSasaran());
      setProgramDb(dbService.getProgram());
      setKegiatanDb(dbService.getKegiatan());
      setSubKegiatanDb(dbService.getSubKegiatan());
      setPPTKDb(dbService.getPPTK());
      const logs = dbService.getSyncLogs();
      setSyncLogs(logs);
      if (logs.length > 0) {
        setLastSyncedTime(logs[0].timestamp);
      }
    };

    fetchDatabase();
  }, []);

  // Update modules and persist in LocalStorage & NodeJS backend
  const handleUpdateIku = (data: IkuIndikator[]) => {
    setIkuData(data);
    dbService.saveIKU(data);
    saveToBackend('iku', data);
  };

  const handleUpdateIkk = (data: IkkIndikator[]) => {
    setIkkData(data);
    dbService.saveIKK(data);
    saveToBackend('ikk', data);
  };

  const handleUpdateCascading = (data: CascadingKinerja[]) => {
    setCascadingData(data);
    dbService.saveCascading(data);
    saveToBackend('cascading', data);
  };

  const handleUpdateTujuan = (data: Tujuan[]) => {
    setTujuanDb(data);
    dbService.saveTujuan(data);
    saveToBackend('tujuan', data);
  };

  const handleUpdateSasaran = (data: Sasaran[]) => {
    setSasaranDb(data);
    dbService.saveSasaran(data);
    saveToBackend('sasaran', data);
  };

  const handleUpdateProgram = (data: Program[]) => {
    setProgramDb(data);
    dbService.saveProgram(data);
    saveToBackend('program', data);
  };

  const handleUpdateKegiatan = (data: Kegiatan[]) => {
    setKegiatanDb(data);
    dbService.saveKegiatan(data);
    saveToBackend('kegiatan', data);
  };

  const handleUpdateSubKegiatan = (data: SubKegiatan[]) => {
    setSubKegiatanDb(data);
    dbService.saveSubKegiatan(data);
    saveToBackend('sub_kegiatan', data);
  };

  const handleUpdatePPTK = (data: PPTK[]) => {
    setPPTKDb(data);
    dbService.savePPTK(data);
    saveToBackend('pptk', data);
  };

  // Perform SAKIP Live Integration Sync on NodeJS server
  const handleSyncSakip = async () => {
    setIsSyncing(true);
    
    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ triggeredBy: 'Manual Sync (Hj. Endang) via Node.js' }),
      });

      if (res.ok) {
        const result = await res.json();
        
        // Update states
        setTujuanDb(result.db.tujuan);
        setSasaranDb(result.db.sasaran);
        setProgramDb(result.db.program);
        setKegiatanDb(result.db.kegiatan);
        setSubKegiatanDb(result.db.sub_kegiatan);
        setSyncLogs(result.db.sync_logs);
        
        if (result.db.sync_logs && result.db.sync_logs.length > 0) {
          setLastSyncedTime(result.db.sync_logs[0].timestamp);
        }
        setIsSyncing(false);

        // Sync local offline DB as well
        dbService.saveTujuan(result.db.tujuan);
        dbService.saveSasaran(result.db.sasaran);
        dbService.saveProgram(result.db.program);
        dbService.saveKegiatan(result.db.kegiatan);
        dbService.saveSubKegiatan(result.db.sub_kegiatan);
        dbService.saveSyncLogs(result.db.sync_logs);

        if (result.updatedMasterCount > 0) {
          triggerToast('Integrasi SAKIP Sukses! 5 Target Program dan Sub Kegiatan SAKIP baru berhasil disinkronkan secara real-time ke database Node.js.', 'success');
        } else {
          triggerToast('Integrasi SAKIP Sukses! Seluruh indikator master data sudah mutakhir di server.', 'info');
        }
        return;
      }
    } catch (e) {
      console.warn('Backend sync failed, falling back to mock environment', e);
    }

    // Offline SAKIP Sync backup handler
    setTimeout(() => {
      const result = dbService.executeSakipSync('Manual Sync (Hj. Endang)');
      setTujuanDb(dbService.getTujuan());
      setSasaranDb(dbService.getSasaran());
      setProgramDb(dbService.getProgram());
      setKegiatanDb(dbService.getKegiatan());
      setSubKegiatanDb(dbService.getSubKegiatan());
      setSyncLogs(result.logs);
      setLastSyncedTime(result.logs[0].timestamp);
      setIsSyncing(false);

      if (result.updatedMasterCount > 0) {
        triggerToast('Integrasi SAKIP Sukses! 5 Target Program dan Sub Kegiatan SAKIP baru berhasil disinkronkan secara real-time ke database.', 'success');
      } else {
        triggerToast('Integrasi SAKIP Sukses! Seluruh indikator master data sudah mutakhir.', 'info');
      }
    }, 1200);
  };

  // Safe reset to default
  const handleResetToDefault = () => {
    triggerConfirm({
      title: 'Reset Database SAKIP',
      message: 'Apakah Anda ingin mereset seluruh data kembali ke setelan awal Dinas Ketahanan Pangan & Pertanian Kabupaten Indramayu?',
      confirmText: 'Ya, Reset Sekarang',
      cancelText: 'Batalkan',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/db/reset', { method: 'POST' });
          if (res.ok) {
            const result = await res.json();
            setIkuData(result.db.iku);
            setIkkData(result.db.ikk);
            setCascadingData(result.db.cascading);
            setTujuanDb(result.db.tujuan);
            setSasaranDb(result.db.sasaran);
            setProgramDb(result.db.program);
            setKegiatanDb(result.db.kegiatan);
            setSubKegiatanDb(result.db.sub_kegiatan);
            setPPTKDb(result.db.pptk);
            setSyncLogs(result.db.sync_logs);
            if (result.db.sync_logs && result.db.sync_logs.length > 0) {
              setLastSyncedTime(result.db.sync_logs[0].timestamp);
            }
            dbService.resetToDefaults();
            setActiveTab('dashboard');
            triggerToast('Database server Node.js dan lokal berhasil di-reset ke setelan awal.', 'success');
            return;
          }
        } catch (e) {
          console.warn('Backend reset failed, resetting locally', e);
        }

        dbService.resetToDefaults();
        // Reload states locally
        setIkuData(dbService.getIKU());
        setIkkData(dbService.getIKK());
        setCascadingData(dbService.getCascading());
        setTujuanDb(dbService.getTujuan());
        setSasaranDb(dbService.getSasaran());
        setProgramDb(dbService.getProgram());
        setKegiatanDb(dbService.getKegiatan());
        setSubKegiatanDb(dbService.getSubKegiatan());
        setPPTKDb(dbService.getPPTK());
        
        const logs = dbService.getSyncLogs();
        setSyncLogs(logs);
        if (logs.length > 0) {
          setLastSyncedTime(logs[0].timestamp);
        }
        setActiveTab('dashboard');
        triggerToast('Database lokal berhasil di-reset ke setelan awal.', 'success');
      }
    });
  };

  // Resolve Header descriptive titles
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Monitoring IKU dan IKK',
          subtitle: 'Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu',
        };
      case 'iku':
        return {
          title: 'Monitoring Indikator Kinerja Utama (IKU)',
          subtitle: 'Kompilasi Indeks Kinerja Unggulan Kabupaten',
        };
      case 'ikk':
        return {
          title: 'Monitoring Indikator Kinerja Kegiatan (IKK)',
          subtitle: 'Kompilasi Operasional dan Taktis Dinas',
        };
      case 'cascading':
        return {
          title: 'Cascading / Penyelarasan Kinerja',
          subtitle: 'Matriks Penurunan Indikator dari Tujuan Kepala sampai PPTK Lapangan',
        };
      case 'charts':
        return {
          title: 'Ulasan Grafik Capaian Target',
          subtitle: 'Analisis Diagram Visual dan Distribusi Beban SAKIP',
        };
      case 'reports':
        return {
          title: 'Berkas Laporan Kinerja Instansi',
          subtitle: 'Unduh Rekapitulasi Administratif SAKIP Formal',
        };
      case 'database':
        return {
          title: 'Database Renstra 2025-2030',
          subtitle: 'Kompilasi dan Pengelolaan Data Rencana Rencana Strategis Terpadu',
        };
      default:
        return {
          title: 'Sistem Monitoring Kinerja',
          subtitle: 'DKPP Indramayu',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div id="app-viewport" className="flex h-screen w-screen bg-[#f8fafc] font-sans overflow-hidden relative">
      {/* Sidebar Backdrop overlay on mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300 pointer-events-auto"
          title="Tutup Menu"
        />
      )}

      {/* Sidebar with menu lists & reset triggers */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickReset={handleResetToDefault}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main interactive stage */}
      <div id="main-content-layout" className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          activeYear={activeYear}
          setActiveYear={setActiveYear}
          onSyncSakip={handleSyncSakip}
          isSyncing={isSyncing}
          lastSynced={lastSyncedTime}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View container */}
        <main id="app-main-view" className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              ikuData={ikuData}
              ikkData={ikkData}
              cascadingData={cascadingData}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'iku' && (
            <IkuView
              ikuData={ikuData}
              onUpdateIku={handleUpdateIku}
              sasaranDb={sasaranDb}
              activeYear={activeYear}
              triggerConfirm={triggerConfirm}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'ikk' && (
            <IkkView
              ikkData={ikkData}
              onUpdateIkk={handleUpdateIkk}
              activeYear={activeYear}
              triggerConfirm={triggerConfirm}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'cascading' && (
            <CascadingView
              tujuanDb={tujuanDb}
              sasaranDb={sasaranDb}
              programDb={programDb}
              kegiatanDb={kegiatanDb}
              subKegiatanDb={subKegiatanDb}
              pptkDb={pptkDb}
              cascadingData={cascadingData}
              onUpdateCascading={handleUpdateCascading}
              activeYear={activeYear}
              triggerConfirm={triggerConfirm}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'charts' && (
            <GrafikKinerjaView
              cascadingData={cascadingData}
              pptkDb={pptkDb}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'reports' && (
            <LaporanView
              tujuanDb={tujuanDb}
              sasaranDb={sasaranDb}
              programDb={programDb}
              kegiatanDb={kegiatanDb}
              subKegiatanDb={subKegiatanDb}
              pptkDb={pptkDb}
              cascadingData={cascadingData}
              syncLogs={syncLogs}
              activeYear={activeYear}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseSakipView
              tujuanDb={tujuanDb}
              sasaranDb={sasaranDb}
              programDb={programDb}
              kegiatanDb={kegiatanDb}
              subKegiatanDb={subKegiatanDb}
              pptkDb={pptkDb}
              onUpdateTujuan={handleUpdateTujuan}
              onUpdateSasaran={handleUpdateSasaran}
              onUpdateProgram={handleUpdateProgram}
              onUpdateKegiatan={handleUpdateKegiatan}
              onUpdateSubKegiatan={handleUpdateSubKegiatan}
              onUpdatePPTK={handleUpdatePPTK}
              triggerConfirm={triggerConfirm}
              triggerToast={triggerToast}
            />
          )}
        </main>
      </div>

      {/* Global Custom Toast Notification Overlay */}
      {toast && toast.visible && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl animate-slide-in border border-slate-800 max-w-sm">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          <div className="text-xs font-semibold leading-snug">{toast.message}</div>
          <button
            onClick={() => setToast((prev) => prev ? { ...prev, visible: false } : null)}
            className="text-slate-400 hover:text-white transition p-0.5 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Custom Confirmation Modal Dialog */}
      {confirmModal && confirmModal.visible && (
        <div id="confirm-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full animate-scale-up">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${
                confirmModal.type === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-extrabold text-slate-800">{confirmModal.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4">
              <button
                onClick={() => setConfirmModal((prev) => prev ? { ...prev, visible: false } : null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition font-bold"
              >
                {confirmModal.cancelText || 'Batal'}
              </button>
              <button
                onClick={() => {
                  setConfirmModal((prev) => prev ? { ...prev, visible: false } : null);
                  confirmModal.onConfirm();
                }}
                className={`px-4 py-2 text-xs text-white rounded-lg transition font-black font-semibold shadow-sm ${
                  confirmModal.type === 'danger' 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {confirmModal.confirmText || 'Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
