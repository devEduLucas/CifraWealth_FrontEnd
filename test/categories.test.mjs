import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCategoryUsage,
  categoryUsageSummary,
  rankCategoryUsage,
  orderCategoryUsage,
  categoryTransactionsLink,
} from '../src/utils/categoryUsage.ts';
import { readTransactionFilters } from '../src/utils/transactions.ts';

const today = '2026-10-23';
const period = { start: '2026-10-01', end: today };
const category = (id, nome, tipo = 'despesa') => ({
  id_categoria: id,
  nome,
  tipo,
  cor: null,
  icone: null,
});
const transaction = (id, amount, patch = {}) => ({
  id_transacao: id,
  id_categoria: 1,
  valor: amount,
  tipo: 'despesa',
  status: 'confirmada',
  data_transacao: today,
  descricao: 'Teste',
  ...patch,
});

test('uso soma centavos apenas de confirmações no período inclusivo e preserva vínculo histórico', () => {
  const rows = buildCategoryUsage(
    [category(1, 'Alimentação'), category(2, 'Sem uso')],
    [
      transaction(1, 0.1),
      transaction(2, 0.2, { data_transacao: period.start }),
      transaction(3, 100, { status: 'pendente' }),
      transaction(4, 100, { data_transacao: '2026-10-24' }),
      transaction(5, 100, { data_transacao: '2026-09-30' }),
    ],
    period,
    today,
  );
  assert.deepEqual(
    rows.map(({ amount, count, historyCount }) => ({
      amount,
      count,
      historyCount,
    })),
    [
      { amount: 0.3, count: 2, historyCount: 5 },
      { amount: 0, count: 0, historyCount: 0 },
    ],
  );
});

test('ranking por quantidade é independente do ranking por valor e mantém receitas separadas', () => {
  const rows = buildCategoryUsage(
    [
      category(1, 'Moradia'),
      category(2, 'Alimentação'),
      category(3, 'Salário', 'receita'),
    ],
    [
      transaction(1, 900),
      transaction(2, 10, { id_categoria: 2 }),
      transaction(3, 10, { id_categoria: 2 }),
      transaction(4, 2000, { id_categoria: 3, tipo: 'receita' }),
    ],
    period,
    today,
  );
  assert.equal(
    rankCategoryUsage(rows, 'despesa', 'amount')[0].category.nome,
    'Moradia',
  );
  assert.equal(
    rankCategoryUsage(rows, 'despesa', 'count')[0].category.nome,
    'Alimentação',
  );
  assert.deepEqual(categoryUsageSummary(rows, 'despesa'), {
    amount: 920,
    count: 3,
    used: 2,
    total: 2,
  });
  assert.equal(categoryUsageSummary(rows, 'receita').amount, 2000);
});

test('cinco primeiras usam todas as categorias do tipo como denominador e não incluem as sem uso', () => {
  const categories = Array.from({ length: 8 }, (_, id) =>
    category(id + 1, `Categoria ${id + 1}`),
  );
  const transactions = Array.from({ length: 7 }, (_, id) =>
    transaction(id + 1, 10, { id_categoria: id + 1 }),
  );
  const rows = buildCategoryUsage(categories, transactions, period, today);
  const ranking = rankCategoryUsage(rows, 'despesa', 'amount');
  assert.equal(ranking.length, 5);
  assert.ok(Math.abs(ranking[0].share - 100 / 7) < 1e-10);
  assert.ok(ranking.reduce((sum, row) => sum + row.share, 0) < 100);
  assert.deepEqual(categoryUsageSummary(rows, 'despesa'), {
    amount: 70,
    count: 7,
    used: 7,
    total: 8,
  });
});

test('busca ignora acentos, ordena empates por nome e mantém categorias sem uso na lista', () => {
  const rows = buildCategoryUsage(
    [category(1, 'Saúde'), category(2, 'Alimentação'), category(3, 'Sem uso')],
    [transaction(1, 10), transaction(2, 10, { id_categoria: 2 })],
    period,
    today,
  );
  assert.equal(
    orderCategoryUsage(rows, 'despesa', 'amount')[0].category.nome,
    'Alimentação',
  );
  assert.equal(
    orderCategoryUsage(rows, 'despesa', 'name', ' SAUDE ')[0].category.nome,
    'Saúde',
  );
  assert.equal(orderCategoryUsage(rows, 'despesa', 'name').length, 3);
  assert.equal(rows[0].category.nome, 'Saúde');
});

test('período aberto continua excluindo datas futuras e ignora registros sem categoria ou com tipo inconsistente', () => {
  const rows = buildCategoryUsage(
    [category(1, 'Alimentação')],
    [
      transaction(1, 5, { data_transacao: '2020-01-01' }),
      transaction(2, 100, { data_transacao: '2026-10-24' }),
      transaction(3, 100, { id_categoria: 999 }),
      transaction(4, 100, { tipo: 'receita' }),
    ],
    { start: '', end: '' },
    today,
  );
  assert.equal(rows[0].amount, 5);
  assert.equal(rows[0].count, 1);
  assert.equal(rows[0].historyCount, 3);
});

test('atalho de categoria preserva tipo, confirmação e período para a página de transações', () => {
  const href = categoryTransactionsLink(category(12, 'Moradia'), period);
  const filters = readTransactionFilters(
    new URL(href, 'http://localhost').searchParams,
  );
  assert.equal(filters.category, '12');
  assert.equal(filters.tipo, 'despesa');
  assert.equal(filters.status, 'confirmada');
  assert.equal(filters.start, period.start);
  assert.equal(filters.end, period.end);
});
