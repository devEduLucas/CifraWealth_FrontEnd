import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMoney, formatMoneyInput } from '../src/utils/format.ts';

test('valores brasileiros preservam milhares e centavos', () => {
  for (const [input, expected] of [['1.000',1000],['1.000,00',1000],['1.234,56',1234.56],['1234,56',1234.56],['0,01',0.01],['R$ 1.234,56',1234.56],['99.999.999,99',99999999.99]]) assert.equal(parseMoney(input),expected,input);
});
test('separador decimal com ponto e edição monetária preservam o valor', () => {
  for (const value of [0,0.01,1,1.23,1000,1234.56,99999999.99]) {
    assert.equal(parseMoney(String(value)),value);
    assert.equal(parseMoney(formatMoneyInput(value)),value);
  }
});
test('formatos ambíguos, decimais excedentes e valores fora do limite são rejeitados', () => {
  for (const input of ['', '1,', '1.00,00', '1,234', '1.234.56', '1e3', '-10', 'Infinity', '100.000.000,00', '12 34', 'abc']) assert.ok(Number.isNaN(parseMoney(input)),input);
});
