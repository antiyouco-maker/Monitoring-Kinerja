/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IndikatorTarget {
  id: string;
  indikator: string;
  target: string;
  target2025?: string;
  target2026?: string;
  target2027?: string;
  target2028?: string;
  target2029?: string;
  target2030?: string;
}

export interface Tujuan {
  id: string;
  kode: string;
  nama: string;
  indikator?: string;
  target?: string;
  indikatorList?: IndikatorTarget[];
  pptkId?: string;
}

export interface Sasaran {
  id: string;
  tujuanId: string;
  kode: string;
  nama: string;
  indikator?: string;
  target?: string;
  indikatorList?: IndikatorTarget[];
  pptkId?: string;
}

export interface Program {
  id: string;
  sasaranId: string;
  kode: string;
  nama: string;
  indikator?: string;
  target?: string;
  indikatorList?: IndikatorTarget[];
  pptkId?: string;
}

export interface Kegiatan {
  id: string;
  programId: string;
  kode: string;
  nama: string;
  indikator?: string;
  target?: string;
  indikatorList?: IndikatorTarget[];
  pptkId?: string;
}

export interface SubKegiatan {
  id: string;
  kegiatanId: string;
  kode: string;
  nama: string;
  indikator?: string;
  target?: string;
  indikatorList?: IndikatorTarget[];
  pptkId?: string;
}

export interface PPTK {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  bidang: string;
}

export interface CascadingKinerja {
  id: string;
  tujuanId: string;
  sasaranId: string;
  programId: string;
  kegiatanId: string;
  subKegiatanId: string;
  pptkId: string;
  tahun: number;
  target: number;
  realisasi: number;
  satuan: string;
  keterangan: string;
}

export interface IkuIndikator {
  id: string;
  kode: string;
  nama: string;
  satuan: string;
  penanggungjawab: string;
  targets: { [key: number]: number };
  realisasi: { [key: number]: number };
  sasaranIndikatorId?: string;
}

export interface IkkIndikator {
  id: string;
  kode: string;
  nama: string;
  satuan: string;
  penanggungjawab: string;
  targets: { [key: number]: number };
  realisasi: { [key: number]: number };
}

export interface SakipSyncLog {
  id: string;
  timestamp: string;
  recordsSynced: number;
  status: 'SUCCESS' | 'FAILED';
  triggeredBy: string;
}
