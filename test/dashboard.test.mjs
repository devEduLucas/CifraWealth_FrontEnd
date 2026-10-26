import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardPeriods, expenseComparison } from '../src/utils/dashboard.ts';

test('dashboard compares equal elapsed days across year boundaries', () => {
  assert.deepEqual(dashboardPeriods(new Date(2027, 0, 12)), {
    currentMonth: '2027-01', previousMonth: '2026-12', previousYear: 2026,
    currentComparisonEnd: '2027-01-12', previousComparisonEnd: '2026-12-12', comparisonDays: 12,
  });
});

test('comparison caps both windows to the shorter month, including leap years', () => {
  const march = dashboardPeriods(new Date(2027, 2, 31));
  assert.equal(march.currentComparisonEnd, '2027-03-28');
  assert.equal(march.previousComparisonEnd, '2027-02-28');
  assert.equal(march.comparisonDays, 28);
  const leapMarch = dashboardPeriods(new Date(2028, 2, 31));
  assert.equal(leapMarch.currentComparisonEnd, '2028-03-29');
  assert.equal(leapMarch.previousComparisonEnd, '2028-02-29');
  const february = dashboardPeriods(new Date(2027, 1, 28));
  assert.equal(february.previousComparisonEnd, '2027-01-28');
});

const report = (expenses) => ({ mes: '2026-10', total_receitas: 100, total_despesas: expenses, saldo: 100 - expenses });

test('expense comparison describes direction without a contradictory negative percentage', () => {
  assert.deepEqual(expenseComparison(report(50), report(100), 25), { text: '50% menos que no mês anterior · dias 1 a 25', tone: 'text-positive' });
  assert.deepEqual(expenseComparison(report(150), report(100), 25), { text: '50% mais que no mês anterior · dias 1 a 25', tone: 'text-danger' });
  assert.deepEqual(expenseComparison(report(100), report(100), 25), { text: 'Sem variação em relação ao mês anterior · dias 1 a 25', tone: 'text-muted' });
});

test('missing comparison or a zero baseline does not invent a growth percentage', () => {
  assert.equal(expenseComparison(undefined, report(100), 25), null);
  assert.equal(expenseComparison(report(100), undefined, 25), null);
  assert.equal(expenseComparison(report(100), report(0), 25), null);
});
