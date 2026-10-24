import { defineConfig } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
const backend = path.resolve(process.cwd(), '../CifraWealth_BackEnd');
createRequire(path.join(backend, 'package.json'))('dotenv').config({ path: path.join(backend, '.env'), quiet: true });
const apiOrigin = 'http://127.0.0.1:3101';
const frontendOrigin = 'http://127.0.0.1:5174';
process.env.E2E_API_URL = apiOrigin + '/api';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: frontendOrigin, channel: 'chrome', headless: true, colorScheme: 'dark', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', testMatch: ['**/sprint5.spec.ts', '**/app-shell.spec.ts', '**/public-pages.spec.ts', '**/audit-fixes.spec.ts', '**/report-export.spec.ts', '**/profile-accessibility.spec.ts'], use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', testMatch: ['**/sprint5.spec.ts', '**/app-shell.spec.ts', '**/public-pages.spec.ts', '**/audit-fixes.spec.ts', '**/report-export.spec.ts', '**/profile-accessibility.spec.ts'], use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'demo', testMatch: '**/demo.spec.ts', use: { baseURL: 'http://127.0.0.1:5175' } },
  ],
  webServer: [
    { command: 'node --import tsx src/server.ts', cwd: backend, port: 3101, reuseExistingServer: false, env: { NODE_ENV: 'test', PORT: '3101', CORS_ORIGIN: frontendOrigin } },
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort', port: 5174, reuseExistingServer: false, env: { VITE_API_URL: apiOrigin + '/api', VITE_DEMO_MODE: 'false', VITE_GOOGLE_CLIENT_ID: '' } },
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175 --strictPort', port: 5175, reuseExistingServer: false, env: { VITE_API_URL: apiOrigin + '/api', VITE_DEMO_MODE: 'true', VITE_GOOGLE_CLIENT_ID: '' } },
  ],
});
