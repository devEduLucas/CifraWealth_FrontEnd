import { defineConfig } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
const backend = path.resolve(process.cwd(), '../CifraWealth_BackEnd');
createRequire(path.join(backend, 'package.json'))('dotenv').config({ path: path.join(backend, '.env'), quiet: true });
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: 'http://localhost:5173', channel: 'chrome', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } }, { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }],
  webServer: [
    { command: 'node --import tsx src/server.ts', cwd: backend, port: 3000, reuseExistingServer: true, env: { NODE_ENV: 'test' } },
    { command: 'node node_modules/vite/bin/vite.js --host localhost --port 5173 --strictPort', port: 5173, reuseExistingServer: true },
  ],
});
