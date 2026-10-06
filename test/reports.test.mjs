import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presetReportRange, reportCsv, validateReportRange } from '../src/utils/reports.ts';

test('valide datas reais, intervalos ordenados e limite de período', () => {
  assert.equal(validateReportRange('2026-10-05', '2026-10-25'), null);
  assert.equal(validateReportRange('2024-02-29', '2024-03-01'), null);
  for (const [start, end] of [
    ['', '2026-10-25'],
    ['2026-02-30', '2026-03-01'],
    ['2026-02-29', '2026-03-01'],
    ['2026-10-25', '2026-10-05'],
    ['2020-01-01', '2026-01-01'],
  ]) assert.ok(validateReportRange(start, end));
});

test('presets atravessem o ano e terminem na data local', () => {
  assert.deepEqual(presetReportRange('3m', new Date(2026, 0, 6)), { start: '2025-11-01', end: '2026-01-06' });
});

test('CSV contenha detalhes, BOM, centavos e proteção contra fórmulas', () => {
  const report = {
    dataInicio: '2026-10-01', dataFim: '2026-10-31',
    summary: { receitas: 50, despesas: 0, saldo: 50, taxaEconomiaPercentual: 100 },
    history: [], categoryBreakdown: [], goals: [],
    transactions: [{ id: 1, data: '2026-10-06', descricao: '=HYPERLINK("teste")', categoria: 'Categoria', tipo: 'receita', valor: 50 }],
  };
  const csv = reportCsv(report);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes(String.fromCharCode(34, 39, 61)));
  assert.ok(csv.includes('"50,00"'));
  assert.ok(csv.includes('06/10/2026'));
  assert.ok(csv.includes('"Categoria"'));
});
