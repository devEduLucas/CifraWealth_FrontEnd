import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../CifraWealth_BackEnd/src/lib/prisma';
import {
  signToken,
  sessionVersion,
} from '../../CifraWealth_BackEnd/src/utils/jwt';

let userId: number;
let expenseId: number;
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
function shifted(days: number) {
  const date = new Date(today + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

test.beforeEach(async ({ page }) => {
  expect(['localhost', '127.0.0.1', '[::1]']).toContain(
    new URL(process.env.DATABASE_URL!).hostname,
  );
  const user = await prisma.usuarios.create({
    data: {
      nome: 'Teste',
      sobrenome: 'Transações',
      email: `transactions-${randomUUID()}@example.test`,
      email_verificado: true,
      categorias: {
        create: [
          { nome: 'Trabalho', tipo: 'receita' },
          { nome: 'Alimentação', tipo: 'despesa' },
        ],
      },
    },
    include: { categorias: true },
  });
  userId = user.id_usuario;
  const incomeId = user.categorias.find(
    (category) => category.tipo === 'receita',
  )!.id_categoria;
  expenseId = user.categorias.find(
    (category) => category.tipo === 'despesa',
  )!.id_categoria;
  await prisma.transacoes.createMany({
    data: [
      {
        descricao: 'Salário do projeto',
        valor: 3000,
        tipo: 'receita',
        status: 'confirmada',
        data_transacao: new Date(today + 'T12:00:00Z'),
        id_usuario: userId,
        id_categoria: incomeId,
      },
      {
        descricao: 'Café no coworking',
        valor: 45.5,
        tipo: 'despesa',
        status: 'confirmada',
        data_transacao: new Date(today + 'T12:00:00Z'),
        id_usuario: userId,
        id_categoria: expenseId,
      },
      {
        descricao: 'Conta de energia',
        valor: 120,
        tipo: 'despesa',
        status: 'pendente',
        data_transacao: new Date(shifted(-1) + 'T12:00:00Z'),
        id_usuario: userId,
        id_categoria: expenseId,
      },
      {
        descricao: 'Receita agendada',
        valor: 900,
        tipo: 'receita',
        status: 'pendente',
        data_transacao: new Date(shifted(1) + 'T12:00:00Z'),
        id_usuario: userId,
        id_categoria: incomeId,
      },
      {
        descricao: 'Projeto anterior',
        valor: 750,
        tipo: 'receita',
        status: 'confirmada',
        data_transacao: new Date(shifted(-35) + 'T12:00:00Z'),
        id_usuario: userId,
        id_categoria: incomeId,
      },
    ],
  });
  const auth = {
    token: signToken({ userId, credentialVersion: sessionVersion(user) }),
    user: {
      id_usuario: userId,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
    },
  };
  await page.addInitScript((saved) => {
    if (!sessionStorage.getItem('transactions-fixture')) {
      localStorage.setItem('cifrawealth:token', saved.token);
      localStorage.setItem('cifrawealth:user', JSON.stringify(saved.user));
      sessionStorage.setItem('transactions-fixture', 'true');
    }
  }, auth);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://vlibras.gov.br/**', (route) => route.abort());
});
test.afterEach(async () => {
  if (userId) {
    await prisma.transacoes.deleteMany({ where: { id_usuario: userId } });
    await prisma.categorias.deleteMany({ where: { id_usuario: userId } });
    await prisma.usuarios.deleteMany({ where: { id_usuario: userId } });
  }
});
test.afterAll(async () => {
  await prisma.$disconnect();
});

test('lista por dia aproxima nome e valor, distingue receitas/despesas e não soma pendências ou previsões', async ({
  page,
}, testInfo) => {
  await page.goto('/transactions');
  const rows = page.locator('.transaction-entry');
  await expect(rows).toHaveCount(5);
  const summary = page.getByRole('region', { name: 'Resumo das transações' });
  await expect(summary).toContainText('3.750,00');
  await expect(summary).toContainText('45,50');
  await expect(summary).toContainText('3.704,50');
  await expect(summary).toContainText('1 pendentes e 1 previstas');
  const income = rows.filter({ hasText: 'Salário do projeto' });
  const expense = rows.filter({ hasText: 'Café no coworking' });
  expect(
    await income.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).not.toBe(
    await expense.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  await page.evaluate(() => document.fonts.ready);
  const spacing = await income.evaluate((entry) => {
    const paragraphs = Array.from(entry.querySelectorAll('p'));
    const description = paragraphs.find((node) => node.textContent === 'Salário do projeto')!.getBoundingClientRect();
    const value = paragraphs.find((node) => /3\.000,00/.test(node.textContent ?? ''))!.getBoundingClientRect();
    return { horizontal: Math.abs(value.x - description.x), vertical: value.top - description.bottom };
  });
  expect(spacing.horizontal).toBeLessThan(2);
  expect(spacing.vertical).toBeGreaterThanOrEqual(0);
  expect(spacing.vertical).toBeLessThan(8);
  await expect(
    rows
      .filter({ hasText: 'Receita agendada' })
      .getByRole('button', { name: 'Confirmar', exact: true }),
  ).toHaveCount(0);
  await expect(
    rows
      .filter({ hasText: 'Conta de energia' })
      .getByRole('button', { name: 'Confirmar', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /^Hoje ·/, level: 3 }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('transacoes-escuro.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await page.screenshot({
    path: testInfo.outputPath('transacoes-claro.png'),
    fullPage: true,
  });
});

test('filtros só aplicam ao confirmar, validam datas, mantêm foco e permitem remover cada critério', async ({
  page,
}) => {
  await page.goto('/transactions');
  const opener = page.getByRole('button', {
    name: 'Filtrar transações',
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole('dialog', {
    name: 'Filtrar transações',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Fechar', exact: true }),
  ).toBeFocused();
  await dialog.getByLabel('Filtrar tipo').selectOption('despesa');
  await dialog.getByLabel('Filtrar situação').selectOption('pendente');
  await expect(dialog.getByRole('status')).toContainText(
    '1 transação corresponde',
  );
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(opener).toBeFocused();
  await expect(page.locator('.transaction-entry')).toHaveCount(5);
  await opener.click();
  await expect(dialog.getByLabel('Filtrar tipo')).toHaveValue('');
  await dialog.getByLabel('Filtrar tipo').selectOption('despesa');
  await dialog.getByLabel('Filtrar situação').selectOption('pendente');
  await dialog.getByLabel('Data inicial', { exact: true }).fill(today);
  await dialog.getByLabel('Data final', { exact: true }).fill(shifted(-1));
  await dialog
    .getByRole('button', { name: 'Aplicar filtros', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText('inicial');
  await dialog.getByLabel('Data inicial', { exact: true }).fill(shifted(-1));
  await dialog.getByLabel('Data final', { exact: true }).fill(today);
  await dialog
    .getByRole('button', { name: 'Aplicar filtros', exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await expect(page.locator('.transaction-entry')).toContainText(
    'Conta de energia',
  );
  await page
    .getByRole('button', { name: 'Remover filtro Pendentes', exact: true })
    .click();
  await expect(page.locator('.transaction-entry')).toHaveCount(2);
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await expect(page.locator('.transaction-entry')).toHaveCount(5);
  await page.getByLabel('Buscar transações').fill('cafe');
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await expect(page.locator('.transaction-entry')).toContainText(
    'Café no coworking',
  );
  await page.getByRole('button', { name: 'Limpar busca', exact: true }).click();
  await opener.click();
  await dialog.getByLabel('Ordenar transações').selectOption('oldest');
  await dialog
    .getByRole('button', { name: 'Aplicar filtros', exact: true })
    .click();
  await expect(page.locator('.transaction-entry').first()).toContainText(
    'Projeto anterior',
  );
  await opener.click();
  await dialog
    .getByRole('button', { name: 'Aplicar filtros', exact: true })
    .focus();
  await page.keyboard.press('Tab');
  await expect(
    dialog.getByRole('button', { name: 'Fechar', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('paginação preserva resumo total, filtro reinicia a página e privacidade oculta lista e resumo', async ({
  page,
}) => {
  await prisma.transacoes.createMany({
    data: Array.from({ length: 24 }, (_, id) => ({
      id_usuario: userId,
      id_categoria: expenseId,
      descricao: `Despesa adicional ${id + 1}`,
      valor: 1,
      tipo: 'despesa' as const,
      status: 'confirmada' as const,
      data_transacao: new Date(shifted(-1) + 'T12:00:00Z'),
    })),
  });
  await page.goto('/transactions');
  const summary = page.getByRole('region', { name: 'Resumo das transações' });
  await expect(page.locator('.transaction-entry')).toHaveCount(20);
  await expect(summary).toContainText('69,50');
  const pagination = page.getByRole('navigation', {
    name: 'Paginação das transações',
  });
  await pagination
    .getByRole('button', { name: 'Próxima', exact: true })
    .click();
  await expect(page.locator('.transaction-entry')).toHaveCount(9);
  await expect(summary).toContainText('69,50');
  await expect(pagination).toContainText('Página 2 de 2');
  await page
    .getByRole('button', { name: 'Filtrar transações', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Filtrar transações',
    exact: true,
  });
  await dialog.getByLabel('Filtrar tipo').selectOption('despesa');
  await dialog
    .getByRole('button', { name: 'Aplicar filtros', exact: true })
    .click();
  await expect(pagination).toContainText('Página 1 de 2');
  await page
    .getByRole('button', { name: 'Ocultar valores', exact: true })
    .click();
  await expect(page.getByRole('main')).not.toContainText(/\d+[.,]\d{2}\b/);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Mostrar valores', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText(/\d+[.,]\d{2}\b/);
});

test('erro de carregamento permite tentar novamente e filtros cabem em 320px com fonte maior', async ({
  page,
}) => {
  await page.route('**/api/transactions', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Histórico temporariamente indisponível.',
      }),
    }),
  );
  await page.goto('/transactions');
  await expect(page.getByRole('alert')).toContainText(
    'Histórico temporariamente indisponível.',
  );
  await expect(
    page.getByText('Seu histórico começa no primeiro registro', {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.unroute('**/api/transactions');
  await page
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .click();
  await expect(page.locator('.transaction-entry')).toHaveCount(5);
  await page.setViewportSize({ width: 320, height: 568 });
  await page
    .getByRole('button', { name: 'Acessibilidade', exact: true })
    .click();
  await page.getByRole('button', { name: 'Maior', exact: true }).click();
  await page.getByRole('button', { name: /^Alto contraste/ }).click();
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole('button', { name: 'Filtrar transações', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Filtrar transações',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Fechar', exact: true }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press('Escape');
});
