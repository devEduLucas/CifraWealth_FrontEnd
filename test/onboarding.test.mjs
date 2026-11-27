import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, getTourSteps, onboardingKey, readOnboardingStatus, writeOnboardingStatus } from '../src/utils/onboarding.ts';
import { HELP_SECTIONS, getHelpSection, searchHelp } from '../src/utils/helpContent.ts';

test('tour completo cobre as seis áreas e a ajuda sem abrir formulários ou ações', () => {
  assert.equal(TOUR_STEPS.length, 8);
  assert.equal(new Set(TOUR_STEPS.map((step) => step.id)).size, 8);
  assert.deepEqual([...new Set(TOUR_STEPS.map((step) => step.section))], ['dashboard', 'transactions', 'categories', 'goals', 'reports', 'profile', 'help']);
  for (const step of TOUR_STEPS) {
    assert.match(step.to, /^\/(dashboard|transactions|categories|goals|reports|profile|help)(?:\?|$)/);
    assert.doesNotMatch(step.to, /[?&](new|guardar)=/);
    assert.ok(step.title && step.description && step.detail && step.target);
  }
  assert.equal(getTourSteps('dashboard').length, 2);
  assert.deepEqual(getTourSteps('reports').map((step) => step.section), ['reports']);
  assert.equal(getTourSteps('unknown'), TOUR_STEPS);
});

test('convite e conclusão ficam separados por conta e toleram preferência inválida', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(readOnboardingStatus(1, storage), null);
  assert.equal(writeOnboardingStatus(1, 'dismissed', storage), true);
  assert.equal(readOnboardingStatus(1, storage), 'dismissed');
  assert.equal(readOnboardingStatus(2, storage), null);
  writeOnboardingStatus(2, 'completed', storage);
  assert.equal(readOnboardingStatus(2, storage), 'completed');
  for (const value of ['broken json', '{"status":"unknown"}', 'true', 'null']) {
    values.set(onboardingKey(1), value);
    assert.equal(readOnboardingStatus(1, storage), null);
  }
});

test('armazenamento bloqueado não interrompe o aplicativo', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(readOnboardingStatus(1, storage), null);
  assert.equal(writeOnboardingStatus(1, 'offered', storage), false);
  assert.throws(() => onboardingKey(0));
  assert.equal(readOnboardingStatus(-1, storage), null);
});

test('ajuda preserva assuntos antigos, busca por termos sem acentos e não interpreta HTML', () => {
  for (const id of ['dashboard', 'transactions', 'categories', 'goals', 'reports', 'profile']) assert.equal(getHelpSection(id).id, id);
  assert.equal(getHelpSection('/goals/123').id, 'goals');
  assert.equal(getHelpSection('unknown').id, 'dashboard');
  assert.ok(searchHelp('transacoes').some((match) => match.section.id === 'transactions'));
  assert.ok(searchHelp('senha incorreta').some((match) => match.questions.length));
  assert.ok(searchHelp('Esqueci minha senha!').some((match) => match.section.id === 'account'));
  assert.ok(searchHelp('Como gerar um PDF?').some((match) => match.section.id === 'reports'));
  assert.ok(searchHelp('e-mail').some((match) => match.section.id === 'account'));
  assert.deepEqual(searchHelp('inexistente-xyz-999'), []);
  assert.deepEqual(searchHelp('<script>alert(1)</script>'), []);
  assert.equal(new Set(HELP_SECTIONS.map((section) => section.id)).size, HELP_SECTIONS.length);
  for (const section of HELP_SECTIONS) {
    assert.ok(section.steps.length && section.questions.length && section.to.startsWith('/'));
    assert.equal(new Set(section.questions.map((question) => question.id)).size, section.questions.length);
  }
});
