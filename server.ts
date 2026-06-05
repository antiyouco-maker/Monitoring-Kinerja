/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Start server function
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Let's use standard body parser for handling SAKIP databases
  app.use(express.json({ limit: '15mb' }));

  // File system persistent store path
  const STORE_PATH = path.join(process.cwd(), 'dkpp_local_store.json');

  // Let's import defaults dynamically to avoid circular issues
  const loadDefaultDb = () => {
    // Standard fallbacks in case import isn't fully ready
    return {
      tujuan: [
        { id: 'T1', kode: 'TUJ.01', nama: 'Meningkatkan Kedaulatan, Kemandirian, dan Ketahanan Pangan Daerah' },
        { id: 'T2', kode: 'TUJ.02', nama: 'Meningkatkan Produktivitas, Nilai Tambah, dan Daya Saing Sektor Pertanian' },
        { id: 'T3', kode: 'TUJ.03', nama: 'Meningkatkan Akuntabilitas Kinerja dan Kualitas Pelayanan Publik Perangkat Daerah' }
      ],
      sasaran: [
        {
          id: 'S1',
          tujuanId: 'T1',
          kode: 'SAS.01',
          nama: 'Meningkatnya Ketersediaan dan Kemudahan Akses Pangan Masyarakat',
          indikatorList: [
            { id: 'IND_S1', indikator: 'Skor Pola Pangan Harapan Tingkat Ketersediaan', target: '96.9', target2025: '96.7', target2026: '96.9', target2027: '97.1', target2028: '97.3', target2029: '97.5', target2030: '97.7' }
          ]
        },
        {
          id: 'S2',
          tujuanId: 'T1',
          kode: 'SAS.02',
          nama: 'Terwujudnya Diversifikasi dan Kenyamanan Konsumsi Pangan Sesuai Standar Keamanan',
          indikatorList: [
            { id: 'IND_S2', indikator: 'Skor Pola Pangan Harapan Tingkat Konsumsi', target: '96.0', target2025: '95.8', target2026: '96.0', target2027: '96.2', target2028: '96.4', target2029: '96.6', target2030: '96.8' }
          ]
        },
        {
          id: 'S3',
          tujuanId: 'T2',
          kode: 'SAS.03',
          nama: 'Meningkatnya Produksi, Produktivitas, dan Mutu Hasil Komoditas Pertanian',
          indikatorList: [
            { id: 'IND_S3_1', indikator: 'Tingkat Produktivitas Tanaman Pangan', target: '70.6', target2025: '70.5', target2026: '70.6', target2027: '70.7', target2028: '70.8', target2029: '70.9', target2030: '71.0' },
            { id: 'IND_S3_2', indikator: 'Tingkat Produktivitas Hortikultura', target: '160', target2025: '150', target2026: '160', target2027: '170', target2028: '180', target2029: '190', target2030: '200' },
            { id: 'IND_S3_3', indikator: 'Tingkat Produktivitas Perkebunan', target: '48.5', target2025: '48', target2026: '48.5', target2027: '49', target2028: '49.5', target2029: '50', target2030: '50.5' }
          ]
        },
        {
          id: 'S4',
          tujuanId: 'T2',
          kode: 'SAS.04',
          nama: 'Meningkatnya Populasi Terlindungi dan Produktivitas Peternakan',
          indikatorList: [
            { id: 'IND_S4', indikator: 'Tingkat Produksi Ternak', target: '78184.01', target2025: '77028.58', target2026: '78184.01', target2027: '79356.77', target2028: '80547.12', target2029: '81755.33', target2030: '82981.66' }
          ]
        },
        {
          id: 'S5',
          tujuanId: 'T3',
          kode: 'SAS.05',
          nama: 'Meningkatnya Nilai Akuntabilitas Kinerja Instansi Pemerintah (AKIP) Perangkat Daerah',
          indikatorList: [
            { id: 'IND_S5', indikator: 'Nilai Evaluasi SAKIP Perangkat Daerah', target: '78.61', target2025: '78.11', target2026: '78.61', target2027: '79.11', target2028: '79.61', target2029: '80.11', target2030: '80.61' }
          ]
        }
      ],
      program: [
        { id: 'P1', sasaranId: 'S1', kode: 'PRG.01', nama: 'Program Penyediaan dan Penyaluran Pangan', indikator: 'Persentase Penyediaan Pangan Kontinjensi/Cadangan', target: '94%' },
        { id: 'P2', sasaranId: 'S2', kode: 'PRG.02', nama: 'Program Peningkatan Diversifikasi dan Keamanan Konsumsi Pangan', indikator: 'Skor Pola Pangan Harapan (PPH) Konsumsi', target: '96' },
        { id: 'P3', sasaranId: 'S3', kode: 'PRG.03', nama: 'Program Penyediaan dan Pengembangan Prasarana dan Sarana Pertanian', indikator: 'Persentase Infrastruktur Jalan Usaha Tani Layak', target: '85%' },
        { id: 'P4', sasaranId: 'S3', kode: 'PRG.04', nama: 'Program Perencanaan dan Penyuluhan Pertanian', indikator: 'Persentase Kelompok Tani dengan Kategori Madya', target: '73%' },
        { id: 'P5', sasaranId: 'S5', kode: 'PRG.05', nama: 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota', indikator: 'Nilai Evaluasi Akuntabilitas Kinerja (SAKIP)', target: 'BB' }
      ],
      kegiatan: [
        { id: 'K1', programId: 'P1', kode: 'KEG.01', nama: 'Pengelolaan Cadangan Pangan Pemerintah Daerah', indikator: 'Jumlah Pengelolaan Keberlanjutan Cadangan Pangan Pemerintah Daerah', target: '1 Laporan' },
        { id: 'K2', programId: 'P1', kode: 'KEG.02', nama: 'Penyediaan dan Penyaluran Pangan Pokok Lainnya', indikator: 'Persentase Stabilitas Pasokan Pangan Pokok Daerah Terjaga', target: '100%' },
        { id: 'K3', programId: 'P2', kode: 'KEG.03', nama: 'Pembinaan Penerapan Kaidah Keamanan Pangan', indikator: 'Jumlah Pengawasan Mutu Pangan Segar Asal Tumbuhan (PSAT)', target: '25 Sertifikat' },
        { id: 'K4', programId: 'P2', kode: 'KEG.04', nama: 'Penganekaragaman Konsumsi Pangan Berbasis Sumber Daya Lokal', indikator: 'Jumlah Sosialisasi Standar Konsumsi Pola Pangan Harapan', target: '12 Kali' },
        { id: 'K5', programId: 'P3', kode: 'KEG.05', nama: 'Pengelolaan Air Irigasi untuk Pertanian Tingkat Usaha Tani', indikator: 'Persentase Layanan Irigasi Usaha Tani Optimal Terfasilitasi', target: '90%' },
        { id: 'K6', programId: 'P3', kode: 'KEG.06', nama: 'Penyediaan dan Rehabilitasi Jalan Usaha Tani (JUT)', indikator: 'Jumlah Pembangunan dan Rehabilitasi Jalan Usaha Tani (JUT)', target: '6 Titik' },
        { id: 'K7', programId: 'P4', kode: 'KEG.07', nama: 'Peningkatan Kapasitas Kelembagaan Penyuluhan Pertanian', indikator: 'Jumlah Fasilitasi Kelompok Tani Mandiri Binaan Provinsi', target: '160 Poktan' },
        { id: 'K8', programId: 'P5', kode: 'KEG.08', nama: 'Administrasi Keuangan Perangkat Daerah', indikator: 'Persentase Pertanggungjawaban Keuangan Tepat Waktu', target: '100%' },
        { id: 'K9', programId: 'P5', kode: 'KEG.09', nama: 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah', indikator: 'Jumlah Dokumen Laporan Kinerja LKjIP dan SAKIP Penyusunan', target: '1 Dokumen' },
        { id: 'K10', programId: 'P5', kode: 'KEG.10', nama: 'Penyediaan Jasa Penunjang Urusan Pemerintahan Daerah', indikator: 'Persentase Operasional Perkantoran & Sarpras Terpenuhi', target: '100%' }
      ],
      sub_kegiatan: [
        { id: 'SK1', kegiatanId: 'K1', kode: 'SUB.01.01', nama: 'Pengadaan Pangan Cadangan Pemerintah Kabupaten Indramayu' },
        { id: 'SK2', kegiatanId: 'K1', kode: 'SUB.01.02', nama: 'Penyediaan Tempat Penyimpanan/Gudang Cadangan Pangan' },
        { id: 'SK3', kegiatanId: 'K2', kode: 'SUB.02.01', nama: 'Penyaluran Cadangan Pangan Pemerintah Daerah dalam Rangka Tanggap Darurat Bencana' },
        { id: 'SK4', kegiatanId: 'K3', kode: 'SUB.03.01', nama: 'Pengawasan dan Pembinaan Keamanan Pangan Segar Asal Tumbuhan (PSAT)' },
        { id: 'SK5', kegiatanId: 'K4', kode: 'SUB.04.01', nama: 'Pemberdayaan Masyarakat dalam Diversifikasi Konsumsi Pangan Berbasis Bahan Baku Lokal' },
        { id: 'SK6', kegiatanId: 'K5', kode: 'SUB.05.01', nama: 'Rehabilitasi Jaringan Irigasi Usaha Tani (JIUT)' },
        { id: 'SK7', kegiatanId: 'K6', kode: 'SUB.06.01', nama: 'Pembangunan dan Pemeliharaan Jalan Usaha Tani (JUT)' },
        { id: 'SK8', kegiatanId: 'K7', kode: 'SUB.07.01', nama: 'Penyuluhan Mandiri Pertanian, Perkebunan dan Peternakan Berkelanjutan' },
        { id: 'SK9', kegiatanId: 'K7', kode: 'SUB.07.02', nama: 'Fasilitasi Kelompok Tani dan Gabungan Kelompok Tani (Gapoktan) Mandiri' },
        { id: 'SK10', kegiatanId: 'K8', kode: 'SUB.08.01', nama: 'Penyusunan Laporan Pertanggungjawaban dan Keuangan Akhir Tahun Dinas' },
        { id: 'SK11', kegiatanId: 'K8', kode: 'SUB.08.02', nama: 'Pelaksanaan Penatausahaan, Verifikasi Buku Kas, dan Pengujian Pengeluaran SKPD' },
        { id: 'SK12', kegiatanId: 'K9', kode: 'SUB.09.01', nama: 'Penyusunan Dokumen Evaluasi Kinerja dan SAKIP Terpadu (LKjIP, Renstra, Renja)' },
        { id: 'SK13', kegiatanId: 'K10', kode: 'SUB.10.01', nama: 'Penyediaan Jasa Komunikasi, Resource Penunjang, Sumber Daya Air dan Listrik Dinas' },
        { id: 'SK14', kegiatanId: 'K10', kode: 'SUB.10.02', nama: 'Penyediaan Sarana, Prasarana Peralatan dan Perlengkapan Logistik Kantor Dinas' },
        { id: 'SK15', kegiatanId: 'K10', kode: 'SUB.10.03', nama: 'Penyediaan Jasa Pemeliharaan Rutin Kendaraan Dinas Jabatan dan Pemeliharaan Aset' }
      ],
      pptk: [
        { id: 'PPTK1', nama: 'H. Sudarsono, S.T., M.Si.', nip: '197410022002121004', jabatan: 'Kepala Bidang Ketahanan Pangan', bidang: 'Bidang Ketahanan Pangan' },
        { id: 'PPTK2', nama: 'Hj. Endang Sri Mulyani, S.P., M.P.', nip: '197905142006042011', jabatan: 'Kasubag Perencanaan dan Evaluasi', bidang: 'Sekretariat' },
        { id: 'PPTK3', nama: 'Ir. Agus Sulaeman, M.MA.', nip: '197108251998031005', jabatan: 'Kepala Bidang Tanaman Pangan', bidang: 'Bidang Tanaman Pangan' },
        { id: 'PPTK4', nama: 'Drh. Iwan Setiawan', nip: '198203042009031002', jabatan: 'Kepala Bidang Peternakan dan Kesehatan Hewan', bidang: 'Bidang Peternakan dan Kesehatan Hewan' },
        { id: 'PPTK5', nama: 'Rita Sri Hartini, S.Hut.', nip: '197607112005012015', jabatan: 'Kepala Bidang Penyuluhan & Hortikultura', bidang: 'Bidang Penyuluhan & Hortikultura' }
      ],
      cascading: [
        { id: 'C1', tujuanId: 'T1', sasaranId: 'S1', programId: 'P1', kegiatanId: 'K1', subKegiatanId: 'SK1', pptkId: 'PPTK1', tahun: 2026, target: 120, realisasi: 120, satuan: 'Ton', keterangan: 'Pengadaan Cadangan Beras Pemerintah Daerah Kabupaten Indramayu untuk menjamin stabilitas pasokan' },
        { id: 'C2', tujuanId: 'T1', sasaranId: 'S1', programId: 'P1', kegiatanId: 'K1', subKegiatanId: 'SK2', pptkId: 'PPTK1', tahun: 2026, target: 3, realisasi: 3, satuan: 'Unit', keterangan: 'Rehabilitasi dan penyediaan gudang logistik penyimpanan cadangan beras pangan' },
        { id: 'C3', tujuanId: 'T1', sasaranId: 'S2', programId: 'P2', kegiatanId: 'K3', subKegiatanId: 'SK4', pptkId: 'PPTK1', tahun: 2026, target: 25, realisasi: 24, satuan: 'Sertifikat', keterangan: 'Sertifikasi registrasi pangan segar asal tumbuhan (PSAT) prima-3 untuk jaminan mutu' },
        { id: 'C4', tujuanId: 'T2', sasaranId: 'S3', programId: 'P3', kegiatanId: 'K5', subKegiatanId: 'SK6', pptkId: 'PPTK3', tahun: 2026, target: 10, realisasi: 10, satuan: 'Lokasi', keterangan: 'Pembangunan Jaringan Irigasi Usaha Tani (JIUT) untuk meningkatkan cakupan pengairan sawah' },
        { id: 'C5', tujuanId: 'T2', sasaranId: 'S3', programId: 'P3', kegiatanId: 'K6', subKegiatanId: 'SK7', pptkId: 'PPTK3', tahun: 2026, target: 6, realisasi: 5, satuan: 'Titik', keterangan: 'Pembangunan Jalan Usaha Tani (JUT) untuk mempermudah mobilisasi hasil panen' },
        { id: 'C6', tujuanId: 'T2', sasaranId: 'S3', programId: 'P4', kegiatanId: 'K7', subKegiatanId: 'SK8', pptkId: 'PPTK5', tahun: 2026, target: 160, realisasi: 155, satuan: 'Kelompok Tani', keterangan: 'Penyuluhan pertanian model berkelanjutan guna meningkatkan produktivitas hortikultura' },
        { id: 'C7', tujuanId: 'T3', sasaranId: 'S5', programId: 'P5', kegiatanId: 'K8', subKegiatanId: 'SK11', pptkId: 'PPTK2', tahun: 2026, target: 100, realisasi: 100, satuan: '%', keterangan: 'Pengujian, verifikasi SPP-SPM, dan penatausahaan administrasi keuangan dinas secara tertib' },
        { id: 'C8', tujuanId: 'T3', sasaranId: 'S5', programId: 'P5', kegiatanId: 'K9', subKegiatanId: 'SK12', pptkId: 'PPTK2', tahun: 2026, target: 1, realisasi: 1, satuan: 'Dokumen', keterangan: 'Penyusunan dokumen evaluasi capaian LKjIP, LKPJ, dan fasilitasi penilaian AKIP Kab. Indramayu' },
        { id: 'C9', tujuanId: 'T3', sasaranId: 'S5', programId: 'P5', kegiatanId: 'K10', subKegiatanId: 'SK13', pptkId: 'PPTK2', tahun: 2026, target: 12, realisasi: 12, satuan: 'Bulan', keterangan: 'Pembayaran tagihan air, listrik, telepon, internet, dan jasa komunikasi penunjang operasional dinas' },
        { id: 'C10', tujuanId: 'T3', sasaranId: 'S5', programId: 'P5', kegiatanId: 'K10', subKegiatanId: 'SK15', pptkId: 'PPTK2', tahun: 2026, target: 15, realisasi: 14, satuan: 'Unit', keterangan: 'Pemeliharaan rutin kendaraan operasional roda empat dan roda dua penunjang petugas lapang' }
      ],
      iku: [
        { id: 'IKU1', kode: 'IKU.01', nama: 'Skor Pola Pangan Harapan Tingkat Ketersediaan', satuan: 'Skor', penanggungjawab: 'KDP', targets: { 2025: 96.7, 2026: 96.9, 2027: 97.1, 2028: 97.3, 2029: 97.5, 2030: 97.7 }, realisasi: { 2025: 96.7, 2026: 96.9, 2027: 97.1, 2028: 97.2, 2029: 97.5 } },
        { id: 'IKU2', kode: 'IKU.02', nama: 'Skor Pola Pangan Harapan Tingkat Konsumsi', satuan: 'Skor', penanggungjawab: 'KKP', targets: { 2025: 95.8, 2026: 96.0, 2027: 96.2, 2028: 96.4, 2029: 96.6, 2030: 96.8 }, realisasi: { 2025: 95.8, 2026: 95.9, 2027: 96.2 } },
        { id: 'IKU3', kode: 'IKU.03', nama: 'Tingkat Produktivitas Tanaman Pangan', satuan: 'Kw/Ha', penanggungjawab: 'TANAMAN PANGAN', targets: { 2025: 70.5, 2026: 70.6, 2027: 70.7, 2028: 70.8, 2029: 70.9, 2030: 71.0 }, realisasi: { 2025: 70.5, 2026: 70.6 } },
        { id: 'IKU4', kode: 'IKU.04', nama: 'Tingkat Produktivitas Hortikultura', satuan: 'Kw/Ha', penanggungjawab: 'HORTIBUNLUH', targets: { 2025: 150, 2026: 160, 2027: 170, 2028: 180, 2029: 190, 2030: 200 }, realisasi: { 2025: 150, 2026: 158 } },
        { id: 'IKU5', kode: 'IKU.05', nama: 'Tingkat Produktivitas Perkebunan', satuan: 'Ton/Ha', penanggungjawab: 'HORTIBUNLUH', targets: { 2025: 48, 2026: 48.5, 2027: 49, 2028: 49.5, 2029: 50, 2030: 50.5 }, realisasi: { 2025: 48, 2026: 48.2 } },
        { id: 'IKU6', kode: 'IKU.06', nama: 'Tingkat Produksi Ternak', satuan: 'Ton', penanggungjawab: 'PRODNAK DAN KESWAN', targets: { 2025: 77028.58, 2026: 78184.01, 2027: 79356.77, 2028: 80547.12, 2029: 81755.33, 2030: 82981.66 }, realisasi: { 2025: 77028.58, 2026: 78012.5 } },
        { id: 'IKU7', kode: 'IKU.07', nama: 'Nilai Evaluasi SAKIP Perangkat Daerah', satuan: 'Poin', penanggungjawab: 'SEKRETARIAT', targets: { 2025: 78.11, 2026: 78.61, 2027: 79.11, 2028: 79.61, 2029: 80.11, 2030: 80.61 }, realisasi: { 2025: 78.11, 2026: 78.50 } }
      ],
      ikk: [
        { id: 'IKK1', kode: 'IKK.01', nama: 'Persentase ketersediaan pangan (Tersedianya cadangan beras/ jagung sesuai kebutuhan)', satuan: '%', penanggungjawab: 'KDP', targets: { 2025: 15, 2026: 20, 2027: 21, 2028: 22, 2029: 23, 2030: 25 }, realisasi: { 2025: 15, 2026: 20 } },
        { id: 'IKK2', kode: 'IKK.02', nama: 'Produktivitas pertanian per hektar per tahun', satuan: 'Ton/Ha', penanggungjawab: 'TANAMAN PANGAN', targets: { 2025: 66.95, 2026: 68.92, 2027: 69.26, 2028: 69.6, 2029: 69.94, 2030: 70.28 }, realisasi: { 2025: 66.95, 2026: 68.92 } },
        { id: 'IKK3', kode: 'IKK.03', nama: 'Persentase Penurunan kejadian dan jumlah kasus penyakit hewan menular', satuan: '%', penanggungjawab: 'KESWAN', targets: { 2025: -5, 2026: -5, 2027: -5, 2028: -5, 2029: -5, 2030: -5 }, realisasi: { 2025: -5, 2026: -5 } },
        { id: 'IKK4', kode: 'IKK.04', nama: 'Persentase kinerja realisasi pupuk', satuan: '%', penanggungjawab: 'TANAMAN PANGAN', targets: { 2025: 100, 2026: 100, 2027: 100, 2028: 100, 2029: 100, 2030: 100 }, realisasi: { 2025: 100, 2026: 100 } },
        { id: 'IKK5', kode: 'IKK.05', nama: 'Indeks Ketahanan Pangan', satuan: 'Angka', penanggungjawab: 'KDP', targets: { 2025: 86.82, 2026: 87.12, 2027: 87.42, 2028: 87.72, 2029: 88.02, 2030: 88.32 }, realisasi: { 2025: 86.82, 2026: 87.10 } },
        { id: 'IKK6', kode: 'IKK.06', nama: 'Prevalensi Ketidakcukupan Konsumsi Pangan', satuan: '%', penanggungjawab: 'KESWAN', targets: { 2025: 90.68, 2026: 90.72, 2027: 90.77, 2028: 90.81, 2029: 90.86, 2030: 90.9 }, realisasi: { 2025: 90.68, 2026: 90.72 } }
      ],
      sync_logs: [
        { id: 'LOG1', timestamp: '2026-06-05T08:30:15Z', recordsSynced: 34, status: 'SUCCESS', triggeredBy: 'NodeJS Backend Loader' }
      ]
    };
  };

  // Safe file reader/writer helpers
  const readDbFile = () => {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const fileContent = fs.readFileSync(STORE_PATH, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Failed to read db store from file system', e);
    }
    const defaultData = loadDefaultDb();
    writeDbFile(defaultData);
    return defaultData;
  };

  const writeDbFile = (data: any) => {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db store to file system', e);
    }
  };

  // API 1: GET FULL DB
  app.get('/api/db', (req, res) => {
    const db = readDbFile();
    res.json(db);
  });

  // API 2: SAVE INDIVIDUAL KEY
  app.post('/api/db/save', (req, res) => {
    const { key, data } = req.body;
    if (!key || !data) {
      res.status(400).json({ error: 'Missing key or data' });
      return;
    }

    const db = readDbFile();
    db[key] = data;
    writeDbFile(db);
    res.json({ success: true, key });
  });

  // API 3: EXECUTE SAKIP SYNC
  app.post('/api/db/sync', (req, res) => {
    const triggeredBy = req.body.triggeredBy || 'Manual SAKIP Syncer';
    const db = readDbFile();

    let updatedCount = 0;
    const hasSyncedExtra = db.sub_kegiatan.some((sk: any) => sk.id === 'SK_SAKIP_NEW');
    
    if (!hasSyncedExtra) {
      const newT = { id: 'T3', kode: 'TUJ.03', nama: 'Meningkatkan Tata Kelola Pemerintahan Sub Sektor Ketahanan Pangan Terintegrasi SAKIP' };
      const newS = { id: 'S5', tujuanId: 'T3', kode: 'SAS.05', nama: 'Meningkatnya Akuntabilitas Kinerja Satuan Kerja Dinas Pertanian' };
      const newP = { id: 'P5', sasaranId: 'S5', kode: 'PRG.05', nama: 'Program Akuntabilitas Pengelolaan Pangan SAKIP' };
      const newK = { id: 'K6', programId: 'P5', kode: 'KEG.06', nama: 'Sinkronisasi Real-Time Capaian Kinerja Kecamatan dan Kabupaten' };
      const newSK = { id: 'SK_SAKIP_NEW', kegiatanId: 'K6', kode: 'SUB.06.01', nama: 'Pengelolaan Integrasi Evaluasi LKjIP SAKIP dan Dashboard Terpadu' };

      // Ensure duplicates aren't created
      if (!db.tujuan.some((t: any) => t.id === 'T3')) db.tujuan.push(newT);
      if (!db.sasaran.some((s: any) => s.id === 'S5')) db.sasaran.push(newS);
      if (!db.program.some((p: any) => p.id === 'P5')) db.program.push(newP);
      if (!db.kegiatan.some((k: any) => k.id === 'K6')) db.kegiatan.push(newK);
      db.sub_kegiatan.push(newSK);
      updatedCount = 5;
    }

    const newLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      recordsSynced: updatedCount === 0 ? 34 : 39,
      status: 'SUCCESS',
      triggeredBy
    };

    db.sync_logs = [newLog, ...(db.sync_logs || [])];
    writeDbFile(db);

    res.json({
      success: true,
      updatedMasterCount: updatedCount,
      db
    });
  });

  // API 4: RESET STORE
  app.post('/api/db/reset', (req, res) => {
    const defaults = loadDefaultDb();
    writeDbFile(defaults);
    res.json({ success: true, db: defaults });
  });

  // API 5: AUTOMATED PERFORMANCE EVALUATION WITH GEMINI SDK
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(403).json({ 
          error: 'Gemini API Key belum dikonfigurasi. Silahkan atur GEMINI_API_KEY di menu panel Settings > Secrets.' 
        });
        return;
      }

      const db = readDbFile();
      const currentYear = req.body.year || 2026;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare contextual data for Gemini prompt
      const summaryIKU = db.iku.map((i: any) => `- ${i.kode}: ${i.nama} (Target ${currentYear}: ${i.targets[currentYear]} ${i.satuan} | Realisasi: ${i.realisasi[currentYear] !== undefined ? i.realisasi[currentYear] : 'Belum Terdata'})`).join('\n');
      const summaryIKK = db.ikk.map((i: any) => `- ${i.kode}: ${i.nama} (Target ${currentYear}: ${i.targets[currentYear]} ${i.satuan} | Realisasi: ${i.realisasi[currentYear] !== undefined ? i.realisasi[currentYear] : 'Belum Terdata'})`).join('\n');
      
      const cascadingYear = db.cascading.filter((c: any) => c.tahun === Number(currentYear));
      const summaryCascading = cascadingYear.map((c: any) => `- Sub-kegiatan: ${c.keterangan}. Target: ${c.target} ${c.satuan}, Realisasi: ${c.realisasi} ${c.satuan}`).join('\n');

      const systemPrompt = `Anda adalah konsultan ahli SAKIP (Sistem Akuntabilitas Kinerja Instansi Pemerintah) Kementerian PANRB yang ditugaskan mendukung Dinas Ketahanan Pangan dan Pertanian (DKPP) Kabupaten Indramayu. 
Tujuan analisis ini adalah memberikan evaluasi capaian kinerja strategis, mendeteksi hambatan taktis, dan menyusun 3 rekomendasi aksi konkret yang logis, profesional, berwibawa, dan siap diimplementasikan untuk mempertahankan predikat kinerja SAKIP terbaik (Target: BB/A). Use bahasa Indonesia only. Jangan gunakan markdown yang terlalu rumit. Berikan poin-poin yang mudah dibaca langsung oleh bupati atau kepala dinas.`;

      const userPrompt = `Lakukan evaluasi terpadu untuk data SAKIP DKPP Indramayu Tahun Perencanaan ${currentYear} berikut:

DATA INDIKATOR KINERJA UTAMA (IKU):
${summaryIKU}

DATA INDIKATOR KINERJA KEGIATAN (IKK):
${summaryIKK}

CASCADING REALISASI LAPANGAN:
${summaryCascading}

Buatlah laporan analisis ringkas dan padat yang terbagi ke dalam:
1. **Ringkasan Capaian Strategis** (Evaluasi IKU/IKK apa saja yang tercapai optimal atau butuh perhatian)
2. **Identifikasi Hambatan Taktis** (Tinjau dari keselarasan program & PPTK pengampu)
3. **3 Langkah Strategis Perbaikan** (Rekomendasi nyata untuk peningkatan nilai SAKIP Indramayu)`;

      const geminiResult = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.75
        }
      });

      res.json({
        success: true,
        analysis: geminiResult.text || 'Gagal menghasilkan ulasan analisis ulasan SAKIP.'
      });

    } catch (e: any) {
      console.error('Gemini SAKIP evaluation failed', e);
      res.status(500).json({ error: `Evaluasi AI Gagal: ${e.message || e}` });
    }
  });

  // Serve static UI assets and handle dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 and PORT 3000 as required
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Node.js SAKIP DKPP Indramayu aktif di http://localhost:${PORT}`);
  });
}

// Boot up server
startServer().catch((err) => {
  console.error('Gagal menjalankan server Nodejs SAKIP:', err);
});
