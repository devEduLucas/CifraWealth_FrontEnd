import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_TRANSACTION_FILTERS,
  selectTransactions,
  summarizeTransactions,
  transactionStatus,
  transactionDateRange,
  validateTransactionDates,
  transactionFilterCount,
  readTransactionFilters,
  writeTransactionFilters,
} from '../src/utils/transactions.ts';

const today = '2026-01-01';
const categories = [
  { id_categoria: 1, nome: 'Alimentação', tipo: 'despesa' },
  { id_categoria: 2, nome: 'Salário', tipo: 'receita' },
];
const item = (id, patch = {}) => ({
  id_transacao: id,
  id_categoria: 1,
  descricao: 'Café da manhã',
  valor: 0.1,
  tipo: 'despesa',
  status: 'confirmada',
  data_transacao: today,
  ...patch,
});

test('filtros da URL validam valores, persistem alterações e não confundem criação com filtro de tipo', () => {
  const params = new URLSearchParams(
    'categoria=2&tipo=receita&situacao=confirmada&inicio=2026-01-01&fim=2026-01-31',
  );
  const filters = readTransactionFilters(params);
  assert.equal(filters.category, '2');
  assert.equal(filters.tipo, 'receita');
  const removed = writeTransactionFilters(params, { ...filters, category: '' });
  assert.equal(removed.has('categoria'), false);
  assert.equal(readTransactionFilters(removed).status, 'confirmada');
  assert.equal(
    writeTransactionFilters(removed, EMPTY_TRANSACTION_FILTERS).toString(),
    '',
  );
  const creation = new URLSearchParams('new=1&tipo=receita');
  assert.equal(readTransactionFilters(creation).tipo, '');
  assert.equal(
    writeTransactionFilters(creation, EMPTY_TRANSACTION_FILTERS).get('tipo'),
    'receita',
  );
  const invalid = readTransactionFilters(
    new URLSearchParams(
      'categoria=-2&tipo=x&situacao=x&inicio=2026-02-30&fim=2026-01-01&ordem=x',
    ),
  );
  assert.deepEqual(invalid, EMPTY_TRANSACTION_FILTERS);
});

test('busca ignora acentos, combina filtros e ordena sem modificar o histórico', () => {
  const rows = [
    item(1),
    item(2, { data_transacao: '2025-12-31', status: 'pendente' }),
    item(3, {
      tipo: 'receita',
      id_categoria: 2,
      descricao: 'Pagamento',
      valor: 100,
    }),
  ];
  const filters = {
    ...EMPTY_TRANSACTION_FILTERS,
    search: '  CAFE ',
    tipo: 'despesa',
    status: 'pendente',
    category: '1',
    start: '2025-12-31',
    end: today,
  };
  assert.deepEqual(
    selectTransactions(rows, categories, filters, today).map(
      (row) => row.id_transacao,
    ),
    [2],
  );
  assert.deepEqual(
    selectTransactions(
      rows,
      categories,
      { ...EMPTY_TRANSACTION_FILTERS, search: 'alimentacao' },
      today,
    ).map((row) => row.id_transacao),
    [1, 2],
  );
  assert.deepEqual(
    selectTransactions(
      rows,
      categories,
      { ...EMPTY_TRANSACTION_FILTERS, order: 'oldest' },
      today,
    ).map((row) => row.id_transacao),
    [2, 1, 3],
  );
  assert.deepEqual(
    rows.map((row) => row.id_transacao),
    [1, 2, 3],
  );
});

test('data futura aparece como prevista e nunca é somada como confirmada', () => {
  const scheduled = item(1, {
    data_transacao: '2026-01-02',
    status: 'confirmada',
    valor: 500,
  });
  assert.equal(transactionStatus(scheduled, today), 'prevista');
  assert.equal(
    transactionStatus(item(2, { status: 'pendente' }), today),
    'pendente',
  );
  assert.deepEqual(summarizeTransactions([scheduled], today), {
    income: 0,
    expense: 0,
    result: 0,
    pending: 0,
    scheduled: 1,
  });
});

test('resumo soma centavos de todos os resultados e separa pendências das confirmações', () => {
  const rows = [
    item(1),
    item(2, { valor: 0.2 }),
    item(3, { tipo: 'receita', valor: 0.3 }),
    item(4, { valor: 100, status: 'pendente' }),
  ];
  assert.deepEqual(summarizeTransactions(rows, today), {
    income: 0.3,
    expense: 0.3,
    result: 0,
    pending: 1,
    scheduled: 0,
  });
  assert.equal(
    summarizeTransactions(
      Array.from({ length: 25 }, (_, id) => item(id, { valor: 1 })),
      today,
    ).expense,
    25,
  );
});

test('períodos rápidos incluem exatamente 30 dias e atravessam mês, ano e ano bissexto', () => {
  assert.deepEqual(transactionDateRange('30days', today), {
    start: '2025-12-03',
    end: today,
  });
  assert.deepEqual(transactionDateRange('30days', '2024-03-01'), {
    start: '2024-02-01',
    end: '2024-03-01',
  });
  assert.deepEqual(transactionDateRange('month', today), {
    start: today,
    end: today,
  });
  assert.deepEqual(transactionDateRange('year', '2026-10-23'), {
    start: today,
    end: '2026-10-23',
  });
  assert.deepEqual(transactionDateRange('all', today), { start: '', end: '' });
});

test('datas opcionais aceitam limites inclusivos e rejeitam intervalos invertidos ou datas inexistentes', () => {
  assert.equal(validateTransactionDates('', ''), null);
  assert.equal(validateTransactionDates(today, ''), null);
  assert.equal(validateTransactionDates('', today), null);
  assert.equal(validateTransactionDates(today, today), null);
  assert.match(validateTransactionDates('2026-02-30', ''), /válidas/);
  assert.match(validateTransactionDates(today, '2025-12-31'), /inicial/);
  assert.equal(
    selectTransactions(
      [item(1)],
      categories,
      { ...EMPTY_TRANSACTION_FILTERS, start: today, end: today },
      today,
    ).length,
    1,
  );
});

test('contador agrupa as duas datas e mantém a busca independente do modal', () => {
  assert.equal(
    transactionFilterCount({ ...EMPTY_TRANSACTION_FILTERS, search: 'cafe' }),
    0,
  );
  assert.equal(
    transactionFilterCount({
      ...EMPTY_TRANSACTION_FILTERS,
      start: today,
      end: today,
      tipo: 'despesa',
    }),
    2,
  );
  assert.equal(
    transactionFilterCount({ ...EMPTY_TRANSACTION_FILTERS, order: 'oldest' }),
    1,
  );
});
