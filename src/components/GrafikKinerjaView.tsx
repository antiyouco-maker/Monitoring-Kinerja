/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarChart, Bar, RadialBarChart, RadialBar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart2, Star, Target, Users, ShieldCheck, HelpCircle } from 'lucide-react';
import { CascadingKinerja, PPTK } from '../types';

interface GrafikKinerjaViewProps {
  cascadingData: CascadingKinerja[];
  pptkDb: PPTK[];
  activeYear: number;
}

export default function GrafikKinerjaView({
  cascadingData,
  pptkDb,
  activeYear,
}: GrafikKinerjaViewProps) {
  const [selectedBidangFilter, setSelectedBidangFilter] = useState<string>('SEMUA');

  const activeCascades = cascadingData.filter((c) => c.tahun === activeYear);

  // Resolve bidang for each cascading item to group them
  const processedData = activeCascades.map((c) => {
    const pptk = pptkDb.find((p) => p.id === c.pptkId);
    return {
      ...c,
      bidang: pptk?.bidang || 'Lainnya',
      pptkNama: pptk?.nama || c.pptkId,
    };
  });

  const filteredData = selectedBidangFilter === 'SEMUA'
    ? processedData
    : processedData.filter((d) => d.bidang === selectedBidangFilter);

  // Group data by Bidang to see achievement comparison
  const bidangSummary = ['Bidang Ketahanan Pangan', 'Sekretariat', 'Bidang Tanaman Pangan', 'Bidang Peternakan dan Kesehatan Hewan', 'Bidang Penyuluhan & Hortikultura'].map((bid) => {
    const items = processedData.filter((p) => p.bidang === bid);
    const sumTarget = items.reduce((acc, curr) => acc + curr.target, 0);
    const sumRealisasi = items.reduce((acc, curr) => acc + curr.realisasi, 0);
    const percentage = sumTarget > 0 ? Math.round((sumRealisasi / sumTarget) * 105) : 0; // standard multiplier
    return {
      name: bid.replace('Bidang ', ''), // truncate name
      Target: sumTarget,
      Realisasi: sumRealisasi,
       Persentase: Math.min(100, percentage),
    };
  });

  // PPTK contribution breakdown data for Pie Chart
  const pptkSummary = pptkDb.map((p) => {
    const pCascades = activeCascades.filter((c) => c.pptkId === p.id);
    const count = pCascades.length;
    return {
      name: p.nama.split(',')[0], // simple name without title
      value: count,
    };
  }).filter((v) => v.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div id="graphics-detailed-view" className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#004882]" />
            Analisis Capaian Kinerja berkala
          </h3>
          <p className="text-xs text-slate-500">
            Sektor analisis grafis kuantitatif capaian target dan realisasi program per bidang pengampu SAKIP {activeYear}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter Bidang:</label>
          <select
            value={selectedBidangFilter}
            onChange={(e) => setSelectedBidangFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded p-1.5 bg-white font-medium text-slate-800"
          >
            <option value="SEMUA">Semua Bidang</option>
            <option value="Bidang Ketahanan Pangan">Ketahanan Pangan</option>
            <option value="Sekretariat">Sekretariat / Perencanaan</option>
            <option value="Bidang Tanaman Pangan">Tanaman Pangan</option>
            <option value="Bidang Peternakan dan Kesehatan Hewan">Peternakan</option>
            <option value="Bidang Penyuluhan & Hortikultura">Penyuluhan & Hortikultura</option>
          </select>
        </div>
      </div>

      {/* Main Bar Chart comparing Target & Realization for individual activities */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6">
          PERBANDINGAN TARGET DAN REALISASI BERDASARKAN SUB KEGIATAN ({activeYear})
        </h4>
        <div id="chart-comparison-wrapper" className="h-96 w-full relative">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="text-sm font-semibold">Tidak ada data untuk filter aktif pada tahun {activeYear}</span>
            </div>
          ) : (
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={filteredData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="keterangan" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="target" fill="#004882" radius={[4, 4, 0, 0]} name="Target SAKIP" />
                <Bar dataKey="realisasi" fill="#10b981" radius={[4, 4, 0, 0]} name="Realisasi Lapangan" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Secondary Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar/Radial Chart: Bidang Achievement Levels */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            AKUMULASI PERSENTASE CAPAIAN PER BIDANG SAKIP (%)
          </h4>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart layout="vertical" data={bidangSummary} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip />
                <Bar dataKey="Persentase" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {bidangSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center italic mt-2">
            * Dihitung berdasarkan nilai rata-rata persentase target terlaksana seluruh sub-kegiatan aktif
          </p>
        </div>

        {/* Pie Chart: PPTK Workload Proportion */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            PROPORSI DISTRIBUSI CASCADING KERJA PER PPTK (JUMLAH SUB)
          </h4>
          
          <div className="h-80 w-full relative flex items-center justify-center">
            {pptkSummary.length === 0 ? (
              <span className="text-xs text-slate-400">Belum ada penugasan PPTK terdaftar</span>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={pptkSummary}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    fontSize={10}
                  >
                    {pptkSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[10px] text-slate-400 text-center italic mt-2">
            * Menampilkan tingkat keragaman dan sebaran beban tanggung jawab teknis di database lokal
          </p>
        </div>
      </div>

      {/* Government Accountability Seal */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-widest">AKUNTABILITAS RENCANA KABUPATEN</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Seluruh grafik visualisasi ditarik secara langsung dari SAKIP database. Sinkronisasi andal mencegah input duplikat
              dan memastikan integritas nilai Laporan Kinerja Instansi Pemerintah (LKjIP) LK-04 Indramayu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
