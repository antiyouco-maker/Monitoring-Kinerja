/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  User,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  FileCheck,
  Building,
  Target,
  Sparkles,
  Link as LinkIcon,
  ZoomIn,
  ZoomOut,
  Download
} from 'lucide-react';
import { Tujuan, Sasaran, Program, Kegiatan, SubKegiatan, PPTK, CascadingKinerja } from '../types';

interface CascadingViewProps {
  tujuanDb: Tujuan[];
  sasaranDb: Sasaran[];
  programDb: Program[];
  kegiatanDb: Kegiatan[];
  subKegiatanDb: SubKegiatan[];
  pptkDb: PPTK[];
  cascadingData: CascadingKinerja[];
  onUpdateCascading: (data: CascadingKinerja[]) => void;
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

export default function CascadingView({
  tujuanDb,
  sasaranDb,
  programDb,
  kegiatanDb,
  subKegiatanDb,
  pptkDb,
  cascadingData,
  onUpdateCascading,
  triggerConfirm,
  triggerToast,
}: CascadingViewProps) {
  const [displayMode, setDisplayMode] = useState<'tree' | 'table'>('tree');
  const [activeVisualizerId, setActiveVisualizerId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const handleExportSVG = () => {
    if (sasaranTree.length === 0) {
      if (triggerToast) triggerToast('Data pohon kinerja kosong, tidak bisa mengekspor SVG.', 'error');
      return;
    }

    const colWidth = 240;
    const paddingX = 120;
    const paddingY = 120;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const wrapTextLines = (text: string, maxLen: number, maxLines: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if ((currentLine + ' ' + word).trim().length > maxLen) {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
          if (lines.length >= maxLines - 1) {
            const remaining = words.slice(i + 1).join(' ');
            let lastLine = (currentLine + ' ' + remaining).trim();
            if (lastLine.length > maxLen) {
              lastLine = lastLine.substring(0, maxLen - 3) + '...';
            }
            lines.push(lastLine);
            currentLine = '';
            break;
          }
        } else {
          currentLine = (currentLine + ' ' + word).trim();
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    const trackCardBounds = (left: number, top: number, width: number, height: number) => {
      minX = Math.min(minX, left);
      maxX = Math.max(maxX, left + width);
      minY = Math.min(minY, top);
      maxY = Math.max(maxY, top + height);
    };

    let currentX = paddingX;
    const nodesXml: string[] = [];
    const linesXml: string[] = [];

    sasaranTree.forEach((sas) => {
      let sasCols = 0;
      sas.programBranches.forEach(prog => {
        sasCols += Math.max(1, prog.kegiatanBranches.length);
      });
      const sasWidth = sasCols * colWidth;
      const sasCenterX = currentX + sasWidth / 2;
      const sasY = paddingY;

      const sasaName = sas.sasaranObj ? (('nama' in sas.sasaranObj) ? sas.sasaranObj.nama : 'Meningkatnya Kualitas Tata Kelola Urusan Kelompok Pertanian') : 'Meningkatnya Kualitas Tata Kelola Urusan Kelompok Pertanian';
      const sasaKode = sas.sasaranObj ? (('kode' in sas.sasaranObj) ? sas.sasaranObj.kode : 'SAS.01') : 'SAS.01';
      const sasaIndikator = sas.sasaranObj && 'indikator' in sas.sasaranObj ? (sas.sasaranObj.indikator || (sas.sasaranObj?.indikatorList?.[0]?.indikator) || 'Skor Pola Pangan Harapan') : 'Skor Pola Pangan Harapan';
      const sasaTargetValue = (() => {
        if (selectedYear !== 'all') {
          const ind = sas.sasaranObj?.indikatorList?.[0];
          const tk = `target${selectedYear}` as keyof typeof ind;
          return ind ? String(ind[tk] || ind.target || '-') : '-';
        } else {
          const ind = sas.sasaranObj?.indikatorList?.[0];
          if (ind) {
            return `25:${ind.target2025 || '-'} | 26:${ind.target2026 || '-'} | 27:${ind.target2027 || '-'} | 28:${ind.target2028 || '-'} | 29:${ind.target2029 || '-'} | 30:${ind.target2030 || '-'}`;
          }
          return '-';
        }
      })();
      
      // Track Level 0 Sasaran Card bounds
      trackCardBounds(sasCenterX - 240, sasY, 480, 230);

      nodesXml.push(`
        <!-- Level 0: Sasaran Card -->
        <g transform="translate(${sasCenterX - 240}, ${sasY})">
          <!-- White card background with emerald border and rounded corners -->
          <rect width="480" height="230" rx="16" fill="#ffffff" stroke="#10b981" stroke-width="2.5" filter="url(#dropShadow)" />
          
          <!-- LEVEL 0: SASARAN STRATEGIS DINAS header and horizontal divider line -->
          <text x="240" y="22" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="950" text-anchor="middle" letter-spacing="1">LEVEL 0: SASARAN STRATEGIS DINAS</text>
          <line x1="12" y1="32" x2="468" y2="32" stroke="#cbd5e1" stroke-width="1.5" />
          
          <!-- [KODE SASARAN] [NAMA SASARAN] -->
          ${(() => {
            const lines = wrapTextLines(`[${sasaKode}] ${sasaName}`, 85, 2);
            return lines.map((ln, idx) => `
              <text x="240" y="${48 + idx * 11}" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
                ${escapeXml(ln)}
              </text>
            `).join('');
          })()}

          <!-- [INDIKATOR SASARAN] -->
          <text x="240" y="80" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">INDIKATOR SASARAN:</text>
          ${(() => {
            const lines = wrapTextLines(sasaIndikator, 85, 2);
            return lines.map((ln, idx) => `
              <text x="240" y="${94 + idx * 11}" fill="#047857" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="800" text-anchor="middle">
                ${escapeXml(ln)}
              </text>
            `).join('');
          })()}

          <!-- [TARGET TAHUN] -->
          <text x="240" y="122" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">TARGET TAHUN:</text>
          <text x="240" y="136" fill="#047857" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="900" text-anchor="middle">
            ${selectedYear === 'all' ? 'RENSTRA 2025 - 2030' : `TAHUN ${selectedYear}`}
          </text>

          <!-- [TARGET SASARAN] -->
          <text x="240" y="164" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">TARGET SASARAN:</text>
          <text x="240" y="178" fill="#047857" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">
            ${escapeXml(sasaTargetValue)}
          </text>

          <!-- [PENGAMPU] -->
          <line x1="20" y1="194" x2="460" y2="194" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />
          <text x="240" y="214" fill="#334155" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
            PENGAMPU: Ir. H. Suwenda, M.Si. (Kepala Dinas)
          </text>
        </g>
      `);

      const sasBottomY = sasY + 230;
      const distY = sasBottomY + 40;
      linesXml.push(`
        <path d="M ${sasCenterX} ${sasBottomY} L ${sasCenterX} ${distY}" stroke="#64748b" stroke-width="2.5" fill="none" />
        <circle cx="${sasCenterX}" cy="${distY}" r="4" fill="#004882" />
      `);

      let progX = currentX;
      
      if (sas.programBranches.length > 0) {
        const firstProgCenterX = progX + (Math.max(1, sas.programBranches[0].kegiatanBranches.length) * colWidth) / 2;
        let accum = progX;
        sas.programBranches.forEach((p, idx) => {
          if (idx < sas.programBranches.length - 1) {
            accum += Math.max(1, p.kegiatanBranches.length) * colWidth;
          }
        });
        const lastProgCenterX = accum + (Math.max(1, sas.programBranches[sas.programBranches.length - 1].kegiatanBranches.length) * colWidth) / 2;
        
        if (sas.programBranches.length > 1) {
          linesXml.push(`
            <line x1="${firstProgCenterX}" y1="${distY}" x2="${lastProgCenterX}" y2="${distY}" stroke="#64748b" stroke-width="2.5" />
          `);
        }
      }

      sas.programBranches.forEach((prog) => {
        const progCols = Math.max(1, prog.kegiatanBranches.length);
        const progWidth = progCols * colWidth;
        const progCenterX = progX + progWidth / 2;
        const progY = distY + 40;

        const progName = prog.progObj?.nama || 'Program Kerja';
        const progKode = prog.progObj?.kode || 'PROG';
        const progIndikator = prog.progObj?.indikator || prog.progObj?.indikatorList?.[0]?.indikator || 'Persentase Target Kinerja';

        const progTargetValue = (() => {
          if (selectedYear !== 'all') {
            const ind = prog.progObj?.indikatorList?.[0];
            const tk = `target${selectedYear}` as keyof typeof ind;
            return ind ? String(ind[tk] || ind.target || '-') : '-';
          } else {
            const ind = prog.progObj?.indikatorList?.[0];
            if (ind) {
              return `25:${ind.target2025 || '-'} | 26:${ind.target2026 || '-'} | 27:${ind.target2027 || '-'} | 28:${ind.target2028 || '-'} | 29:${ind.target2029 || '-'} | 30:${ind.target2030 || '-'}`;
            }
            return prog.progObj?.target || '-';
          }
        })();

        const progPengampu = (() => {
          if (prog.progObj?.kode === 'PRG.01' || prog.progObj?.kode === 'PRG.02') {
            return 'Ketahanan Pangan (H. Sudarsono)';
          } else if (prog.progObj?.kode === 'PRG.03') {
            return 'Tanaman Pangan (Agus Sulaeman)';
          } else if (prog.progObj?.kode === 'PRG.04') {
            return 'Penyuluhan & Horti (Rita Sri H.)';
          } else if (prog.progObj?.kode === 'PRG.05') {
            return 'Sekretariat (Endang Sri M.)';
          }
          return 'DKPP Indramayu';
        })();

        linesXml.push(`
          <line x1="${progCenterX}" y1="${distY}" x2="${progCenterX}" y2="${progY}" stroke="#64748b" stroke-width="2.5" />
        `);

        // Track Level 1 Program Card bounds
        trackCardBounds(progCenterX - 170, progY, 340, 230);

        nodesXml.push(`
          <!-- Level 1: Program Card -->
          <g transform="translate(${progCenterX - 170}, ${progY})">
            <!-- White card background with slate border and rounded corners -->
            <rect width="340" height="230" rx="16" fill="#ffffff" stroke="#94a3b8" stroke-width="2" filter="url(#dropShadow)" />
            
            <!-- LEVEL 1: PROGRAM KERJA DINAS header and horizontal divider line -->
            <text x="170" y="22" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="950" text-anchor="middle" letter-spacing="1">LEVEL 1: PROGRAM KERJA DINAS</text>
            <line x1="12" y1="32" x2="328" y2="32" stroke="#cbd5e1" stroke-width="1.5" />
            
            <!-- [KODE PROGRAM] [NAMA PROGRAM] -->
            ${(() => {
              const lines = wrapTextLines(`[${progKode}] ${progName}`, 58, 2);
              return lines.map((ln, idx) => `
                <text x="170" y="${48 + idx * 11}" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
                  ${escapeXml(ln)}
                </text>
              `).join('');
            })()}

            <!-- [INDIKATOR PROGRAM(SATUAN)] -->
            <text x="170" y="80" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">INDIKATOR PROGRAM:</text>
            ${(() => {
              const lines = wrapTextLines(progIndikator, 58, 2);
              return lines.map((ln, idx) => `
                <text x="170" y="${94 + idx * 11}" fill="#004882" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="800" text-anchor="middle">
                  ${escapeXml(ln)}
                </text>
              `).join('');
            })()}

            <!-- [TARGET TAHUN] -->
            <text x="170" y="122" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">TARGET TAHUN:</text>
            <text x="170" y="136" fill="#b91c1c" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="900" text-anchor="middle">
              ${selectedYear === 'all' ? 'RENSTRA 2025 - 2030' : `TAHUN ${selectedYear}`}
            </text>

            <!-- [TARGET PROGRAM] -->
            <text x="170" y="164" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">TARGET PROGRAM:</text>
            <text x="170" y="178" fill="#004882" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">
              ${escapeXml(progTargetValue)}
            </text>

            <!-- [PENGAMPU] -->
            <line x1="20" y1="194" x2="320" y2="194" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />
            <text x="170" y="214" fill="#334155" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
              PENGAMPU: ${escapeXml(progPengampu)}
            </text>
          </g>
        `);

        const progBottomY = progY + 230;
        const kegDistY = progBottomY + 30;
        linesXml.push(`
          <line x1="${progCenterX}" y1="${progBottomY}" x2="${progCenterX}" y2="${kegDistY}" stroke="#64748b" stroke-width="2" />
        `);

        let kegX = progX;
        if (prog.kegiatanBranches.length > 0) {
          const firstKegCenterX = kegX + colWidth / 2;
          const lastKegCenterX = kegX + (prog.kegiatanBranches.length - 1) * colWidth + colWidth / 2;
          if (prog.kegiatanBranches.length > 1) {
            linesXml.push(`
              <line x1="${firstKegCenterX}" y1="${kegDistY}" x2="${lastKegCenterX}" y2="${kegDistY}" stroke="#64748b" stroke-width="2" />
            `);
          }
        }

        prog.kegiatanBranches.forEach((keg) => {
          const kegCenterX = kegX + colWidth / 2;
          const kegY = kegDistY + 30;

          const kegName = keg.kegObj?.nama || 'Kegiatan';
          const kegKode = keg.kegObj?.kode || 'KEG';

          linesXml.push(`
            <line x1="${kegCenterX}" y1="${kegDistY}" x2="${kegCenterX}" y2="${kegY}" stroke="#64748b" stroke-width="2" />
          `);

          const kegIndikator = keg.kegObj?.indikator || (keg.kegObj?.indikatorList?.[0]?.indikator) || 'Jumlah Pengelolaan Urusan Teknis SKPD';
          const kegTargetValue = (() => {
            if (selectedYear !== 'all') {
              const ind = keg.kegObj?.indikatorList?.[0];
              const tk = `target${selectedYear}` as keyof typeof ind;
              return ind ? String(ind[tk] || ind.target || '-') : '-';
            } else {
              const ind = keg.kegObj?.indikatorList?.[0];
              if (ind) {
                return `25:${ind.target2025 || '-'} | 26:${ind.target2026 || '-'}`;
              }
              return keg.kegObj?.target || '-';
            }
          })();
          const kegPengampu = (() => {
            const code = prog.progObj?.kode;
            if (code === 'PRG.01' || code === 'PRG.02') return 'Sudarsono (Pangan)';
            if (code === 'PRG.03') return 'A. Sulaeman (Tanaman)';
            if (code === 'PRG.04') return 'Rita Sri H. (Penyuluh)';
            return 'Endang Sri M. (Sekre)';
          })();

          // Track Level 2 Kegiatan Card bounds
          trackCardBounds(kegCenterX - 110, kegY, 220, 230);

          nodesXml.push(`
            <!-- Level 2: Kegiatan Card -->
            <g transform="translate(${kegCenterX - 110}, ${kegY})">
              <!-- White card background with indigo border -->
              <rect width="220" height="230" rx="16" fill="#ffffff" stroke="#818cf8" stroke-width="2" filter="url(#dropShadow)" />
              
              <!-- LEVEL 2: KEGIATAN UNIT header -->
              <text x="110" y="22" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="950" text-anchor="middle" letter-spacing="1">LEVEL 2: KEGIATAN UNIT</text>
              <line x1="12" y1="32" x2="208" y2="32" stroke="#cbd5e1" stroke-width="1.5" />
              
              <!-- [KODE KEGIATAN] [NAMA KEGIATAN] -->
              ${(() => {
                const lines = wrapTextLines(`[${kegKode}] ${kegName}`, 34, 2);
                return lines.map((ln, idx) => `
                  <text x="110" y="${48 + idx * 10}" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="900" text-anchor="middle">
                    ${escapeXml(ln)}
                  </text>
                `).join('');
              })()}

              <!-- [INDIKATOR] -->
              <text x="110" y="80" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">INDIKATOR KEGIATAN:</text>
              ${(() => {
                const lines = wrapTextLines(kegIndikator, 34, 2);
                return lines.map((ln, idx) => `
                  <text x="110" y="${94 + idx * 10}" fill="#4338ca" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="800" text-anchor="middle">
                    ${escapeXml(ln)}
                  </text>
                `).join('');
              })()}

              <!-- [TARGET TAHUN] -->
              <text x="110" y="122" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">TARGET TAHUN:</text>
              <text x="110" y="136" fill="#4338ca" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
                ${selectedYear === 'all' ? 'RENSTRA 25 - 30' : `TAHUN ${selectedYear}`}
              </text>

              <!-- [TARGET KEGIATAN] -->
              <text x="110" y="164" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">TARGET KEGIATAN:</text>
              <text x="110" y="178" fill="#4338ca" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="900" text-anchor="middle">
                ${escapeXml(kegTargetValue)}
              </text>

              <!-- [PENGAMPU] -->
              <line x1="15" y1="194" x2="205" y2="194" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />
              <text x="110" y="214" fill="#334155" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="900" text-anchor="middle">
                PENGAMPU: ${escapeXml(kegPengampu)}
              </text>
            </g>
          `);

          const kegBottomY = kegY + 230;
          let subKegY = kegBottomY + 25;

          keg.subKegs.forEach((sk, skIdx) => {
            linesXml.push(`
              <line x1="${kegCenterX}" y1="${skIdx === 0 ? kegBottomY : subKegY - 20}" x2="${kegCenterX}" y2="${subKegY}" stroke="#64748b" stroke-dasharray="2,2" stroke-width="1.5" />
            `);

            const skIndikator = sk.indikator || (sk.indikatorList?.[0]?.indikator) || 'Persentase Capaian Target Realisasi Fisik';
            const skTargetValue = (() => {
              if (selectedYear !== 'all') {
                const ind = sk.indikatorList?.[0];
                const tk = `target${selectedYear}` as keyof typeof ind;
                return ind ? String(ind[tk] || ind.target || '-') : '-';
              } else {
                const ind = sk.indikatorList?.[0];
                if (ind) {
                  return `25:${ind.target2025 || '-'} | 26:${ind.target2026 || '-'}`;
                }
                return sk.target || '-';
              }
            })();
            const skPengampu = (() => {
              const code = sk.kode;
              if (code.includes('SUB.01') || code.includes('SUB.02') || code.includes('SUB.03') || code.includes('SUB.04')) return 'Unit Ketah Pangan';
              if (code.includes('SUB.05') || code.includes('SUB.06')) return 'Unit Sarana & JUT';
              if (code.includes('SUB.07')) return 'Penyuluh Pertanian';
              return 'Subag Perencanaan';
            })();

            // Track Level 3 Sub Kegiatan Card bounds
            trackCardBounds(kegCenterX - 100, subKegY, 200, 230);

            nodesXml.push(`
              <!-- Level 3: Sub Kegiatan Card -->
              <g transform="translate(${kegCenterX - 100}, ${subKegY})">
                <!-- White card background with slate border -->
                <rect width="200" height="230" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#dropShadow)" />
                
                <!-- LEVEL 3: SUB KEGIATAN header -->
                <text x="100" y="22" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="900" text-anchor="middle" letter-spacing="1">LEVEL 3: SUB KEGIATAN</text>
                <line x1="12" y1="32" x2="188" y2="32" stroke="#cbd5e1" stroke-width="1.5" />
                
                <!-- [KODE SUB KEGIATAN] [NAMA SUB KEGIATAN] -->
                ${(() => {
                  const lines = wrapTextLines(`[${sk.kode}] ${sk.nama}`, 30, 2);
                  return lines.map((ln, idx) => `
                    <text x="100" y="${48 + idx * 10}" fill="#1e293b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="900" text-anchor="middle">
                      ${escapeXml(ln)}
                    </text>
                  `).join('');
                })()}

                <!-- [INDIKATOR] -->
                <text x="100" y="80" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle">INDIKATOR OUTPUT:</text>
                ${(() => {
                  const lines = wrapTextLines(skIndikator, 30, 2);
                  return lines.map((ln, idx) => `
                    <text x="100" y="${94 + idx * 10}" fill="#047857" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="800" text-anchor="middle">
                      ${escapeXml(ln)}
                    </text>
                  `).join('');
                })()}

                <!-- [TARGET TAHUN] -->
                <text x="100" y="122" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle">TARGET TAHUN:</text>
                <text x="100" y="136" fill="#10b981" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="900" text-anchor="middle">
                  ${selectedYear === 'all' ? 'RENSTRA 25 - 30' : `TAHUN ${selectedYear}`}
                </text>

                <!-- [TARGET OUTPUT] -->
                <text x="100" y="164" fill="#64748b" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle">TARGET OUTPUT:</text>
                <text x="100" y="178" fill="#047857" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
                  ${escapeXml(skTargetValue)}
                </text>

                <!-- [PENGAMPU] -->
                <line x1="15" y1="194" x2="185" y2="194" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />
                <text x="100" y="214" fill="#334155" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="900" text-anchor="middle">
                  PELAKSANA: ${escapeXml(skPengampu)}
                </text>
              </g>
            `);

            subKegY += 250;
          });

          kegX += colWidth;
        });

        progX += progWidth;
      });

      currentX += sasWidth + 60;
    });

    const finalMinX = minX !== Infinity ? minX : paddingX;
    const finalMaxX = maxX !== -Infinity ? maxX : 1200;
    const finalMinY = minY !== Infinity ? minY : paddingY;
    const finalMaxY = maxY !== -Infinity ? maxY : 1000;

    const shiftX = paddingX - finalMinX;
    const shiftY = paddingY - finalMinY;

    const svgWidth = (finalMaxX - finalMinX) + paddingX * 2;
    const svgHeight = (finalMaxY - finalMinY) + paddingY * 2;

    const fullSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <defs>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>
    
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="3" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.10" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#fafbfc" />

  <g transform="translate(${Math.max(10, svgWidth / 2 - 270)}, 25)">
    <rect width="540" height="42" rx="8" fill="#004882" opacity="0.06" />
    <text x="11" y="26" fill="#004882" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="900" letter-spacing="0.5">POHON CASCADING KINERJA DKPP INDRAMAYU 2025-2030</text>
    <text x="450" y="25" fill="#475569" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="800">TAHUN: ${selectedYear === 'all' ? 'SEMUA TAHUN' : selectedYear}</text>
  </g>

  <g transform="translate(${shiftX}, ${shiftY})">
    <g id="branches-links">
      ${linesXml.join('\n')}
    </g>

    <g id="branches-nodes">
      ${nodesXml.join('\n')}
    </g>
  </g>
</svg>
`;

    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pohon_kinerja_dkpp_indramayu_${selectedYear}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (triggerToast) triggerToast('Bagan Pohon Kinerja SVG berhasil diunduh.', 'success');
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };


  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  };
  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.1, 0.4));
  };
  const handleZoomReset = () => {
    setZoomScale(1);
  };

  // Parse direct hierarchical relationship from Renstra DB automatically!
  const hierarchicalTree = useMemo(() => {
    return programDb.map((progObj) => {
      const sasaranObj = sasaranDb.find((s) => s.id === progObj.sasaranId);
      const tujuanObj = sasaranObj ? tujuanDb.find((t) => t.id === sasaranObj.tujuanId) : null;

      // Find Activities linked to this Program
      const activities = kegiatanDb.filter((k) => k.programId === progObj.id);

      const kegiatanBranches = activities.map((kegObj) => {
        // Find Sub-Activities linked to this Activity
        const subKegs = subKegiatanDb.filter((sk) => sk.kegiatanId === kegObj.id);

        return {
          id: kegObj.id,
          kegObj,
          subKegs,
        };
      });

      return {
        id: progObj.id,
        progObj,
        sasaranObj,
        tujuanObj,
        kegiatanBranches,
      };
    }).filter((p) => p.progObj !== undefined);
  }, [programDb, sasaranDb, tujuanDb, kegiatanDb, subKegiatanDb]);

  // Group programs by unique Sasaran Strategis to merge duplicates at Level 0
  const sasaranTree = useMemo(() => {
    const grouped: {
      id: string;
      sasaranObj: Sasaran | { id: string; kode: string; nama: string; indikator?: string; target?: string };
      programBranches: {
        id: string;
        progObj: Program;
        kegiatanBranches: {
          id: string;
          kegObj: Kegiatan;
          subKegs: SubKegiatan[];
        }[];
      }[];
    }[] = [];

    const assignedProgramIds = new Set<string>();

    sasaranDb.forEach((sas) => {
      const progs = programDb.filter((p) => p.sasaranId === sas.id);
      if (progs.length > 0) {
        progs.forEach((p) => assignedProgramIds.add(p.id));
        
        const branches = progs.map((progObj) => {
          const activities = kegiatanDb.filter((k) => k.programId === progObj.id);
          const kegiatanBranches = activities.map((kegObj) => {
            const subKegs = subKegiatanDb.filter((sk) => sk.kegiatanId === kegObj.id);
            return {
              id: kegObj.id,
              kegObj,
              subKegs,
            };
          });
          return {
            id: progObj.id,
            progObj,
            kegiatanBranches,
          };
        });

        grouped.push({
          id: sas.id,
          sasaranObj: sas,
          programBranches: branches,
        });
      }
    });

    const lingeringProgs = programDb.filter((p) => !assignedProgramIds.has(p.id));
    if (lingeringProgs.length > 0) {
      const fallbackSas = {
        id: 'unassigned-sas',
        kode: 'SAS.Utama',
        nama: 'Meningkatnya Kualitas Tata Kelola Urusan Kelompok Pertanian (Sasaran Utama)',
        indikator: 'Indeks Kepuasan Layanan Pertanian',
        target: 'Sangat Baik',
      };

      const branches = lingeringProgs.map((progObj) => {
        const activities = kegiatanDb.filter((k) => k.programId === progObj.id);
        const kegiatanBranches = activities.map((kegObj) => {
          const subKegs = subKegiatanDb.filter((sk) => sk.kegiatanId === kegObj.id);
          return {
            id: kegObj.id,
            kegObj,
            subKegs,
          };
        });
        return {
          id: progObj.id,
          progObj,
          kegiatanBranches,
        };
      });

      grouped.push({
        id: fallbackSas.id,
        sasaranObj: fallbackSas,
        programBranches: branches,
      });
    }

    return grouped;
  }, [sasaranDb, programDb, kegiatanDb, subKegiatanDb]);

  // Flatten alignment rows for Table/Spreadsheet Matriks View
  const alignmentRows = useMemo(() => {
    const rows: {
      id: string;
      tujuan: Tujuan | undefined;
      sasaran: Sasaran | undefined;
      program: Program | undefined;
      kegiatan: Kegiatan | undefined;
      subKegiatan: SubKegiatan;
    }[] = [];

    subKegiatanDb.forEach((sk) => {
      const keg = kegiatanDb.find((k) => k.id === sk.kegiatanId);
      const prog = keg ? programDb.find((p) => p.id === keg.programId) : undefined;
      const sas = prog ? sasaranDb.find((s) => s.id === prog.sasaranId) : undefined;
      const tuj = sas ? tujuanDb.find((t) => t.id === sas.tujuanId) : undefined;

      rows.push({
        id: sk.id,
        tujuan: tuj,
        sasaran: sas,
        program: prog,
        kegiatan: keg,
        subKegiatan: sk,
      });
    });

    return rows;
  }, [tujuanDb, sasaranDb, programDb, kegiatanDb, subKegiatanDb]);

  // Selected sub-activity path visualizer data
  const selectedVisualizedRow = useMemo(() => {
    if (!activeVisualizerId) return null;
    return alignmentRows.find((r) => r.id === activeVisualizerId);
  }, [alignmentRows, activeVisualizerId]);

  return (
    <div id="cascading-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#004882]" />
            Cascading & Alignment Kinerja Renstra 2025-2030
          </h3>
          <p className="text-xs text-slate-500">
            Penurunan Indikator Kinerja secara otomatis berdasarkan keterkaitan program (Tujuan ➔ Sasaran ➔ Program ➔ Kegiatan ➔ Sub Kegiatan)
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setDisplayMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition ${
                displayMode === 'tree'
                  ? 'bg-[#004882] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Pohon Kinerja (Tree)
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition ${
                displayMode === 'table'
                  ? 'bg-[#004882] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Matriks Alignment (Tabel)
            </button>
          </div>

          {/* Unduh Bagan SVG */}
          <button
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm transition-all border border-amber-600/30 font-sans cursor-pointer"
            title="Unduh Bagan Pohon Kinerja (SVG)"
          >
            <Download className="w-4 h-4 text-slate-950" />
            Unduh Bagan SVG
          </button>
        </div>
      </div>

      {/* Global Year Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004882]/10 text-[#004882] rounded-xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Filter Target Berdasarkan Tahun</h4>
            <p className="text-[10px] text-slate-500 leading-normal">Pilih tahun untuk menyorot atau memfilter target kinerja spesifik</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-3xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              selectedYear === 'all'
                ? 'bg-[#004882] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Semua Tahun
          </button>
          {[2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all text-center ${
                selectedYear === yr
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Flowchart Trees */}
      {selectedVisualizedRow && (
        <div id="cascading-visualizer-diagram" className="bg-[#0b1329] text-white p-6 rounded-2xl border border-slate-850 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <GitBranch className="w-4 h-4 text-cyan-400 animate-pulse" />
              Skema Alur Penurunan Kinerja (Cascading Tree - Realtime DB)
            </h4>
            <button
              onClick={() => setActiveVisualizerId(null)}
              className="text-xs text-white/70 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded transition border border-white/10"
            >
              Tutup Visualisasi
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* 0. SASARAN BOX */}
            <div className="bg-slate-905 border border-slate-800/40 p-4 rounded-xl max-w-4xl bg-slate-900">
              <span className="text-[9px] bg-emerald-555/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-500/10">Level 0: Sasaran Strategis Dinas</span>
              <h5 className="font-bold text-xs text-white mt-1.5 leading-relaxed">
                [{selectedVisualizedRow.sasaran?.kode || 'S'}] {selectedVisualizedRow.sasaran?.nama}
              </h5>
            </div>

            <div className="pl-6 border-l border-cyan-500/30 flex flex-col gap-4">
              {/* 1. PROGRAM BOX */}
              <div className="bg-slate-905 border border-slate-800/40 p-4 rounded-xl max-w-4xl bg-slate-900">
                <span className="text-[9px] bg-blue-550/20 text-blue-300 font-extrabold px-2 py-0.5 rounded-full uppercase border border-blue-500/10">Level 1: Program Kerja Dinas</span>
                <h5 className="font-bold text-xs text-white mt-1.5 leading-relaxed">
                  [{selectedVisualizedRow.program?.kode || 'P'}] {selectedVisualizedRow.program?.nama}
                </h5>
              </div>

              <div className="pl-6 border-l border-cyan-500/30 flex flex-col gap-4">
                {/* 2. KEGIATAN */}
                <div className="bg-slate-905 border border-slate-800/40 p-4 rounded-xl max-w-4xl bg-slate-900">
                  <span className="text-[9px] bg-indigo-550/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full uppercase border border-indigo-500/10">Level 2: Kegiatan Unit</span>
                  <h5 className="font-bold text-xs text-white mt-1.5 leading-relaxed">
                    [{selectedVisualizedRow.kegiatan?.kode || 'K'}] {selectedVisualizedRow.kegiatan?.nama}
                  </h5>
                </div>

                <div className="pl-6 border-l border-cyan-500/30">
                  {/* 3. SUB KEGIATAN */}
                  <div className="bg-[#0f1d40] border border-cyan-900/50 p-4 rounded-xl max-w-4xl">
                    <span className="text-[9px] bg-cyan-500/25 text-cyan-300 font-extrabold px-2 py-0.5 rounded-full uppercase border border-cyan-500/20">Level 3: Sub Kegiatan Operasional</span>
                    <h5 className="font-bold text-xs text-white mt-1.5 leading-relaxed">
                      [{selectedVisualizedRow.subKegiatan.kode}] {selectedVisualizedRow.subKegiatan.nama}
                    </h5>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4 pt-3 border-t border-cyan-900/30">
                        {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => {
                          const list = selectedVisualizedRow.subKegiatan.indikatorList || [];
                          const targetKey = `target${y}` as keyof typeof list[0];
                          const val = list[0] ? String(list[0][targetKey] || list[0].target || '-') : '-';
                          return (
                            <div key={y} className="bg-black/20 p-2 rounded text-center border border-white/5 font-mono">
                              <span className="text-[8.5px] text-zinc-400 block mb-0.5">Tgt {y}</span>
                              <span className="text-[11px] font-extrabold text-cyan-300">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* TREE MODE VIEW */}
      {displayMode === 'tree' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#004882] rounded-full animate-ping"></span>
                Pohon Kinerja (Cascading Tree) Dinas Ketahanan Pangan & Pertanian
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Visualisasi terstruktur untuk mengalirkan target di seluruh tingkat (Tujuan ➔ Sasaran & Program ➔ Kegiatan ➔ Sub Kegiatan). Gunakan gulir mendatar jika cabang meluas.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 bg-white text-slate-600 hover:text-[#004882] rounded-md border border-slate-200 hover:border-slate-350 shadow-xs transition flex items-center justify-center font-bold"
                  title="Zoom Out (Perkecil)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-black text-slate-700 min-w-[38px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 bg-white text-slate-600 hover:text-[#004882] rounded-md border border-slate-200 hover:border-slate-350 shadow-xs transition flex items-center justify-center font-bold"
                  title="Zoom In (Perbesar)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-slate-250 mx-1"></div>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition rounded hover:bg-white/50"
                  title="Reset Zoom ke 100%"
                >
                  Reset
                </button>
              </div>

              <div className="text-[9.5px] bg-slate-100 text-slate-600 px-2.5 py-2 rounded-full font-bold uppercase border border-slate-200">
                Sinkronisasi Otomatis DB Renstra
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-6">
            {sasaranTree.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">Bagan Pohon Kinerja Kosong</p>
                <p className="text-xs">Uraian Data di Database Renstra masih kosong.</p>
              </div>
            ) : (
              <div 
                className="w-full flex flex-col items-center p-4 transition-all duration-200"
                style={{ 
                  zoom: zoomScale,
                  minWidth: 'fit-content'
                }}
              >
                {sasaranTree.map((sas, sIdx) => {
                  const sasaName = sas.sasaranObj ? sas.sasaranObj.nama : 'Meningkatnya Kualitas Tata Kelola Urusan Kelompok Pertanian';
                  const sasaKode = sas.sasaranObj ? sas.sasaranObj.kode : 'SAS.01';

                  return (
                    <div 
                      key={sas.id} 
                      className="w-full flex flex-col items-center mb-24 border-b border-dashed border-slate-200 pb-20 last:border-0 last:pb-0 font-sans"
                    >
                      {/* LEVEL 0: SASARAN (Top Central Column) */}
                      <div className="flex flex-col items-center mb-4 z-20">
                        <div className="w-[480px] bg-white text-slate-800 p-5 rounded-[20px] shadow-md border-2 border-emerald-400 flex flex-col justify-between hover:shadow-lg hover:border-emerald-500 transition duration-205 z-10 text-center font-sans">
                          <div>
                            {/* LEVEL 0: SASARAN STRATEGIS DINAS title with a clean grey bottom dividing line */}
                            <div className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                              LEVEL 0: SASARAN STRATEGIS DINAS
                            </div>
                            <hr className="border-t border-slate-200 my-2.5 w-full" />
                            
                            {/* [KODE SASARAN] [NAMA SASARAN] */}
                            <div className="font-extrabold text-slate-900 text-xs leading-relaxed uppercase mb-4 mt-2">
                              [{sasaKode}] {sasaName}
                            </div>
                          </div>

                          <div className="space-y-3.5 my-1">
                            {/* [INDIKATOR SASARAN] */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Indikator Sasaran:</span>
                              <span className="font-bold text-emerald-800 text-[10.5px] leading-relaxed max-w-[420px]">
                                {(() => {
                                  if (sas.sasaranObj?.indikator) return sas.sasaranObj.indikator;
                                  if (sas.sasaranObj?.indikatorList?.[0]?.indikator) return sas.sasaranObj.indikatorList[0].indikator;
                                  return 'Meningkatkan Kualitas Tata Kelola Urusan Kelompok Pertanian';
                                })()}
                              </span>
                            </div>

                            {/* [TARGET TAHUN] */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Tahun:</span>
                              <span className="font-black text-emerald-600 font-sans text-[10px] uppercase">
                                {selectedYear === 'all' ? 'TAHUN RENSTRA 2025 - 2030' : `TAHUN ${selectedYear}`}
                              </span>
                            </div>

                            {/* [TARGET SASARAN] */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Sasaran:</span>
                              {selectedYear === 'all' ? (
                                <div className="flex flex-wrap justify-center items-center gap-1 mt-1 font-mono text-[9px]">
                                  {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                                    const ind = sas.sasaranObj?.indikatorList?.[0];
                                    const tk = `target${yr}` as keyof typeof ind;
                                    const tv = ind ? String(ind[tk] || ind.target || '-') : '-';
                                    return (
                                      <div key={yr} className="bg-emerald-50/50 border border-emerald-100 rounded px-1.5 py-0.5 min-w-[40px] shadow-3xs">
                                        <span className="text-[7.5px] text-slate-400 block font-normal">'{String(yr).slice(-2)}</span>
                                        <span className="font-bold text-emerald-900">{tv}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs font-mono px-3 py-1 rounded-full shadow-3xs mt-0.5">
                                  {(() => {
                                    const ind = sas.sasaranObj?.indikatorList?.[0];
                                    const tk = `target${selectedYear}` as keyof typeof ind;
                                    return ind ? String(ind[tk] || ind.target || '-') : (sas.sasaranObj?.target || '-');
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* [PENGAMPU] */}
                          <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200">
                            <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Pengampu:</span>
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center gap-1">
                                <Building className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-extrabold text-emerald-800 text-[10px]">
                                  DINAS KETAHANAN PANGAN & PERTANIAN
                                </span>
                              </div>
                            </div>
                            <div className="text-[9.5px] text-slate-500 font-bold mt-1">
                              Ir. H. Suwenda, M.Si. (Kepala Dinas)
                            </div>
                          </div>
                        </div>

                        {/* Connection line pointing DOWN to horizontal line */}
                        <div className="w-1 h-10 bg-slate-350 relative shadow-2xs">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#004882] rounded-full ring-4 ring-[#004882]/25"></div>
                        </div>
                      </div>

                      {/* Horizontal distribution bar if there are multiple programs */}
                      {sas.programBranches.length > 1 && (
                        <div 
                          className="h-1 bg-slate-350 relative mb-6" 
                          style={{ 
                            width: `calc(100% - (100% / ${sas.programBranches.length}))` 
                          }}
                        ></div>
                      )}

                      {/* LEVEL 1, 2, & 3: PROGRAMS CONTAINER (Below Level 0) */}
                      <div className="flex flex-row items-start justify-center gap-12 w-full">
                        {sas.programBranches.map((prog) => {
                          const progName = prog.progObj?.nama || 'Program Kerja Pendukung';
                          // Dynamically calculate width of this program column based on number of Kegiatan inside it 
                          // to ensure they are fully side-by-side with absolutely zero overlap!
                          const columnWidth = Math.max(340, prog.kegiatanBranches.length * 220);

                          return (
                            <div 
                              key={prog.id} 
                              className="flex flex-col items-center shrink-0" 
                              style={{ width: `${columnWidth}px` }}
                            >
                              {/* Connector up to the horizontal distributor link */}
                              {sas.programBranches.length > 1 && (
                                <div className="w-1 h-6 bg-slate-350 relative z-10 -mt-6 mb-2"></div>
                              )}

                              {/* LEVEL 1: PROGRAM CARD (Centered within columnWidth) - Styled exactly to match image.png structure */}
                              <div className="w-[340px] bg-white text-slate-800 p-5 rounded-[20px] shadow-md border-2 border-slate-300 flex flex-col justify-between hover:shadow-lg hover:border-slate-400 transition duration-205 z-10 text-center font-sans">
                                <div>
                                  {/* LEVEL 1: PROGRAM KERJA DINAS title with a clean grey bottom dividing line */}
                                  <div className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                                    LEVEL 1: PROGRAM KERJA DINAS
                                  </div>
                                  <hr className="border-t border-slate-205 my-2.5 w-full" />
                                  
                                  {/* [KODE PROGRAM] [NAMA PROGRAM] */}
                                  <div className="font-extrabold text-slate-900 text-[11px] leading-relaxed uppercase mb-4 mt-2">
                                    [{prog.progObj?.kode || 'PRG'}] {progName}
                                  </div>
                                </div>

                                <div className="space-y-3.5 my-1">
                                  {/* [INDIKATOR PROGRAM(SATUAN)] */}
                                  <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Indikator Program:</span>
                                    <span className="font-bold text-[#004882] text-[10.5px] leading-relaxed max-w-[280px]">
                                      {prog.progObj?.indikator || 'Persentase Capaian Target Kinerja'}
                                    </span>
                                  </div>

                                  {/* [TARGET TAHUN] */}
                                  <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Tahun:</span>
                                    <span className="font-black text-rose-600 font-sans text-[10px] uppercase">
                                      {selectedYear === 'all' ? 'TAHUN RENSTRA 2025 - 2030' : `TAHUN ${selectedYear}`}
                                    </span>
                                  </div>

                                  {/* [TARGET PROGRAM] */}
                                  <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Program:</span>
                                    {selectedYear === 'all' ? (
                                      <div className="flex flex-wrap justify-center items-center gap-1 mt-1 font-mono text-[9px]">
                                        {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                                          const ind = prog.progObj?.indikatorList?.[0];
                                          const tk = `target${yr}` as keyof typeof ind;
                                          const tv = ind ? String(ind[tk] || ind.target || '-') : '-';
                                          return (
                                            <div key={yr} className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 min-w-[36px] shadow-3xs">
                                              <span className="text-[7.5px] text-slate-400 block font-normal">'{String(yr).slice(-2)}</span>
                                              <span className="font-bold text-slate-700">{tv}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="inline-block bg-[#004882]/8 text-[#004882] border border-[#004882]/20 font-black text-xs font-mono px-3 py-1 rounded-full shadow-3xs mt-0.5">
                                        {(() => {
                                          const ind = prog.progObj?.indikatorList?.[0];
                                          const tk = `target${selectedYear}` as keyof typeof ind;
                                          return ind ? String(ind[tk] || ind.target || '-') : '-';
                                        })()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* [PENGAMPU] */}
                                <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200">
                                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Pengampu:</span>
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center gap-1">
                                      <Building className="w-3.5 h-3.5 text-amber-600" />
                                      <span className="font-extrabold text-[#004882] text-[10px]">
                                        {(() => {
                                          if (prog.progObj?.pptkId) {
                                            const match = pptkDb.find(p => p.id === prog.progObj.pptkId);
                                            if (match) return match.bidang;
                                          }
                                          if (prog.progObj?.kode === 'PRG.01' || prog.progObj?.kode === 'PRG.02') {
                                            return 'Bidang Ketahanan Pangan';
                                          } else if (prog.progObj?.kode === 'PRG.03') {
                                            return 'Bidang Tanaman Pangan';
                                          } else if (prog.progObj?.kode === 'PRG.04') {
                                            return 'Bidang Penyuluhan & Hortikultura';
                                          } else if (prog.progObj?.kode === 'PRG.05') {
                                            return 'Sekretariat';
                                          }
                                          return 'DKPP Indramayu';
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[9.5px] text-slate-500 font-bold mt-1">
                                    {(() => {
                                      if (prog.progObj?.pptkId) {
                                        const match = pptkDb.find(p => p.id === prog.progObj.pptkId);
                                        if (match) return match.nama;
                                      }
                                      if (prog.progObj?.kode === 'PRG.01' || prog.progObj?.kode === 'PRG.02') {
                                        return 'H. Sudarsono, S.T., M.Si.';
                                      } else if (prog.progObj?.kode === 'PRG.03') {
                                        return 'Ir. Agus Sulaeman, M.MA.';
                                      } else if (prog.progObj?.kode === 'PRG.04') {
                                        return 'Rita Sri Hartini, S.Hut.';
                                      } else if (prog.progObj?.kode === 'PRG.05') {
                                        return 'Hj. Endang Sri Mulyani, S.P., M.P.';
                                      }
                                      return '-';
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* Vertical connector down to Level 2 branches */}
                              <div className="w-0.5 h-8 bg-slate-350 relative z-10 shadow-xs"></div>

                              {/* LEVEL 2 & 3 GENERATION (Kegiatan columns) */}
                              <div className="w-full flex flex-col items-center">
                                {/* Horizontal distribution bar for multiple Kegiatan */}
                                {prog.kegiatanBranches.length > 1 && (
                                  <div 
                                    className="h-0.5 bg-slate-350 relative mb-4" 
                                    style={{ 
                                      width: `${100 - (100 / prog.kegiatanBranches.length)}%`,
                                      marginTop: '-2px'
                                    }}
                                  ></div>
                                )}

                                <div className="w-full flex justify-around items-start gap-4">
                                  {prog.kegiatanBranches.map((keg, kegIndex) => {
                                    return (
                                      <div 
                                        key={keg.id} 
                                        className="flex flex-col items-center relative" 
                                        style={{ width: `${100 / prog.kegiatanBranches.length}%` }}
                                      >
                                        
                                        {/* LEVEL 2: KEGIATAN CARD - Styled exactly to match Program structure */}
                                        <div className="w-[230px] bg-white text-slate-800 p-4 rounded-[20px] shadow-sm border-2 border-indigo-300 flex flex-col justify-between hover:shadow-md hover:border-indigo-400 transition duration-205 z-10 text-center font-sans">
                                          <div>
                                            {/* LEVEL 2: KEGIATAN UNIT title with a grey divider line */}
                                            <div className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider text-center">
                                              LEVEL 2: KEGIATAN UNIT
                                            </div>
                                            <hr className="border-t border-slate-200 my-2.5 w-full" />
                                            
                                            {/* [KODE KEGIATAN] [NAMA KEGIATAN] */}
                                            <div className="font-extrabold text-slate-900 text-[10.5px] leading-relaxed uppercase mb-3 min-h-[48px] flex items-center justify-center">
                                              [{keg.kegObj?.kode || 'KEG'}] {keg.kegObj ? keg.kegObj.nama : 'Kegiatan Pelaksana'}
                                            </div>
                                          </div>

                                          <div className="space-y-3 my-1">
                                            {/* [INDIKATOR KEGIATAN] */}
                                            <div className="flex flex-col items-center">
                                              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Indikator Kegiatan:</span>
                                              <span className="font-bold text-indigo-800 text-[10px] leading-tight max-w-[200px]">
                                                {keg.kegObj?.indikator || 'Jumlah Pengelolaan Urusan Teknis SKPD/Urusan Pertanian'}
                                              </span>
                                            </div>

                                            {/* [TARGET TAHUN] */}
                                            <div className="flex flex-col items-center">
                                              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Tahun:</span>
                                              <span className="font-black text-indigo-600 font-sans text-[9px] uppercase">
                                                {selectedYear === 'all' ? 'RENSTRA 2025 - 2030' : `TAHUN ${selectedYear}`}
                                              </span>
                                            </div>

                                            {/* [TARGET KEGIATAN] */}
                                            <div className="flex flex-col items-center">
                                              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Kegiatan:</span>
                                              {selectedYear === 'all' ? (
                                                <div className="flex flex-wrap justify-center items-center gap-0.5 mt-1 font-mono text-[8px] w-full">
                                                  {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                                                    const ind = keg.kegObj?.indikatorList?.[0];
                                                    const tk = `target${yr}` as keyof typeof ind;
                                                    const tv = ind ? String(ind[tk] || ind.target || '-') : '-';
                                                    return (
                                                      <div key={yr} className="bg-indigo-50/55 border border-indigo-100 rounded px-1 py-0.5 min-w-[28px] shadow-3xs">
                                                        <span className="text-[6.5px] text-slate-400 block font-normal">'{String(yr).slice(-2)}</span>
                                                        <span className="font-bold text-indigo-900">{tv}</span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              ) : (
                                                <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 font-black text-[10px] font-mono px-2 py-0.5 rounded-full shadow-3xs mt-0.5">
                                                  {(() => {
                                                    const ind = keg.kegObj?.indikatorList?.[0];
                                                    const tk = `target${selectedYear}` as keyof typeof ind;
                                                    return ind ? String(ind[tk] || ind.target || '-') : (keg.kegObj?.target || '-');
                                                  })()}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* [PENGAMPU] */}
                                          <div className="mt-3.5 pt-3 border-t border-dashed border-slate-200">
                                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Pengampu:</span>
                                            <div className="text-[9px] text-[#004882] font-extrabold">
                                              {(() => {
                                                const ownPptkId = keg.kegObj?.pptkId || prog.progObj?.pptkId;
                                                if (ownPptkId) {
                                                  const match = pptkDb.find(p => p.id === ownPptkId);
                                                  if (match) return match.bidang;
                                                }
                                                const code = prog.progObj?.kode;
                                                if (code === 'PRG.01' || code === 'PRG.02') return 'Bidang Ketahanan Pangan';
                                                if (code === 'PRG.03') return 'Bidang Tanaman Pangan';
                                                if (code === 'PRG.04') return 'Bidang Penyuluhan & Hortikultura';
                                                return 'Sekretariat Dinas';
                                              })()}
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-bold mt-0.5">
                                              {(() => {
                                                const ownPptkId = keg.kegObj?.pptkId || prog.progObj?.pptkId;
                                                if (ownPptkId) {
                                                  const match = pptkDb.find(p => p.id === ownPptkId);
                                                  if (match) return match.nama;
                                                }
                                                const code = prog.progObj?.kode;
                                                if (code === 'PRG.01' || code === 'PRG.02') return 'H. Sudarsono, S.T., M.Si.';
                                                if (code === 'PRG.03') return 'Ir. Agus Sulaeman, M.MA.';
                                                if (code === 'PRG.04') return 'Rita Sri Hartini, S.Hut.';
                                                return 'Hj. Endang Sri Mulyani, S.P., M.P.';
                                              })()}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Vertical line down to sub kegiatan stack */}
                                        <div className="w-0.5 h-6 bg-slate-350 relative z-10 my-1"></div>

                                        {/* LEVEL 3: SUB KEGIATAN STACK */}
                                        <div className="space-y-3 flex flex-col items-center w-full">
                                          {keg.subKegs.map((sk, skIdx) => {
                                            return (
                                              <React.Fragment key={sk.id}>
                                                {skIdx > 0 && (
                                                  <div className="w-0.5 h-4 bg-slate-350 -my-1.5 opacity-80"></div>
                                                )}
                                                <div className="w-[210px] bg-white text-slate-800 p-4 rounded-[20px] shadow-sm border-2 border-slate-300 hover:border-[#004882]/85 hover:shadow-md transition duration-205 text-center font-sans">
                                                  <div>
                                                    {/* LEVEL 3: SUB KEGIATAN title with dividing line */}
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
                                                      LEVEL 3: SUB KEGIATAN
                                                    </div>
                                                    <hr className="border-t border-slate-200 my-2 w-full" />
                                                    
                                                    {/* [KODE SUB KEGIATAN] [NAMA SUB KEGIATAN] */}
                                                    <div className="font-bold text-slate-800 text-[10px] leading-relaxed mb-3 min-h-[54px] flex items-center justify-center">
                                                      [{sk.kode}] {sk.nama}
                                                    </div>
                                                  </div>

                                                  <div className="space-y-2.5 my-1">
                                                    {/* [INDIKATOR OUTPUT] */}
                                                    <div className="flex flex-col items-center">
                                                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Indikator Output:</span>
                                                      <span className="font-semibold text-slate-700 text-[9.5px] leading-tight max-w-[185px]">
                                                        {sk.indikator || (sk.indikatorList?.[0]?.indikator) || 'Persentase Capaian Target Realisasi Fisik'}
                                                      </span>
                                                    </div>

                                                    {/* [TARGET TAHUN] */}
                                                    <div className="flex flex-col items-center">
                                                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Tahun:</span>
                                                      <span className="font-extrabold text-[#10b981] font-sans text-[8.5px] uppercase">
                                                        {selectedYear === 'all' ? 'RENSTRA 2025 - 2030' : `TAHUN ${selectedYear}`}
                                                      </span>
                                                    </div>

                                                    {/* [TARGET OUTPUT] */}
                                                    <div className="flex flex-col items-center">
                                                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Target Output:</span>
                                                      {selectedYear === 'all' ? (
                                                        <div className="flex flex-wrap justify-center items-center gap-0.5 mt-1 font-mono text-[7.5px] w-full">
                                                          {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                                                            const ind = sk.indikatorList?.[0];
                                                            const tk = `target${yr}` as keyof typeof ind;
                                                            const tv = ind ? String(ind[tk] || ind.target || '-') : '-';
                                                            return (
                                                              <div key={yr} className="bg-slate-50 border border-slate-150 rounded px-1 py-0.5 min-w-[27px] shadow-3xs">
                                                                <span className="text-[6px] text-slate-400 block font-normal">'{String(yr).slice(-2)}</span>
                                                                <span className="font-bold text-slate-700">{tv}</span>
                                                              </div>
                                                            );
                                                          })}
                                                        </div>
                                                      ) : (
                                                        <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-100 font-black text-[9.5px] font-mono px-2 py-0.5 rounded-full shadow-3xs mt-0.5">
                                                          {(() => {
                                                            const ind = sk.indikatorList?.[0];
                                                            const tk = `target${selectedYear}` as keyof typeof ind;
                                                            return ind ? String(ind[tk] || ind.target || '-') : (sk.target || '-');
                                                          })()}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* [PENGAMPU] */}
                                                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200">
                                                    <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Pelaksana Lapang:</span>
                                                    <div className="text-[8.5px] text-slate-600 font-bold leading-tight">
                                                      {(() => {
                                                        const ownPptkId = sk.pptkId || keg.kegObj?.pptkId || prog.progObj?.pptkId;
                                                        if (ownPptkId) {
                                                          const match = pptkDb.find(p => p.id === ownPptkId);
                                                          if (match) return `${match.bidang} (PPTK / Pengampu)`;
                                                        }
                                                        const code = sk.kode;
                                                        if (code.includes('SUB.01') || code.includes('SUB.02') || code.includes('SUB.03') || code.includes('SUB.04')) return 'Unit Ketahanan Pangan';
                                                        if (code.includes('SUB.05') || code.includes('SUB.06')) return 'Unit Sarana & JUT';
                                                        if (code.includes('SUB.07')) return 'Penyuluh Pertanian Indramayu';
                                                        return 'Sub Bagian Umum & Keuangan';
                                                      })()}
                                                    </div>
                                                    <div className="text-[8px] text-slate-400 font-medium">
                                                      {(() => {
                                                        const ownPptkId = sk.pptkId || keg.kegObj?.pptkId || prog.progObj?.pptkId;
                                                        if (ownPptkId) {
                                                          const match = pptkDb.find(p => p.id === ownPptkId);
                                                          if (match) return match.nama;
                                                        }
                                                        const code = sk.kode;
                                                        if (code.includes('SUB.01') || code.includes('SUB.02') || code.includes('SUB.03') || code.includes('SUB.04')) return 'H. Sudarsono & Tim Pengendali';
                                                        if (code.includes('SUB.05') || code.includes('SUB.06')) return 'Agus Sulaeman & Pelaksana JUT';
                                                        if (code.includes('SUB.07')) return 'Rita Sri Hartini & Penyuluh';
                                                        return 'Endang Sri M. & Tim Perencana';
                                                      })()}
                                                    </div>
                                                  </div>
                                                </div>
                                              </React.Fragment>
                                            );
                                          })}
                                          {keg.subKegs.length === 0 && (
                                            <span className="text-[10px] text-slate-300 italic block mt-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                              No Sub-Kegiatan
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FLAT ALIGNMENT MATRIKS TABLE VIEW */
        <div id="cascading-records-wrapper" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Matriks Keselarasan (Alignment Matriks) Renstra 2025-2030
            </h4>
            <span className="text-[9.5px] bg-[#004882]/10 text-[#004882] px-2.5 py-1 rounded-full font-bold uppercase">
              Total Link: {alignmentRows.length} Jalur Kinerja
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-widest font-bold text-[10px]">
                  <th className="py-3 px-3 text-center w-10">No</th>
                  <th className="py-3 px-3 min-w-[200px]">Uraian Cascading</th>
                  <th className="py-3 px-3 min-w-[150px]">Program (Level 1)</th>
                  <th className="py-3 px-3 min-w-[150px]">Kegiatan (Level 2)</th>
                  <th className="py-3 px-3 min-w-[150px]">Sub Kegiatan (Level 3)</th>
                  <th className="py-3 px-2 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-705">
                {alignmentRows.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">{index + 1}</td>

                      {/* Descriptive alignment text */}
                      <td className="py-3 px-3 w-80">
                        <p className="font-extrabold text-slate-800 text-sm leading-tight">
                          Jalur Keselarasan #{index + 1}
                        </p>
                        <div className="text-[10px] text-zinc-400 font-medium space-y-1 mt-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                          <p><span className="font-bold text-slate-500 uppercase">Tujuan:</span> {item.tujuan?.nama || '-'}</p>
                          <p><span className="font-bold text-slate-500 uppercase">Sasaran:</span> {item.sasaran?.nama || '-'}</p>
                        </div>
                      </td>

                      {/* Program outcome targets */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[9px] bg-amber-100 text-amber-850 border border-amber-200/50 px-1.5 py-0.5 rounded font-black w-fit block mb-1">
                          {item.program?.kode || 'P'}
                        </span>
                        <p className="font-extrabold text-xs text-slate-800 line-clamp-2" title={item.program?.nama}>
                          {item.program?.nama}
                        </p>
                        <div className="mt-2 text-[9px] font-mono">
                          <span className="font-bold uppercase tracking-wider block text-[8px] text-slate-400 mb-0.5">Tgt 25-30:</span>
                          <p className="font-extrabold text-amber-800/85">
                            {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                              const ind = item.program?.indikatorList?.[0];
                              const tk = `target${yr}` as keyof typeof ind;
                              const val = ind ? String(ind[tk] || ind.target || '-') : '-';
                              const isSelected = selectedYear === yr;
                              return isSelected ? `[${val}]` : val;
                            }).join(' ➔ ')}
                          </p>
                          {selectedYear !== 'all' && (
                            <div className="mt-1 bg-amber-500/15 border border-amber-300/40 text-amber-900 px-1.5 py-0.5 rounded font-black text-[9px] w-fit animate-fade-in shadow-3xs">
                              Target {selectedYear}: {(() => {
                                const ind = item.program?.indikatorList?.[0];
                                const tk = `target${selectedYear}` as keyof typeof ind;
                                return ind ? String(ind[tk] || ind.target || '-') : '-';
                              })()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Kegiatan intermediate targets */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[9px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-black w-fit block mb-1">
                          {item.kegiatan?.kode || 'K'}
                        </span>
                        <p className="font-extrabold text-xs text-slate-800 line-clamp-2" title={item.kegiatan?.nama}>
                          {item.kegiatan?.nama}
                        </p>
                        <div className="mt-2 text-[9px] font-mono">
                          <span className="font-bold uppercase tracking-wider block text-[8px] text-slate-400 mb-0.5">Tgt 25-30:</span>
                          <p className="font-extrabold text-blue-800/85">
                            {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                              const ind = item.kegiatan?.indikatorList?.[0];
                              const tk = `target${yr}` as keyof typeof ind;
                              const val = ind ? String(ind[tk] || ind.target || '-') : '-';
                              const isSelected = selectedYear === yr;
                              return isSelected ? `[${val}]` : val;
                            }).join(' ➔ ')}
                          </p>
                          {selectedYear !== 'all' && (
                            <div className="mt-1 bg-indigo-50 border border-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-black text-[9px] w-fit animate-fade-in shadow-3xs">
                              Target {selectedYear}: {(() => {
                                const ind = item.kegiatan?.indikatorList?.[0];
                                const tk = `target${selectedYear}` as keyof typeof ind;
                                return ind ? String(ind[tk] || ind.target || '-') : '-';
                              })()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sub-Kegiatan output targets */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black w-fit block mb-1">
                          {item.subKegiatan.kode}
                        </span>
                        <p className="font-extrabold text-xs text-slate-850 line-clamp-2">
                          {item.subKegiatan.nama}
                        </p>
                        <div className="mt-2 text-[9px] font-mono">
                          <span className="font-bold uppercase tracking-wider block text-[8px] text-slate-400 mb-0.5">Tgt 25-30:</span>
                          <p className="font-extrabold text-emerald-800/85">
                            {[2025, 2026, 2027, 2028, 2029, 2030].map(yr => {
                              const ind = item.subKegiatan.indikatorList?.[0];
                              const tk = `target${yr}` as keyof typeof ind;
                              const val = ind ? String(ind[tk] || ind.target || '-') : '-';
                              const isSelected = selectedYear === yr;
                              return isSelected ? `[${val}]` : val;
                            }).join(' ➔ ')}
                          </p>
                          {selectedYear !== 'all' && (
                            <div className="mt-1 bg-emerald-50 border border-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded font-black text-[9px] w-fit animate-fade-in shadow-3xs">
                              Target {selectedYear}: {(() => {
                                const ind = item.subKegiatan.indikatorList?.[0];
                                const tk = `target${selectedYear}` as keyof typeof ind;
                                return ind ? String(ind[tk] || ind.target || '-') : '-';
                              })()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action trigger visualization */}
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => setActiveVisualizerId(activeVisualizerId === item.id ? null : item.id)}
                          className={`p-1.5 text-xs font-bold rounded-lg transition border w-full flex items-center justify-center gap-1 ${
                            activeVisualizerId === item.id
                              ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
                              : 'bg-slate-100 hover:bg-[#004882]/10 hover:text-[#004882] text-slate-600 border-slate-200/80'
                          }`}
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          {activeVisualizerId === item.id ? 'Tutup Bagan' : 'Visual SAKIP'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategic Intelligence Card */}
      <div className="bg-amber-50/55 rounded-xl border border-amber-200 p-5 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Prinsip Cascading Penyelarasan Renstra</h4>
          <p className="text-xs text-amber-700 leading-relaxed mt-1">
            Setiap indikator dan target tahunan <strong>2025-2030</strong> diturunkan secara langsung dari level Sasaran Strategis (Tujuan/Sasaran), dikaitkan ke Program Pengampu, Kegiatan Unit pelaksana, hingga bermuara ke Sub-Kegiatan di level mikro. 
            Hal ini menjamin akurasi evaluasi kinerja SAKIP daerah yang transparan dan padu tanpa intervensi data fiktif.
          </p>
        </div>
      </div>
    </div>
  );
}
