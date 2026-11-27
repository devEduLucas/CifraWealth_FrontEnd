import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preferredScrollBehavior } from '../src/utils/motion.ts';

test('reduzir movimentos no app ou dispositivo desativa a rolagem animada', () => {
  for (const [appReducedMotion, systemReducedMotion] of [[true, false], [false, true], [true, true]]) {
    assert.equal(preferredScrollBehavior({ appReducedMotion, systemReducedMotion }), 'instant');
  }
});

test('rolagem suave permanece disponível quando nenhuma preferência a reduz', () => {
  assert.equal(preferredScrollBehavior({ appReducedMotion: false, systemReducedMotion: false }), 'smooth');
});

test('consulta de preferências também funciona fora do navegador', () => {
  assert.equal(preferredScrollBehavior(), 'smooth');
});
