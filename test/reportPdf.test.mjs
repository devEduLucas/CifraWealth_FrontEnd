import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPdfChartBuckets } from '../src/utils/reportPdf.ts';

function months(count, start = '2024-02') {
  const date = new Date(start + '-01T00:00:00Z');
  return Array.from({ length: count }, (_, index) => {
    const current = new Date(date); current.setUTCMonth(current.getUTCMonth() + index);
    return { id: current.toISOString().slice(0, 7), periodo: 'rótulo localizado', receitas: 0.1, despesas: 0.3, saldo: -0.2, variacaoPercentual: null };
  });
}

test('gráfico do PDF usa identificadores de mês, não os rótulos localizados', () => {
  const chart = getPdfChartBuckets(months(3, '2025-12'));
  assert.equal(chart.mode, 'month');
  assert.deepEqual(chart.items.map(item => item.label), ['12/2025', '01/2026', '02/2026']);
  assert.equal(chart.items[0].saldo, -0.2);
});

test('agrupamento trimestral preserva centavos e totais em períodos longos', () => {
  const chart = getPdfChartBuckets(months(24));
  assert.equal(chart.mode, 'quarter');
  assert.equal(chart.items[0].label, 'T1/2024');
  assert.deepEqual(chart.items[0], { label: 'T1/2024', receitas: 0.2, despesas: 0.6, saldo: -0.4 });
  assert.equal(chart.items.reduce((sum, item) => sum + Math.round(item.receitas * 100), 0), 240);
  assert.equal(chart.items.reduce((sum, item) => sum + Math.round(item.despesas * 100), 0), 720);
  assert.equal(chart.items.reduce((sum, item) => sum + Math.round(item.saldo * 100), 0), -480);
});

test('gráfico anual continua legível no limite de cinco anos e aceita período vazio', () => {
  const chart = getPdfChartBuckets(months(61));
  assert.equal(chart.mode, 'year');
  assert.equal(chart.items.length, 6);
  assert.equal(chart.items.reduce((sum, item) => sum + Math.round(item.receitas * 100), 0), 610);
  assert.deepEqual(getPdfChartBuckets([]), { mode: 'month', items: [] });
});
