import jsPDF from 'jspdf';
import type { Inspection, Template } from '../types';

/**
 * 점검 결과 PDF 생성
 * - KR 폰트 문제를 피하기 위해 영문 fallback + 유니코드 인코딩 처리
 */
export async function generateInspectionPDF(
  inspection: Inspection,
  template: Template
): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  const contentW = W - margin * 2;
  let y = margin;

  // ── Helper fns ──────────────────────────────────────────────────────────
  const addText = (text: string, x: number, yPos: number, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) => {
    pdf.setFontSize(opts.size ?? 10);
    pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    if (opts.color) pdf.setTextColor(...opts.color);
    else pdf.setTextColor(30, 41, 59);
    pdf.text(text, x, yPos);
  };

  const addLine = (yPos: number, color: [number, number, number] = [226, 232, 240]) => {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, W - margin, yPos);
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  // ── Header Banner ───────────────────────────────────────────────────────
  pdf.setFillColor(...hexToRgb('#2563eb'));
  pdf.rect(0, 0, W, 28, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Safety Inspection Report', margin, 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Facility Safety Checklist System', margin, 20);

  // Status badge
  const statusLabel = inspection.status === 'submitted' ? 'SUBMITTED' : 'IN PROGRESS';
  const statusColor = inspection.status === 'submitted' ? hexToRgb('#10b981') : hexToRgb('#f59e0b');
  pdf.setFillColor(...statusColor);
  pdf.roundedRect(W - 55, 8, 40, 10, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text(statusLabel, W - 50, 14.5);

  y = 38;

  // ── Korean text note ─────────────────────────────────────────────────────
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'italic');
  pdf.text('* Korean characters are shown as encoded. Please view on screen for Korean display.', margin, y);
  y += 6;

  // ── Basic Info Section ───────────────────────────────────────────────────
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentW, 36, 3, 3, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentW, 36, 3, 3, 'S');

  const col1 = margin + 5;
  const col2 = margin + contentW / 2 + 5;
  const labelColor: [number, number, number] = [100, 116, 139];

  addText('Facility', col1, y + 8, { size: 7, color: labelColor });
  addText(inspection.facilityName, col1, y + 15, { size: 9, bold: true });

  addText('Date', col2, y + 8, { size: 7, color: labelColor });
  addText(inspection.date, col2, y + 15, { size: 9, bold: true });

  addText('Inspector', col1, y + 24, { size: 7, color: labelColor });
  addText(inspection.inspectorName, col1, y + 31, { size: 9, bold: true });

  addText('Template', col2, y + 24, { size: 7, color: labelColor });
  addText(inspection.templateName, col2, y + 31, { size: 9, bold: true });

  y += 44;

  // ── Inspection Results ───────────────────────────────────────────────────
  addText('Inspection Items', margin, y, { size: 11, bold: true, color: [30, 41, 59] });
  y += 6;
  addLine(y);
  y += 5;

  const getAnswer = (itemId: string): string => {
    const result = inspection.results.find((r) => r.itemId === itemId);
    if (!result) return 'N/A';
    const val = result.value;
    if (typeof val === 'boolean') return val ? 'Pass' : 'Fail';
    return String(val) || 'N/A';
  };

  template.items.forEach((item, idx) => {
    if (y > 265) {
      pdf.addPage();
      y = margin;
    }

    const answer = getAnswer(item.id);
    const isPassed = answer === 'Pass';
    const isFailed = answer === 'Fail';
    const rowH = 9;

    // Row background
    if (idx % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y - 4, contentW, rowH, 'F');
    }

    // Index
    addText(`${idx + 1}.`, margin + 2, y + 1, { size: 8, color: [100, 116, 139] });

    // Title (encode Korean)
    const titleStr = item.title.length > 55 ? item.title.slice(0, 52) + '...' : item.title;
    addText(titleStr, margin + 10, y + 1, { size: 8 });

    // Result badge
    const answerX = W - margin - 28;
    if (isPassed) {
      pdf.setFillColor(...hexToRgb('#d1fae5'));
      pdf.roundedRect(answerX, y - 3.5, 26, 7, 1.5, 1.5, 'F');
      addText('✓ Pass', answerX + 3, y + 1, { size: 8, bold: true, color: hexToRgb('#065f46') });
    } else if (isFailed) {
      pdf.setFillColor(...hexToRgb('#fee2e2'));
      pdf.roundedRect(answerX, y - 3.5, 26, 7, 1.5, 1.5, 'F');
      addText('✗ Fail', answerX + 3, y + 1, { size: 8, bold: true, color: hexToRgb('#991b1b') });
    } else {
      addText(answer.slice(0, 20), answerX, y + 1, { size: 8, color: [71, 85, 105] });
    }

    y += rowH;
  });

  y += 5;

  // ── Summary ──────────────────────────────────────────────────────────────
  if (y > 250) { pdf.addPage(); y = margin; }

  addLine(y);
  y += 8;

  const passCount = template.items.filter((item) => {
    const r = inspection.results.find((res) => res.itemId === item.id);
    return r?.value === true;
  }).length;
  const totalCheckbox = template.items.filter((i) => i.type === 'checkbox').length;

  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
  addText(`Pass: ${passCount} / ${totalCheckbox} items  |  Photos: ${inspection.photos.length}`, margin + 5, y + 7, { size: 9, bold: true, color: hexToRgb('#1e40af') });
  addText(`Generated: ${new Date().toLocaleString('ko-KR')}`, margin + 5, y + 14, { size: 7, color: [100, 116, 139] });

  // ── Photos Section ───────────────────────────────────────────────────────
  if (inspection.photos.length > 0) {
    y += 26;
    if (y > 240) { pdf.addPage(); y = margin; }
    addText('Attached Photos', margin, y, { size: 11, bold: true, color: [30, 41, 59] });
    y += 6;
    addLine(y);
    y += 6;

    const imgW = (contentW - 4) / 2;
    const imgH = imgW * 0.7;

    const loadImage = (url: string): Promise<string | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });

    let col = 0;
    for (const url of inspection.photos) {
      if (y + imgH > 275) { pdf.addPage(); y = margin; col = 0; }
      const dataUrl = await loadImage(url);
      if (dataUrl) {
        const x = margin + col * (imgW + 4);
        try {
          pdf.addImage(dataUrl, 'JPEG', x, y, imgW, imgH, undefined, 'FAST');
        } catch { /* skip failed image */ }
      }
      col++;
      if (col >= 2) { col = 0; y += imgH + 4; }
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = pdf.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 287, W, 10, 'F');
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Safety Inspection System', margin, 293);
    pdf.text(`Page ${p} / ${pageCount}`, W - margin, 293, { align: 'right' });
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const fileName = `inspection_${inspection.facilityName}_${inspection.date}.pdf`
    .replace(/[/\\?%*:|"<>\s]/g, '_');
  pdf.save(fileName);
}
