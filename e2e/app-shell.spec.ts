import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { prisma } from '../../CifraWealth_BackEnd/src/lib/prisma';
import { hashPassword } from '../../CifraWealth_BackEnd/src/utils/hashPassword';
import { DEFAULT_CATEGORIES } from '../../CifraWealth_BackEnd/src/utils/defaultCategories';

const API = process.env.E2E_API_URL!;
let userId: number;
let auth: { token: string; user: unknown };

test.beforeAll(async ({ request }) => {
  expect(['localhost', '127.0.0.1', '[::1]']).toContain(new URL(process.env.DATABASE_URL!).hostname);
  const email = 'header-' + randomUUID() + '@example.com';
  const password = 'HeaderBrowser!123';
  const user = await prisma.usuarios.create({ data: {
    nome: 'Teste', sobrenome: 'Cabeçalho', email, senha: await hashPassword(password),
    email_verificado: true, categorias: { create: DEFAULT_CATEGORIES },
  } });
  userId = user.id_usuario;
  const response = await request.post(API + '/auth/login', { data: { email, password } });
  expect(response.status()).toBe(200);
  auth = await response.json();
});

test.afterAll(async () => {
  if (userId) {
    await prisma.transacoes.deleteMany({ where: { id_usuario: userId } });
    await prisma.metas_financeiras.deleteMany({ where: { id_usuario: userId } });
    await prisma.categorias.deleteMany({ where: { id_usuario: userId } });
    await prisma.usuarios.deleteMany({ where: { id_usuario: userId } });
  }
  await prisma.$disconnect();
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript((saved) => {
    localStorage.setItem('cifrawealth:token', saved.token);
    localStorage.setItem('cifrawealth:user', JSON.stringify(saved.user));
  }, auth);
});

test('header é compartilhado, saudação fica só no dashboard e conteúdo rola abaixo dele', async ({ page }, testInfo) => {
  await page.goto('/dashboard');
  const header = page.getByRole('banner', { name: 'Cabeçalho principal' });
  await expect(header).toContainText('Teste Cabeçalho');
  await expect(page.getByText('Bem-vindo de volta.', { exact: true })).toBeVisible();
  const nav = page.getByRole('navigation', { name: testInfo.project.name === 'mobile' ? 'Menu móvel' : 'Menu principal' });
  for (const title of ['Transações', 'Categorias', 'Metas', 'Relatórios', 'Perfil']) {
    await nav.getByRole('link', { name: title, exact: true }).click();
    await expect(page.getByRole('heading', { name: title === 'Metas' ? 'Metas Financeiras' : title, exact: true, level: 1 })).toBeVisible();
    await expect(header).toContainText(title);
    await expect(page.getByText('Bem-vindo de volta.', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await nav.getByRole('link', { name: 'Relatórios', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Relatórios', exact: true, level: 1 })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const bounds = await header.boundingBox();
  expect(bounds!.y).toBe(0);
  expect(bounds!.height).toBe(80);
  await header.getByRole('link', { name: 'Abrir meu perfil' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await nav.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByText('Bem-vindo de volta.', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('dashboard-escuro.png'), fullPage: true });
});

test('tema claro cobre formulários e persiste em navegação, recarga e outra aba', async ({ page, context }, testInfo) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('cifrawealth:theme'))).toBe('light');
  await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.95)');
  await page.screenshot({ path: testInfo.outputPath('dashboard-claro.png'), fullPage: true });
  await page.goto('/categories');
  await page.getByRole('button', { name: 'Nova Categoria', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Nova Categoria', exact: true });
  await expect(dialog.getByLabel('Nome da categoria')).toBeFocused();
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.screenshot({ path: testInfo.outputPath('modal-claro.png') });
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Ativar modo escuro' })).toBeVisible();
  const otherTab = await context.newPage();
  await otherTab.goto('/profile');
  await expect(otherTab.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click();
  await expect(otherTab.locator('html')).toHaveAttribute('data-theme', 'dark');
  await otherTab.close();
});

test('notificações mostram dados reais, abrem a meta e permitem recuperar falhas', async ({ page, request }, testInfo) => {
  await page.goto('/dashboard');
  const bell = page.getByRole('button', { name: 'Notificações', exact: true });
  await bell.click();
  const panel = page.getByRole('region', { name: 'Notificações', exact: true });
  await expect(panel.getByText('Tudo em dia', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(bell).toBeFocused();
  await expect(panel).not.toBeVisible();
  const headers = { Authorization: 'Bearer ' + auth.token };
  const goal = await request.post(API + '/goals', { headers, data: { titulo: 'Reserva com prazo', valor_objetivo: 1000, data_inicio: '2020-01-01', data_fim: '2020-02-01' } });
  expect(goal.status()).toBe(201);
  const categories = await request.get(API + '/categories', { headers });
  const category = (await categories.json()).find((item: { tipo: string }) => item.tipo === 'despesa');
  const transaction = await request.post(API + '/transactions', { headers, data: { id_categoria: category.id_categoria, tipo: 'despesa', descricao: 'Conta a conferir', valor: 50, data_transacao: '2026-10-14', status: 'pendente' } });
  expect(transaction.status()).toBe(201);
  await bell.click();
  await expect(panel.getByText('Reserva com prazo', { exact: true })).toBeVisible();
  await expect(panel.getByText('1 transação pendente', { exact: true })).toBeVisible();
  const headerBounds = await page.getByRole('banner').boundingBox();
  const panelBounds = await panel.boundingBox();
  expect(panelBounds!.y).toBeGreaterThanOrEqual(headerBounds!.y + headerBounds!.height);
  expect(panelBounds!.x).toBeGreaterThanOrEqual(0);
  expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: testInfo.outputPath('notificacoes.png') });
  await panel.getByRole('link', { name: /Reserva com prazo/ }).click();
  await expect(page.getByRole('dialog', { name: 'Registrar valor guardado', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.route('**/api/goals', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Falha temporária nos lembretes' }) }));
  await bell.click();
  await expect(panel.getByRole('alert')).toContainText('Falha temporária');
  await page.unroute('**/api/goals');
  await panel.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(panel.getByText('Reserva com prazo', { exact: true })).toBeVisible();
  await page.mouse.click(headerBounds!.x + 8, headerBounds!.y + headerBounds!.height + 16);
  await expect(panel).not.toBeVisible();
});
