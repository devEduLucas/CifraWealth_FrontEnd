import { test } from 'node:test';
import assert from 'node:assert/strict';
import { session } from '../src/lib/session.ts';

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
globalThis.window = new EventTarget();
const user = {
  id_usuario: 1,
  nome: 'Nome',
  sobrenome: 'Inicial',
  email: 'session@example.test',
};

test('snapshot do usuário é estável e alterações notificam a interface sem trocar o token', () => {
  session.clear();
  let notifications = 0;
  const unsubscribe = session.subscribe(() => notifications++);
  session.save('fixture-token', user);
  const snapshot = session.getUser();
  assert.equal(session.getUser(), snapshot);
  session.updateUser({
    ...user,
    nome: 'Atualizado',
    foto_perfil: 'fixture-photo',
  });
  assert.equal(session.getToken(), 'fixture-token');
  assert.equal(session.getUser().nome, 'Atualizado');
  assert.notEqual(session.getUser(), snapshot);
  assert.equal(notifications, 2);
  unsubscribe();
  session.clear();
  assert.equal(notifications, 2);
});

test('encerrar a sessão elimina dados e preserva apenas o aviso até o próximo acesso', () => {
  session.save('fixture-token', user);
  session.clear('Conta excluída.');
  assert.equal(session.getToken(), null);
  assert.equal(session.getUser(), null);
  assert.equal(session.isAuthenticated(), false);
  assert.equal(session.getEndNotice(), 'Conta excluída.');
  assert.equal(localStorage.getItem('cifrawealth:user'), null);
  session.save('new-fixture', user);
  assert.equal(session.getEndNotice(), undefined);
});

test('armazenamento inválido não quebra a leitura e mudanças em outra aba notificam assinantes', () => {
  localStorage.setItem('cifrawealth:user', '{invalid');
  assert.equal(session.getUser(), null);
  localStorage.setItem(
    'cifrawealth:user',
    JSON.stringify({ nome: 10, email: false }),
  );
  assert.equal(session.getUser(), null);
  let notifications = 0;
  const unsubscribe = session.subscribe(() => notifications++);
  const event = new Event('storage');
  Object.defineProperty(event, 'key', { value: 'cifrawealth:user' });
  window.dispatchEvent(event);
  assert.equal(notifications, 1);
  unsubscribe();
  session.clear();
});
