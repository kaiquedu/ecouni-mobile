import jsPDF from 'jspdf';
import * as FileSystem from 'expo-file-system';
import { WASTE_ORDER, WASTE_TYPES } from '../../theme';
import { formatDate, formatLitros, formatTime } from '../../utils/format';
import { buckets, periodLabel, rowsFor, summarize } from './reportData';

const NAVY = [15, 49, 80];
const INK = [20, 39, 61];
const MUTED = [107, 122, 140];
const LINE = [227, 232, 238];
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export function buildReportPdf({ list, filters, granularity, includeSummary, includeList, showPeople }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  let y = 0;

  const header = () => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ECOUNI', M, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Relatório de coletas', W - M, 12, { align: 'right' });
    doc.text(periodLabel(filters), W - M, 18, { align: 'right' });
    y = 36;
  };

  const ensure = (h) => {
    if (y + h > H - 20) {
      doc.addPage();
      header();
    }
  };

  header();
  const sum = summarize(list);
  doc.setTextColor(...INK);

  if (includeSummary) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Resumo', M, y);
    y += 6;

    const boxW = (W - M * 2 - 8) / 3;
    [
      ['Volume total', formatLitros(sum.totals.total)],
      ['Reciclado', `${Math.round(sum.reciclado * 100)}%`],
      ['Coletas', String(sum.count)],
    ].forEach(([label, value], i) => {
      const x = M + i * (boxW + 4);
      doc.setFillColor(243, 246, 249);
      doc.roundedRect(x, y, boxW, 20, 2, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(label, x + 4, y + 7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...INK);
      doc.text(value, x + 4, y + 16);
    });
    y += 28;

    const data = buckets(list, filters, granularity);
    const chartH = 50;
    const max = Math.max(1, ...data.map((d) => d.total));
    const colW = (W - M * 2) / Math.max(1, data.length);
    data.forEach((d, i) => {
      let top = y + chartH;
      const x = M + i * colW + colW * 0.18;
      WASTE_ORDER.forEach((k) => {
        if (!d[k]) return;
        const h = (d[k] / max) * chartH;
        top -= h;
        doc.setFillColor(...hex(WASTE_TYPES[k].color));
        doc.rect(x, top, colW * 0.64, h, 'F');
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(d.label, M + i * colW + colW / 2, y + chartH + 5, { align: 'center' });
    });
    doc.setDrawColor(...LINE);
    doc.line(M, y + chartH, W - M, y + chartH);
    y += chartH + 12;

    WASTE_ORDER.forEach((k) => {
      doc.setFillColor(...hex(WASTE_TYPES[k].color));
      doc.rect(M, y - 3, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(WASTE_TYPES[k].label, M + 6, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatLitros(sum.totals[k]), W - M - 18, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(`${sum.pct(k)}%`, W - M, y, { align: 'right' });
      y += 6;
    });
    y += 6;
  }

  if (includeList) {
    ensure(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text('Coletas', M, y);
    y += 7;
    const cols = showPeople
      ? [['Data', M], ['Tipo', M + 34], ['Saco x qtd', M + 76], ['Total', M + 104], ['Colaborador', M + 124]]
      : [['Data', M], ['Tipo', M + 40], ['Saco x qtd', M + 92], ['Total', M + 126], ['Obs.', M + 146]];
    const drawHead = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      cols.forEach(([t, x]) => doc.text(t, x, y));
      y += 2;
      doc.setDrawColor(...LINE);
      doc.line(M, y, W - M, y);
      y += 5;
    };
    drawHead();
    rowsFor(list).forEach((r) => {
      if (y > H - 24) {
        doc.addPage();
        header();
        drawHead();
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      const values = [
        `${formatDate(r.date)} ${formatTime(r.date)}`,
        r.tipo.longLabel,
        `${r.TamanhoSaco} L x ${r.Quantidade}`,
        formatLitros(r.litros),
        showPeople ? r.NomeColaborador || '-' : r.Observacoes || '-',
      ];
      cols.forEach(([, x], i) => doc.text(doc.splitTextToSize(values[i], i === 4 ? W - M - x : 60)[0], x, y));
      y += 6;
    });
  }

  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Centro Universitário UNIFAAT · EcoUni', M, H - 10);
    doc.text(`Gerado em ${formatDate(new Date())} às ${formatTime(new Date())} · Página ${p} de ${pages}`, W - M, H - 10, { align: 'right' });
  }
  return { base64: doc.output('datauristring').split(',')[1], pages };
}

export async function writeTempPdf(base64, name) {
  const uri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

export async function savePdfToFolder(base64, name) {
  const { StorageAccessFramework: SAF } = FileSystem;
  const perm = await SAF.requestDirectoryPermissionsAsync();
  if (!perm.granted) return null;
  const uri = await SAF.createFileAsync(perm.directoryUri, name.replace(/\.pdf$/, ''), 'application/pdf');
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}
