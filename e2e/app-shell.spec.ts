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
  await expect(page.getByText('Confira seus lançamentos e acompanhe suas metas.', { exact: true })).toBeVisible();
  const nav = page.getByRole('navigation', { name: testInfo.project.name === 'mobile' ? 'Menu móvel' : 'Menu principal' });
  for (const title of ['Transações', 'Categorias', 'Metas', 'Relatórios', 'Perfil']) {
    if (title === 'Perfil' && testInfo.project.name === 'mobile') await header.getByRole('link', { name: 'Abrir meu perfil' }).click();
    else await nav.getByRole('link', { name: title, exact: true }).click();
    await expect(page.getByRole('heading', { name: title === 'Metas' ? 'Metas Financeiras' : title, exact: true, level: 1 })).toBeVisible();
    await expect(header).toContainText(title);
    await expect(page.getByText('Confira seus lançamentos e acompanhe suas metas.', { exact: true })).toHaveCount(0);
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
  await expect(page.getByText('Confira seus lançamentos e acompanhe suas metas.', { exact: true })).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('dashboard-escuro.png'), fullPage: true });
  await nav.getByRole('link', { name: 'Relatórios', exact: true }).click();
  await page.getByLabel('Selecionar período do relatório').selectOption('custom');
  await page.getByLabel('Data inicial', { exact: true }).fill('2026-01-15');
  const popup = page.context().waitForEvent('page');
  await page.getByRole('link', { name: 'Sobre a CifraWealth e Ajuda (abre em nova aba)' }).click();
  const landing = await popup;
  await expect(landing).toHaveURL(/\/home$/);
  await expect(landing.getByRole('heading', { name: /Mais clareza para cuidar/, level: 1 })).toBeVisible();
  expect(await landing.evaluate(() => window.opener === null)).toBe(true);
  await expect(landing.getByRole('button', { name: /^Voltar/ })).toHaveCount(0);
  const landingHeader = landing.getByRole('banner');
  if (testInfo.project.name === 'mobile') await landingHeader.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await landingHeader.getByRole('link', { name: 'Ir para o Painel', exact: true }).click();
  await expect(landing).toHaveURL(/\/dashboard$/);
  await landing.close();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByLabel('Selecionar período do relatório')).toHaveValue('custom');
  await expect(page.getByLabel('Data inicial', { exact: true })).toHaveValue('2026-01-15');
});

test('tema claro cobre formulários e persiste em navegação, recarga e outra aba', async ({ page, context }, testInfo) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('cifrawealth:theme'))).toBe('light');
  await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.95)');
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('dashboard-claro.png'), fullPage: true });
  await page.goto('/categories');
  await page.getByRole('button', { name: 'Nova Categoria', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Nova Categoria', exact: true });
  await expect(dialog.getByLabel('Nome da categoria')).toBeFocused();
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('modal-claro.png') });
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
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('notificacoes.png') });
  await panel.getByRole('link', { name: /Reserva com prazo/ }).click();
  await expect(page.getByRole('dialog', { name: 'Adicionar valor guardado', exact: true })).toBeVisible();
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

test('menu conserva ícones recolhidos, preferência e acesso ao perfil', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (testInfo.project.name === 'desktop') await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto('/dashboard');
  const sidebar = page.getByRole('complementary', { name: 'Menu lateral' });
  const header = page.getByRole('banner', { name: 'Cabeçalho principal' });
  if (testInfo.project.name === 'mobile') {
    await expect(sidebar).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Recolher menu lateral' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Abrir meu perfil', exact: true }).click();
  } else {
    await expect(header.getByRole('button', { name: 'Recolher menu lateral' })).toHaveCount(0);
    await expect(sidebar.getByRole('link', { name: 'CifraWealth — Dashboard' })).toBeVisible();
    expect((await sidebar.boundingBox())!.width).toBe(260);
    expect((await header.boundingBox())!.x).toBe(260);
    expect((await page.getByRole('main').boundingBox())!.x).toBe(260);
    await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('menu-expandido-1920.png') });
    await sidebar.getByRole('button', { name: 'Recolher menu lateral' }).click();
    await expect(sidebar.getByRole('button', { name: 'Expandir menu lateral' })).toHaveAttribute('aria-expanded', 'false');
    expect((await sidebar.boundingBox())!.width).toBe(80);
    expect((await header.boundingBox())!.x).toBe(80);
    await sidebar.getByRole('link', { name: 'Transações', exact: true }).click();
    await expect(page).toHaveURL(/\/transactions$/);
    await page.reload();
    expect((await sidebar.boundingBox())!.width).toBe(80);
    await sidebar.getByRole('link', { name: 'Abrir perfil de Teste Cabeçalho' }).click();
    await expect(sidebar.getByRole('link', { name: 'CifraWealth — Dashboard' })).toHaveCount(0);
    await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('menu-recolhido-1920.png') });
    await sidebar.getByRole('button', { name: 'Expandir menu lateral' }).click();
    await expect(sidebar.getByRole('link', { name: 'CifraWealth — Dashboard' })).toBeVisible();
    expect((await sidebar.boundingBox())!.width).toBe(260);
  }
  await expect(page).toHaveURL(/\/profile$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('tema segue dispositivo até escolha manual e permite voltar ao automático', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/profile');
  const root = page.locator('html');
  const preference = page.getByLabel('Preferência de tema');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveAttribute('data-theme-preference', 'system');
  await expect(preference).toHaveValue('system');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await preference.selectOption('light');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(preference).toHaveValue('light');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await preference.selectOption('system');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('cifrawealth:theme'))).toBeNull();
});

test('atalhos do dashboard abrem criação com o tipo correto e preservam o formulário ao criar categoria', async ({ page }) => {
  for (const [label, tipo] of [['Adicionar Receita', 'receita'], ['Adicionar Despesa', 'despesa']]) {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: label, exact: true }).click();
    const transaction = page.getByRole('dialog', { name: 'Nova Transação', exact: true });
    await expect(transaction).toBeVisible();
    await expect(transaction.getByLabel('Tipo', { exact: true })).toHaveValue(tipo);
    await transaction.getByLabel('Descrição', { exact: true }).fill('Rascunho preservado');
    await transaction.getByRole('button', { name: '+ Nova categoria', exact: true }).click();
    const category = page.getByRole('dialog', { name: 'Nova Categoria', exact: true });
    await expect(category.getByLabel('Tipo', { exact: true })).toHaveValue(tipo);
    await page.keyboard.press('Escape');
    await expect(category).not.toBeVisible();
    await expect(transaction.getByLabel('Descrição', { exact: true })).toHaveValue('Rascunho preservado');
    await page.keyboard.press('Escape');
  }
  await page.goto('/dashboard');
  await page.getByRole('link', { name: '+ Nova meta', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Nova Meta', exact: true })).toBeVisible();
});
