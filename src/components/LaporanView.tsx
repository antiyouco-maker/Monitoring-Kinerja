/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FileText, Download, Printer, CheckCircle, RefreshCw, Layers, Calendar, Landmark, ShieldHalf } from 'lucide-react';
import { CascadingKinerja, Tujuan, Sasaran, Program, Kegiatan, SubKegiatan, PPTK, SakipSyncLog } from '../types';

interface LaporanViewProps {
  tujuanDb: Tujuan[];
  sasaranDb: Sasaran[];
  programDb: Program[];
  kegiatanDb: Kegiatan[];
  subKegiatanDb: SubKegiatan[];
  pptkDb: PPTK[];
  cascadingData: CascadingKinerja[];
  syncLogs: SakipSyncLog[];
  activeYear: number;
}

export default function LaporanView({
  tujuanDb,
  sasaranDb,
  programDb,
  kegiatanDb,
  subKegiatanDb,
  pptkDb,
  cascadingData,
  syncLogs,
  activeYear,
}: LaporanViewProps) {
  // Report configurations
  const [kepalaDinasNama, setKepalaDinasNama] = useState<string>('Drs. H. Suwenda, M.Si.');
  const [kepalaDinasNip, setKepalaDinasNip] = useState<string>('196904121990031004');
  const [jabatanPenandatangan, setJabatanPenandatangan] = useState<string>('Kepala Dinas Ketahanan Pangan');

  const activeCascades = cascadingData.filter((c) => c.tahun === activeYear);

  // Helper resolvers
  const resolveTujuan = (id: string) => tujuanDb.find(t => t.id === id)?.nama || id;
  const resolveSasaran = (id: string) => sasaranDb.find(s => s.id === id)?.nama || id;
  const resolveProgram = (id: string) => programDb.find(p => p.id === id)?.nama || id;
  const resolveKegiatan = (id: string) => kegiatanDb.find(k => k.id === id)?.nama || id;
  const resolveSubKegiatan = (id: string) => subKegiatanDb.find(sk => sk.id === id)?.nama || id;
  const resolvePptk = (id: string) => {
    const p = pptkDb.find(p => p.id === id);
    return p ? `${p.nama} (NIP. ${p.nip})` : id;
  };

  // 1. Excel Export (Generates CSV formatted for Excel)
  const handleExportExcel = () => {
    // Generate header column of SAKIP Cascading Kinerja
    const headers = [
      'No',
      'Tujuan Strategis',
      'Sasaran Strategis',
      'Program Kerja',
      'Kegiatan',
      'Sub Kegiatan / Indikator',
      'PPTK Penanggung Jawab',
      'Target',
      'Realisasi',
      'Capaian %',
      'Tahun Perencanaan'
    ];

    // Map rows replacing commas to prevent delimiter breaking
    const rows = activeCascades.map((c, idx) => {
      const cleanTuj = resolveTujuan(c.tujuanId).replace(/"/g, '""');
      const cleanSas = resolveSasaran(c.sasaranId).replace(/"/g, '""');
      const cleanPrg = resolveProgram(c.programId).replace(/"/g, '""');
      const cleanKeg = resolveKegiatan(c.kegiatanId).replace(/"/g, '""');
      const cleanSub = resolveSubKegiatan(c.subKegiatanId).replace(/"/g, '""');
      const cleanPptk = resolvePptk(c.pptkId).replace(/"/g, '""');
      const capPct = c.target > 0 ? Math.round((c.realisasi / c.target) * 100) : 0;

      return [
        idx + 1,
        `"${cleanTuj}"`,
        `"${cleanSas}"`,
        `"${cleanPrg}"`,
        `"${cleanKeg}"`,
        `"${cleanSub}"`,
        `"${cleanPptk}"`,
        c.target,
        c.realisasi,
        `${capPct}%`,
        c.tahun
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Create download trigger
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Cascading_DKPP_Indramayu_${activeYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. PDF Print layout (Triggers browser-native print which supports saving into beautifully aligned formal Gov PDF)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div id="laporan-main-view" className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#004882]" />
            Sistem Dokumen Laporan Kinerja
          </h3>
          <p className="text-xs text-slate-500">
            Ekspor matriks cascading kinerja, sasaran program, dan PPTK pengampu ke berkas formal PDF / Excel untuk kepatuhan administrasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm border border-emerald-500"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor format Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#004882] hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Ekspor PDF
          </button>
        </div>
      </div>

      {/* Configuration for Signer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#004882]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Setelan Penandatangan Laporan SAKIP</h4>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Pejabat</label>
          <input
            type="text"
            value={kepalaDinasNama}
            onChange={(e) => setKepalaDinasNama(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-blue-500 font-semibold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status Kepegawaian (NIP)</label>
          <input
            type="text"
            value={kepalaDinasNip}
            onChange={(e) => setKepalaDinasNip(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-blue-500 font-semibold font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Jabatan Penandatangan</label>
          <input
            type="text"
            value={jabatanPenandatangan}
            onChange={(e) => setJabatanPenandatangan(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-blue-500 font-semibold"
          />
        </div>
      </div>

      {/* SAKIP Live Integration Status & Logs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-800">
            Log Sinkronisasi Otomatis SAKIP Real-Time
          </h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sistem ini terhubung langsung dengan REST API Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP) Pemerintah Kabupaten Indramayu.
          Berikut adalah histori transmisi data indikator target, realisasi, dan profil jabatan PPTK pengampu secara aman:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Waktu Sinkronisasi (WIB)</th>
                <th className="py-2 px-3">Jumlah Record Terintegrasi</th>
                <th className="py-2 px-3">Status Koneksi</th>
                <th className="py-2 px-3">Petugas Pemrakarsa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
              {syncLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">
                    {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700">
                    {log.recordsSynced} SAKIP Elements
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-green-150 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
                      SUCCESS ONLINE
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-650">{log.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Paper Document (Kop Surat Instansi) */}
      <div id="printable-area-preview" className="bg-white border-2 border-slate-300 p-4 sm:p-12 max-w-[850px] mx-auto shadow-lg rounded-sm relative overflow-hidden text-black select-text">
        <div className="absolute top-4 right-4 text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 uppercase tracking-wide font-mono select-none hidden sm:block">
          Pratinjau Cetak Formal (Kop Surat Asli)
        </div>

        {/* PRINT STYLES Kop Surat */}
        <div className="flex items-center justify-between border-b-[3px] border-double border-black pb-4 mb-6">
          {/* Badge Indramayu kabupaten */}
          <div className="w-20 h-20 bg-slate-150 rounded flex items-center justify-center border border-dashed border-slate-400">
            <span className="text-[10px] font-bold text-slate-400">LOGO KAB</span>
          </div>
          <div className="text-center flex-1 pr-6 flex flex-col items-center">
            <h3 className="text-base font-bold uppercase tracking-wide leading-tight">PEMERINTAH KABUPATEN INDRAMAYU</h3>
            <h2 className="text-lg font-extrabold uppercase leading-tight tracking-wider">DINAS KETAHANAN PANGAN DAN PERTANIAN</h2>
            <p className="text-[10px] text-zinc-600 mt-1 leading-normal italic text-center">
              Jalan Jenderal Sudirman No. 12 Indramayu CP 45226 • Telepon (0234) 272111<br />
              Email: dkpp@indramayukab.go.id • Website: dkpp.indramayukab.go.id
            </p>
          </div>
        </div>

        {/* Report core body */}
        <div className="text-center space-y-1 mb-8">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-black underline">
            LAPORAN CASCADING KINERJA BULANAN (LKJIP SAKIP)
          </h4>
          <p className="text-xs uppercase font-medium">
            TAHUN PERENCANAAN: {activeYear} (STATUS: BAIK)
          </p>
        </div>

        {/* Report table */}
        <div className="mb-10 text-xs overflow-x-auto">
          <table className="w-full text-left border border-black text-[10px] leading-snug min-w-[600px]">
            <thead>
              <tr className="bg-slate-100 text-black border-b border-black uppercase font-bold text-center">
                <th className="py-2 px-1 w-8 border-r border-black font-bold">No</th>
                <th className="py-2 px-2 border-r border-black font-bold text-left">Nama Sub Kegiatan / PPTK Pengampu</th>
                <th className="py-2 px-2 border-r border-black font-bold text-left">Metrik Sasaran Kerja SAKIP</th>
                <th className="py-2 px-2 border-r border-black font-bold">Target</th>
                <th className="py-2 px-2 border-r border-black font-bold">Realisasi</th>
                <th className="py-2 px-2 font-bold">Capaian %</th>
              </tr>
            </thead>
            <tbody>
              {activeCascades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 italic text-slate-500">
                    Tidak ada record cascading kinerja untuk tahun rencana {activeYear}. Silakan tambahkan cascading terlebih dahulu.
                  </td>
                </tr>
              ) : (
                activeCascades.map((c, index) => {
                  const sKegName = resolveSubKegiatan(c.subKegiatanId);
                  const pptkName = pptkDb.find(p => p.id === c.pptkId)?.nama || c.pptkId;
                  const pptkNip = pptkDb.find(p => p.id === c.pptkId)?.nip || '-';
                  const pct = c.target > 0 ? Math.round((c.realisasi / c.target) * 100) : 0;

                  return (
                    <tr key={c.id} className="border-b border-black">
                      <td className="py-2.5 px-1 text-center font-bold border-r border-black">{index + 1}</td>
                      <td className="py-2.5 px-2 border-r border-black">
                        <p className="font-extrabold text-black uppercase">{c.keterangan}</p>
                        <p className="text-[8px] text-zinc-600 font-mono mt-0.5">PJ: {pptkName} (NIP. {pptkNip})</p>
                      </td>
                      <td className="py-2.5 px-2 border-r border-black leading-tight text-neutral-800">
                        {sKegName}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-black font-bold">{c.target} {c.satuan}</td>
                      <td className="py-2.5 px-2 text-center border-r border-black font-bold text-slate-900">{c.realisasi} {c.satuan}</td>
                      <td className="py-2.5 px-2 text-center font-black">{pct}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legal Signatures */}
        <div className="flex justify-between text-xs pt-4">
          <div className="text-left leading-normal">
            <span className="block italic text-[10px] text-slate-400 select-none">Tanda Tangan Lapangan</span>
            <p className="font-bold text-black mt-1">Pengawas Bidang,</p>
            <div className="h-16"></div>
            <p className="font-bold border-b border-black w-44">{pptkDb[0]?.nama || 'Pemeriksa SAKIP'}</p>
            <p className="text-[9px] text-zinc-650">NIP. {pptkDb[0]?.nip || '-'}</p>
          </div>

          <div className="text-right leading-normal">
            <span className="block text-[10px] text-zinc-700">Indramayu, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <p className="font-bold text-black mt-1">{jabatanPenandatangan},</p>
            <div className="h-16"></div>
            <p className="font-bold border-b border-black w-56 text-right inline-block">{kepalaDinasNama}</p>
            <p className="text-[9px] text-zinc-650">NIP. {kepalaDinasNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
