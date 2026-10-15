import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNotifications } from '../src/utils/notifications.ts';

const goal = (id, deadline, changes = {}) => ({
  id_meta: id, titulo: 'Meta ' + id, descricao: null,
  valor_objetivo: 1000, valor_atual: 100, status: 'em_andamento',
  data_inicio: null, data_fim: deadline, ...changes,
});

test('lembretes incluem vencidas, hoje e os próximos sete dias na virada do mês', () => {
  const items = buildNotifications([
    goal(3, '2026-11-05'), goal(2, '2026-10-29'), goal(1, '2026-10-28'),
    goal(4, '2026-11-06'), goal(5, null),
    goal(6, '2026-10-28', { status: 'concluida' }),
    goal(7, '2026-10-28', { status: 'cancelada' }),
    goal(8, '2026-10-28', { valor_atual: 1000 }),
  ], [], '2026-10-29');
  assert.deepEqual(items.map(({ id, tone }) => ({ id, tone })), [
    { id: 'goal-1', tone: 'danger' }, { id: 'goal-2', tone: 'warning' }, { id: 'goal-3', tone: 'warning' },
  ]);
  assert.match(items[0].description, /28\/10\/2026/);
  assert.match(items[1].description, /hoje/);
  assert.equal(items[2].to, '/goals?contribute=3');
});

test('transações pendentes são agrupadas e confirmadas não geram alerta', () => {
  assert.deepEqual(buildNotifications([], [{ status: 'confirmada' }], '2026-10-29'), []);
  const pending = buildNotifications([], [{ status: 'pendente' }, { status: 'confirmada' }, { status: 'pendente' }], '2026-10-29');
  assert.equal(pending.length, 1);
  assert.equal(pending[0].title, '2 transações pendentes');
  assert.equal(pending[0].to, '/transactions');
});
