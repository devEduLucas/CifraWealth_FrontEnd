import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGoalProgress } from '../src/utils/goalProgress.ts';

test('cada real de uma meta de cem reais representa exatamente um ponto percentual', () => {
  for (let saved = 0; saved <= 100; saved++) {
    assert.equal(getGoalProgress({ valorAtual: saved, valorObjetivo: 100 }), saved, `R$ ${saved} de R$ 100`);
  }
});

test('metas em centavos preservam 29%, 57%, 58% e somas monetárias', () => {
  for (const [saved, expected] of [[0.29, 29], [0.57, 57], [0.58, 58], [0.1 + 0.2, 30]]) {
    assert.equal(getGoalProgress({ valorAtual: saved, valorObjetivo: 1 }), expected);
  }
});

test('progresso mantém apenas pontos completos sem antecipar a conclusão', () => {
  for (const [saved, target, expected] of [[29.99, 100, 29], [99.99, 100, 99], [1, 3, 33], [2, 3, 66], [0.01, 99999999.99, 0], [99999999.98, 99999999.99, 99]]) {
    assert.equal(getGoalProgress({ valorAtual: saved, valorObjetivo: target }), expected);
  }
});

test('limites e valores inválidos não geram porcentagem negativa ou não finita', () => {
  for (const [saved, target, expected] of [[100, 100, 100], [150, 100, 100], [0, 100, 0], [-1, 100, 0], [1, 0, 0], [1, -1, 0], [NaN, 100, 0], [100, Infinity, 0], [Infinity, 100, 0]]) {
    assert.equal(getGoalProgress({ valorAtual: saved, valorObjetivo: target }), expected);
  }
});
