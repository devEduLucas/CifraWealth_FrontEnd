import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAppConfig } from '../src/utils/appConfig.ts';

test('API ausente nunca ativa a demonstração implicitamente', () => {
  assert.deepEqual(resolveAppConfig({ DEV: true }), { isDemoMode: false, apiUrl: 'http://localhost:3000/api' });
  assert.deepEqual(resolveAppConfig({}), { isDemoMode: false, apiUrl: '/api' });
  assert.equal(resolveAppConfig({ VITE_DEMO_MODE: 'false' }).isDemoMode, false);
});

test('demonstração exige true explícito e URL configurada é normalizada', () => {
  assert.equal(resolveAppConfig({ VITE_DEMO_MODE: 'true' }).isDemoMode, true);
  assert.equal(resolveAppConfig({ VITE_API_URL: ' http://localhost:3000/api/ ' }).apiUrl, 'http://localhost:3000/api');
});
