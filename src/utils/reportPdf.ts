import { jsPDF } from 'jspdf';
import { autoTable, type UserOptions } from 'jspdf-autotable';
import type { DetailedReportResponse } from '../types/reports.types';
import { formatReportDate, validateReportRange } from './reports.ts';

interface ReportPdfOptions {
  userName: string;
  generatedAt?: Date;
  demo?: boolean;
}

const COLORS = {
  navy: '#17253d', blue: '#2563eb', teal: '#0f766e', green: '#047857',
  red: '#b91c1c', muted: '#52647e', line: '#dce5f0', paper: '#f3f7fc', white: '#ffffff',
};
const MARGIN = 16;
const WIDTH = 178;
const BOTTOM = 276;
const FONT = 'NotoSans';
let cachedFonts: { regular: string; bold: string } | undefined;

function safeText(value: string): string {
  return Array.from(value.normalize('NFC'), (character) => {
    if (character === '\t') return ' ';
    const code = character.codePointAt(0)!;
    return (code < 32 && code !== 10 && code !== 13) || code === 127 ? '' : character;
  }).join('');
}
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
const monthLabel = (month: string) => month.slice(5, 7) + '/' + month.slice(0, 4);
const variation = (value: number | null) => value === null ? 'Sem base de comparação' : (value > 0 ? '+' : '') + percent(value) + ' vs. período anterior';

async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  const urls = [
    new URL('../assets/fonts/NotoSans-Regular.ttf', import.meta.url),
    new URL('../assets/fonts/NotoSans-Bold.ttf', import.meta.url),
  ];
  const encoded = await Promise.all(urls.map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Não foi possível carregar a fonte do relatório. Tente novamente.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768));
    return btoa(binary);
  }));
  cachedFonts = { regular: encoded[0], bold: encoded[1] };
  return cachedFonts;
}

/** Keep the chart readable for long custom ranges; the tables retain every month. */
export function getPdfChartBuckets(history: DetailedReportResponse['history']) {
  const mode = history.length > 36 ? 'year' : history.length > 12 ? 'quarter' : 'month';
  const buckets = new Map<string, { label: string; receitas: number; despesas: number; saldo: number }>();
  for (const item of history) {
    const year = item.id.slice(0, 4);
    const key = mode === 'year' ? year : mode === 'quarter' ? `${year}-T${Math.ceil(Number(item.id.slice(5, 7)) / 3)}` : item.id;
    const current = buckets.get(key) ?? { label: mode === 'month' ? monthLabel(item.id) : mode === 'year' ? year : `${key.slice(-2)}/${year}`, receitas: 0, despesas: 0, saldo: 0 };
    current.receitas += Math.round(item.receitas * 100);
    current.despesas += Math.round(item.despesas * 100);
    current.saldo += Math.round(item.saldo * 100);
    buckets.set(key, current);
  }
  return { mode, items: [...buckets.values()].map((item) => ({ ...item, receitas: item.receitas / 100, despesas: item.despesas / 100, saldo: item.saldo / 100 })) };
}

export async function createReportPdf(report: DetailedReportResponse, options: ReportPdfOptions) {
  const invalidRange = validateReportRange(report.dataInicio, report.dataFim);
  if (invalidRange) throw new Error(invalidRange);
  const fonts = await loadFonts();
  const generatedAt = options.generatedAt ?? new Date();
  const issued = generatedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
  const period = formatReportDate(report.dataInicio) + ' a ' + formatReportDate(report.dataFim);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  pdf.addFileToVFS('NotoSans-Regular.ttf', fonts.regular);
  pdf.addFont('NotoSans-Regular.ttf', FONT, 'normal');
  pdf.addFileToVFS('NotoSans-Bold.ttf', fonts.bold);
  pdf.addFont('NotoSans-Bold.ttf', FONT, 'bold');
  pdf.setProperties({ title: 'Relatório financeiro | ' + period, author: safeText(options.userName), creator: 'Cifra Wealth', subject: 'Transações confirmadas e análise do período selecionado' });
  pdf.setCreationDate(generatedAt);
  let y = 0;

  function text(value: string, x: number, top: number, size = 9, color = COLORS.navy, bold = false, align: 'left' | 'right' | 'center' = 'left') {
    pdf.setFont(FONT, bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(safeText(value), x, top, { align });
  }
  function lines(value: string, width = WIDTH, size = 8.5): string[] {
    pdf.setFont(FONT, 'normal'); pdf.setFontSize(size);
    return pdf.splitTextToSize(safeText(value), width) as string[];
  }
  function newPage() { pdf.addPage(); y = 35; }
  function ensure(height: number) { if (y + height > BOTTOM) newPage(); }
  function paragraph(value: string, color = COLORS.muted, size = 8.5) {
    for (const line of lines(value, WIDTH, size)) { ensure(4.5); text(line, MARGIN, y, size, color); y += 4.5; }
    y += 3;
  }
  function section(title: string, note?: string) {
    const noteLines = note ? lines(note) : [];
    ensure(30 + noteLines.length * 4.5);
    text(title, MARGIN, y, 13, COLORS.navy, true);
    y += 6;
    if (note) paragraph(note);
    else y += 3;
  }
  function table(settings: UserOptions) {
    autoTable(pdf, {
      theme: 'striped', startY: y,
      margin: { top: 34, bottom: 22, left: MARGIN, right: MARGIN },
      tableWidth: WIDTH, rowPageBreak: 'avoid', showHead: 'everyPage', showFoot: 'lastPage',
      styles: { font: FONT, fontSize: 8, textColor: COLORS.navy, cellPadding: 2.6, overflow: 'linebreak', valign: 'middle', lineWidth: 0 },
      headStyles: { fillColor: COLORS.navy, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: '#eaf0fb', textColor: COLORS.navy, fontStyle: 'bold', halign: 'right' },
      alternateRowStyles: { fillColor: COLORS.paper },
      ...settings,
    });
    y = (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }
  function fitted(value: string, x: number, top: number, maxWidth: number, color: string, initial = 19) {
    pdf.setFont(FONT, 'bold');
    let size = initial;
    pdf.setFontSize(size);
    while (pdf.getTextWidth(value) > maxWidth && size > 9) { size -= 0.5; pdf.setFontSize(size); }
    text(value, x, top, size, color, true);
  }
  function logo(x: number, top: number, white = false) {
    pdf.setDrawColor(white ? COLORS.white : COLORS.blue);
    pdf.setLineWidth(0.65);
    pdf.path([
      { op: 'm', c: [x + 4.5, top + 2] },
      { op: 'c', c: [x + 1, top - 1, x - 2, top + 5.5, x + 1.5, top + 5.5] },
      { op: 'c', c: [x + 5, top + 5.5, x + 5.5, top, x + 8, top] },
      { op: 'c', c: [x + 12, top, x + 12, top + 5.5, x + 8.5, top + 5.5] },
      { op: 'c', c: [x + 6, top + 5.5, x + 5.5, top + 3, x + 4.5, top + 2] },
    ]).stroke();
    text('CIFRA Wealth', x + 15, top + 4.5, 11, white ? COLORS.white : COLORS.navy, true);
  }

  // Cover: native text and vector graphics stay sharp when printed or zoomed.
  pdf.setFillColor(COLORS.navy); pdf.rect(0, 0, 210, 44, 'F');
  logo(MARGIN, 7, true);
  text('Relatório financeiro', MARGIN, 29, 23, COLORS.white, true);
  text(period, MARGIN, 38, 10, '#dbeafe');
  if (options.demo) text('DEMONSTRAÇÃO · DADOS FICTÍCIOS', 194, 13, 7, '#fde68a', true, 'right');
  text('PREPARADO PARA', MARGIN, 53, 7, COLORS.muted, true);
  const nameLines = lines(options.userName || 'Usuário', 113, 10);
  nameLines.forEach((line, index) => text(line, MARGIN, 59 + index * 5, 10, COLORS.navy, true));
  text('EMITIDO EM · HORÁRIO DE BRASÍLIA', 194, 53, 6.5, COLORS.muted, true, 'right');
  text(issued, 194, 59, 8, COLORS.muted, false, 'right');
  y = Math.max(72, 66 + nameLines.length * 5);

  const summary = report.summary;
  const cards = [
    { label: 'RECEITAS', value: money(summary.receitas), note: variation(summary.variacaoReceitas), color: COLORS.green },
    { label: 'DESPESAS', value: money(summary.despesas), note: variation(summary.variacaoDespesas), color: COLORS.red },
    { label: 'SALDO DO PERÍODO', value: money(summary.saldo), note: variation(summary.variacaoSaldo), color: summary.saldo < 0 ? COLORS.red : COLORS.blue },
    { label: 'TAXA DE ECONOMIA', value: percent(summary.taxaEconomiaPercentual), note: variation(summary.variacaoTaxaEconomia), color: COLORS.teal },
  ];
  cards.forEach((card, index) => {
    const x = MARGIN + index % 2 * 92;
    const top = y + Math.floor(index / 2) * 35;
    pdf.setFillColor(COLORS.paper); pdf.setDrawColor(COLORS.line);
    pdf.roundedRect(x, top, 86, 30, 2.5, 2.5, 'FD');
    pdf.setFillColor(card.color); pdf.roundedRect(x, top, 1.2, 30, 0.5, 0.5, 'F');
    text(card.label, x + 5, top + 6.5, 7, COLORS.muted, true);
    fitted(card.value, x + 5, top + 17, 76, card.color);
    text(card.note, x + 5, top + 25, 6.5, COLORS.muted);
  });
  y += 72;
  paragraph('Saldo calculado a partir dos lançamentos confirmados do período. Não representa consulta bancária nem inclui reservas das metas.', COLORS.muted, 7.5);

  section('Evolução financeira');
  const chart = getPdfChartBuckets(report.history);
  text(chart.mode === 'year' ? 'Agrupado por ano · detalhes mensais nas próximas páginas' : chart.mode === 'quarter' ? 'Agrupado por trimestre · detalhes mensais nas próximas páginas' : 'Receitas, despesas e saldo em cada mês do período', MARGIN, y, 7.5, COLORS.muted);
  y += 6;
  const chartTop = y, chartHeight = 48, chartX = MARGIN + 24, chartWidth = WIDTH - 26;
  const hasActivity = report.transactions.length > 0;
  if (!hasActivity || chart.items.length === 0) {
    pdf.setDrawColor(COLORS.line); pdf.roundedRect(MARGIN, chartTop, WIDTH, 55, 2, 2, 'S');
    text('Nenhuma movimentação confirmada neste período.', 105, chartTop + 28, 10, COLORS.muted, false, 'center');
  } else {
    const values = chart.items.flatMap((item) => [item.receitas, item.despesas, item.saldo]);
    const min = Math.min(0, ...values), max = Math.max(1, ...values);
    const valueY = (value: number) => chartTop + chartHeight - (value - min) / (max - min) * chartHeight;
    for (let step = 0; step <= 4; step++) {
      const value = min + (max - min) * step / 4;
      const top = valueY(value);
      pdf.setDrawColor(COLORS.line); pdf.setLineWidth(0.2); pdf.line(chartX, top, chartX + chartWidth, top);
      text(value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }), chartX - 3, top + 1, 6.5, COLORS.muted, false, 'right');
    }
    text('R$', MARGIN, chartTop - 1, 6.5, COLORS.muted);
    const stepWidth = chartWidth / chart.items.length;
    const barWidth = Math.min(4.5, stepWidth * 0.24);
    let previous: { x: number; y: number } | undefined;
    chart.items.forEach((item, index) => {
      const center = chartX + stepWidth * (index + 0.5);
      for (const [value, color, offset] of [[item.receitas, COLORS.green, -barWidth - 0.5], [item.despesas, COLORS.red, 0.5]] as const) {
        if (value > 0) { pdf.setFillColor(color); pdf.rect(center + offset, valueY(value), barWidth, valueY(0) - valueY(value), 'F'); }
      }
      const point = { x: center, y: valueY(item.saldo) };
      pdf.setDrawColor(COLORS.blue); pdf.setLineWidth(0.7);
      if (previous) pdf.line(previous.x, previous.y, point.x, point.y);
      pdf.setFillColor(COLORS.blue); pdf.circle(point.x, point.y, 0.7, 'F'); previous = point;
      text(item.label, center, chartTop + chartHeight + 6, 6.3, COLORS.muted, false, 'center');
    });
    [['Receitas', COLORS.green], ['Despesas', COLORS.red], ['Saldo', COLORS.blue]].forEach(([label, color], index) => {
      const x = MARGIN + index * 33; pdf.setFillColor(color); pdf.circle(x + 1, chartTop + 63, 1, 'F'); text(label, x + 4, chartTop + 64, 7, COLORS.muted);
    });
  }
  y = chartTop + 76;
  paragraph(`${report.transactions.length} transações confirmadas entre ${period}, com datas inclusivas. Comparação com o período anterior de mesma duração. Todos os registros estão incluídos no detalhamento.`, COLORS.muted, 8);

  newPage();
  section('Detalhamento mensal', 'Os meses inicial e final respeitam exatamente as datas aplicadas. Valores em reais; variações em relação ao mês anterior.');
  table({
    head: [['Mês', 'Receitas', 'Despesas', 'Saldo', 'Variação do saldo']],
    body: report.history.map((item) => [safeText(item.periodo), money(item.receitas), money(item.despesas), money(item.saldo), item.variacaoPercentual === null ? 'Sem base' : percent(item.variacaoPercentual)]),
    columnStyles: { 0: { cellWidth: 44 }, 1: { halign: 'right', cellWidth: 34 }, 2: { halign: 'right', cellWidth: 34 }, 3: { halign: 'right', cellWidth: 36 }, 4: { halign: 'right', cellWidth: 30 } },
    foot: [[{ content: 'Total do período', styles: { fontStyle: 'bold', halign: 'left' } }, money(summary.receitas), money(summary.despesas), money(summary.saldo), '']],
  });

  section('Distribuição das despesas', 'Participação de cada categoria nas despesas confirmadas do período.');
  if (report.categoryBreakdown.length) {
    const sorted = [...report.categoryBreakdown].sort((a, b) => b.total - a.total);
    ensure(Math.min(sorted.length, 5) * 11 + 5);
    for (const item of sorted.slice(0, 5)) {
      pdf.setFont(FONT, 'normal'); pdf.setFontSize(8);
      const label = lines(item.nome, 113, 8)[0];
      text(label + (lines(item.nome, 113, 8).length > 1 ? '…' : ''), MARGIN, y, 8);
      text(money(item.total) + ' · ' + percent(item.percentual), 194, y, 7.5, COLORS.muted, false, 'right');
      pdf.setFillColor(COLORS.paper); pdf.roundedRect(MARGIN, y + 2, WIDTH, 2, 1, 1, 'F');
      if (item.percentual > 0) { pdf.setFillColor(COLORS.blue); pdf.roundedRect(MARGIN, y + 2, Math.max(1, WIDTH * Math.min(item.percentual, 100) / 100), 2, 0.6, 0.6, 'F'); }
      y += 11;
    }
    y += 3;
    table({ head: [['Categoria', 'Total', 'Participação']], body: sorted.map((item) => [safeText(item.nome), money(item.total), percent(item.percentual)]), columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 44, halign: 'right' }, 2: { cellWidth: 34, halign: 'right' } }, foot: [['Total de despesas', money(summary.despesas), summary.despesas > 0 ? '100%' : '0%']] });
  } else paragraph('Não há despesas confirmadas neste período.');

  section('Leitura do período');
  if (report.insights.length) {
    for (const insight of report.insights) paragraph(insight.mensagem, insight.tipo === 'negativo' ? COLORS.red : insight.tipo === 'positivo' ? COLORS.green : COLORS.muted);
  } else paragraph('Ainda não há movimentações suficientes para gerar observações sobre este período.');

  section('Metas · situação atual', 'Posição na emissão deste documento, independente do período selecionado. As reservas são registros manuais e não são descontadas do saldo acima.');
  if (report.goals.length) table({
    head: [['Meta', 'Valor guardado', 'Objetivo', 'Progresso']],
    body: report.goals.map((goal) => [safeText(goal.nome), money(goal.valorAtual), money(goal.valorAlvo), percent(goal.valorAlvo > 0 ? Math.min(100, Math.floor(goal.valorAtual / goal.valorAlvo * 100)) : 0)]),
    columnStyles: { 0: { cellWidth: 64 }, 1: { cellWidth: 42, halign: 'right' }, 2: { cellWidth: 42, halign: 'right' }, 3: { cellWidth: 30, halign: 'right' } },
  });
  else paragraph('Nenhuma meta ativa foi cadastrada até a emissão deste relatório.');

  const ledgerRowsHeight = report.transactions.slice(0, 7).reduce((height, item) => height + Math.max(lines(item.descricao, 58.8, 8).length, lines(item.categoria, 31.8, 8).length) * 3.3 + 5.2, 0);
  if (report.transactions.length > 6 || (report.transactions.length > 0 && y + ledgerRowsHeight + 43 > BOTTOM)) newPage();
  section('Transações detalhadas', `${report.transactions.length} registros confirmados no período aplicado. Receitas e despesas são identificadas separadamente; valores em reais.`);
  if (report.transactions.length) table({
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: report.transactions.map((item) => [formatReportDate(item.data), safeText(item.descricao), safeText(item.categoria), item.tipo === 'receita' ? 'Receita' : 'Despesa', { content: money(item.valor), styles: { textColor: item.tipo === 'receita' ? COLORS.green : COLORS.red, fontStyle: 'bold' } }]),
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 64 }, 2: { cellWidth: 37 }, 3: { cellWidth: 20 }, 4: { cellWidth: 37, halign: 'right' } },
    foot: [[{ content: 'Saldo do período · ' + report.transactions.length + ' transações', colSpan: 4 }, money(summary.saldo)]],
  });
  else paragraph('Nenhuma transação confirmada foi encontrada nas datas selecionadas.');

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    if (page > 1) {
      logo(MARGIN, 9);
      text('RELATÓRIO FINANCEIRO', 194, 13, 7, COLORS.muted, true, 'right');
      text(period, 194, 20, 7, COLORS.muted, false, 'right');
      pdf.setDrawColor(COLORS.line); pdf.setLineWidth(0.3); pdf.line(MARGIN, 26, 194, 26);
    }
    pdf.setDrawColor(COLORS.line); pdf.setLineWidth(0.25); pdf.line(MARGIN, 281, 194, 281);
    text(options.demo ? 'Cifra Wealth · DEMONSTRAÇÃO · Dados fictícios' : 'Cifra Wealth · Emitido em ' + issued, MARGIN, 287, 6.8, COLORS.muted);
    text(`Página ${page} de ${pages}`, 194, 287, 7, COLORS.muted, false, 'right');
  }
  return pdf;
}

export async function downloadReportPdf(report: DetailedReportResponse, options: ReportPdfOptions) {
  const pdf = await createReportPdf(report, options);
  pdf.save(`relatorio-${report.dataInicio}-a-${report.dataFim}.pdf`);
}
