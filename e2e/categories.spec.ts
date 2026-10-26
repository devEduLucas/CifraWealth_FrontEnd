import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../CifraWealth_BackEnd/src/lib/prisma';
import {
  signToken,
  sessionVersion,
} from '../../CifraWealth_BackEnd/src/utils/jwt';

const API = process.env.E2E_API_URL!;
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const oldDate = new Date(today.slice(0, 7) + '-01T12:00:00Z');
oldDate.setUTCDate(0);
const previous = oldDate.toISOString().slice(0, 10);
const futureDate = new Date(today + 'T12:00:00Z');
futureDate.setUTCDate(futureDate.getUTCDate() + 1);
const future = futureDate.toISOString().slice(0, 10);
let userId: number;
let token: string;
let ids: Record<string, number>;

test.beforeEach(async ({ page }) => {
  userId = 0;
  expect(['localhost', '127.0.0.1', '[::1]']).toContain(
    new URL(process.env.DATABASE_URL!).hostname,
  );
  const user = await prisma.usuarios.create({
    data: {
      nome: 'Teste',
      sobrenome: 'Categorias',
      email: `categories-${randomUUID()}@example.test`,
      email_verificado: true,
      categorias: {
        create: [
          { nome: 'Moradia', tipo: 'despesa', icone: 'home', cor: '#2563eb' },
          {
            nome: 'Alimentação',
            tipo: 'despesa',
            icone: 'utensils',
            cor: '#ea580c',
          },
          { nome: 'Transporte', tipo: 'despesa', icone: 'car', cor: '#16a34a' },
          { nome: 'Lazer', tipo: 'despesa', icone: 'gamepad', cor: '#9333ea' },
          {
            nome: 'Saúde',
            tipo: 'despesa',
            icone: 'heart-pulse',
            cor: '#0d9488',
          },
          {
            nome: 'Educação',
            tipo: 'despesa',
            icone: 'graduation-cap',
            cor: '#db2777',
          },
          { nome: 'Sem movimento', tipo: 'despesa' },
          { nome: 'Somente pendentes', tipo: 'despesa' },
          { nome: 'Salário', tipo: 'receita', icone: 'wallet', cor: '#16a34a' },
        ],
      },
    },
    include: { categorias: true },
  });
  userId = user.id_usuario;
  ids = Object.fromEntries(
    user.categorias.map((category) => [category.nome, category.id_categoria]),
  );
  const data = [
    ['Moradia', 900, today, 'confirmada'],
    ['Moradia', 750, previous, 'confirmada'],
    ['Alimentação', 40, today, 'confirmada'],
    ['Alimentação', 40, today, 'confirmada'],
    ['Alimentação', 40, today, 'confirmada'],
    ['Transporte', 30, today, 'confirmada'],
    ['Transporte', 30, today, 'confirmada'],
    ['Transporte', 50, previous, 'confirmada'],
    ['Lazer', 10, today, 'confirmada'],
    ['Lazer', 10, today, 'confirmada'],
    ['Saúde', 20, today, 'confirmada'],
    ['Educação', 10, today, 'confirmada'],
    ['Educação', 500, future, 'pendente'],
    ['Somente pendentes', 500, today, 'pendente'],
    ['Salário', 2000, today, 'confirmada'],
    ['Salário', 1000, previous, 'confirmada'],
  ] as const;
  await prisma.transacoes.createMany({
    data: data.map(([name, value, date, status], index) => ({
      id_usuario: userId,
      id_categoria: ids[name],
      descricao: `${name} registro ${index + 1}`,
      valor: value,
      tipo: name === 'Salário' ? ('receita' as const) : ('despesa' as const),
      status,
      data_transacao: new Date(date + 'T12:00:00Z'),
    })),
  });
  token = signToken({ userId, credentialVersion: sessionVersion(user) });
  const saved = {
    token,
    user: {
      id_usuario: userId,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
    },
  };
  await page.addInitScript((auth) => {
    if (!sessionStorage.getItem('category-fixture')) {
      localStorage.setItem('cifrawealth:token', auth.token);
      localStorage.setItem('cifrawealth:user', JSON.stringify(auth.user));
      sessionStorage.setItem('category-fixture', 'true');
    }
  }, saved);
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

test('ranking por valor e frequência distingue categorias, preserva as sem uso e respeita a privacidade', async ({
  page,
}, testInfo) => {
  await page.goto('/categories');
  const summary = page.getByRole('region', { name: 'Resumo das categorias' });
  const ranking = page.getByTestId('category-ranking');
  await expect(summary).toContainText('1.130,00');
  await expect(ranking.getByRole('link')).toHaveCount(5);
  await expect(ranking.getByRole('link').first()).toContainText('Moradia');
  await expect(page.getByRole('list', { name: 'Lista de categorias' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Por quantidade', exact: true }).click();
  await expect(ranking.getByRole('link').first()).toContainText('Alimentação');
  await expect(ranking.getByRole('link').first()).toContainText('3 lançamentos');
  await page.getByRole('button', { name: 'Minhas categorias', exact: true }).click();
  const list = page.getByRole('list', { name: 'Lista de categorias' });
  await expect(list.getByRole('listitem')).toHaveCount(8);
  await expect(
    list.getByRole('listitem').filter({ hasText: 'Sem movimento' }),
  ).toContainText('Sem uso neste período');
  await expect(
    list.getByRole('listitem').filter({ hasText: 'Somente pendentes' }),
  ).toContainText('não confirmados');
  await page.getByLabel('Ordenar categorias').selectOption('count');
  await expect(list.getByRole('listitem').first()).toContainText('Alimentação');
  await page.getByLabel('Buscar categorias').fill('alimentacao');
  await expect(list.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: 'Análise', exact: true }).click();
  await expect(summary).toContainText('1.130,00');
  await page.getByRole('button', { name: 'Minhas categorias', exact: true }).click();
  await page.getByLabel('Buscar categorias').fill('');
  await page.screenshot({
    path: testInfo.outputPath('categorias-escuro.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await page.screenshot({
    path: testInfo.outputPath('categorias-claro.png'),
    fullPage: true,
  });
  await page.getByLabel('Tipo das categorias', { exact: true }).selectOption('receita');
  await expect(list.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: 'Análise', exact: true }).click();
  await expect(summary).toContainText('2.000,00');
  await page
    .getByRole('button', { name: 'Ocultar valores', exact: true })
    .click();
  await expect(page.getByTestId('category-ranking')).toHaveCount(0);
  await expect(page.getByRole('main')).not.toContainText(/\d+[.,]\d{2}\b|\d+%/);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Mostrar valores', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Valores e gráfico ocultos', { exact: true }),
  ).toBeVisible();
});

test('período cancela rascunho, valida datas e abre transações da categoria com filtros persistentes', async ({
  page,
}) => {
  await page.goto('/categories');
  const opener = page.getByRole('button', {
    name: 'Alterar período das categorias',
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole('dialog', {
    name: 'Período das categorias',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Fechar', exact: true }),
  ).toBeFocused();
  await dialog.getByLabel('Data inicial', { exact: true }).fill(previous);
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(opener).toBeFocused();
  await expect(
    page.getByRole('region', { name: 'Resumo das categorias' }),
  ).toContainText('1.130,00');
  await opener.click();
  await expect(dialog.getByLabel('Data inicial', { exact: true })).toHaveValue(
    today.slice(0, 7) + '-01',
  );
  await dialog.getByLabel('Data final', { exact: true }).fill(previous);
  await dialog
    .getByRole('button', { name: 'Aplicar período', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText('inicial');
  await dialog.getByLabel('Data inicial', { exact: true }).fill(previous);
  await dialog
    .getByRole('button', { name: 'Aplicar período', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo das categorias' }),
  ).toContainText('800,00');
  await page
    .getByTestId('category-ranking')
    .getByRole('link', {
      name: 'Ver transações de Moradia no período selecionado',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(new RegExp(`categoria=${ids.Moradia}`));
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await expect(page.locator('.transaction-entry')).toContainText('750,00');
  await page.reload();
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Remover filtro Moradia', exact: true })
    .click();
  await expect(page.locator('.transaction-entry')).toHaveCount(2);
  expect(new URL(page.url()).searchParams.has('categoria')).toBe(false);
  await page.reload();
  await expect(page.locator('.transaction-entry')).toHaveCount(2);
  await page
    .getByRole('button', { name: 'Filtrar transações', exact: true })
    .click();
  const filters = page.getByRole('dialog', {
    name: 'Filtrar transações',
    exact: true,
  });
  await expect(filters.getByLabel('Data inicial', { exact: true })).toHaveValue(
    previous,
  );
  await expect(filters.getByLabel('Data final', { exact: true })).toHaveValue(
    previous,
  );
  await expect(filters.getByLabel('Filtrar situação')).toHaveValue(
    'confirmada',
  );
});

test('personaliza ícone e cor, persiste na API e protege categorias vinculadas', async ({
  page,
  request,
}) => {
  await page.goto('/categories');
  await page
    .getByRole('button', { name: 'Nova Categoria', exact: true })
    .click();
  let dialog = page.getByRole('dialog', {
    name: 'Nova Categoria',
    exact: true,
  });
  await expect(dialog.getByLabel('Nome da categoria')).toBeFocused();
  await dialog.getByLabel('Nome da categoria').fill('Viagem personalizada');
  await dialog
    .getByRole('button', { name: 'Ícone Viagem', exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Cor Roxo', exact: true }).click();
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const response = await request.get(API + '/categories', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const created = (await response.json()).find(
    (item: { nome: string }) => item.nome === 'Viagem personalizada',
  );
  expect(created.icone).toBe('plane');
  expect(created.cor).toBe('#9333ea');
  await page.reload();
  let row = page
    .getByRole('list', { name: 'Lista de categorias' })
    .getByRole('listitem')
    .filter({ hasText: 'Viagem personalizada' });
  await row
    .getByRole('button', {
      name: 'Editar categoria Viagem personalizada',
      exact: true,
    })
    .click();
  dialog = page.getByRole('dialog', { name: 'Editar Categoria', exact: true });
  await expect(
    dialog.getByRole('button', { name: 'Ícone Viagem', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    dialog.getByRole('button', { name: 'Cor Roxo', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByLabel('Tipo', { exact: true }).selectOption('receita');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel('Tipo das categorias', { exact: true })).toHaveValue('receita');
  await row
    .getByRole('button', {
      name: 'Excluir categoria Viagem personalizada',
      exact: true,
    })
    .click();
  await page
    .getByRole('dialog', { name: 'Excluir categoria', exact: true })
    .getByRole('button', { name: 'Confirmar exclusão', exact: true })
    .click();
  await expect(row).toHaveCount(0);
  await page.getByLabel('Tipo das categorias', { exact: true }).selectOption('despesa');
  row = page
    .getByRole('list', { name: 'Lista de categorias' })
    .getByRole('listitem')
    .filter({ hasText: 'Moradia' });
  await row
    .getByRole('button', { name: 'Editar categoria Moradia', exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Editar Categoria', exact: true });
  await expect(dialog.getByLabel('Tipo', { exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await row
    .getByRole('button', { name: 'Excluir categoria Moradia', exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Excluir categoria', exact: true });
  await dialog
    .getByRole('button', { name: 'Confirmar exclusão', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText('possui transações');
});

test('falha parcial preserva gerenciamento e textos extremos cabem em 320px com acessibilidade', async ({
  page,
}) => {
  await page.route('**/api/transactions', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Falha temporária de uso.' }),
    }),
  );
  await page.goto('/categories');
  await expect(page.getByRole('alert')).toContainText(
    'Você ainda pode gerenciar',
  );
  await expect(
    page.getByRole('button', { name: 'Nova Categoria', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByText('Sem uso neste período', { exact: true }),
  ).toHaveCount(0);
  await page.unroute('**/api/transactions');
  await page
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Resumo das categorias' }),
  ).toContainText('1.130,00');
  await prisma.categorias.update({
    where: { id_categoria: ids.Moradia },
    data: { nome: 'X'.repeat(50) },
  });
  await prisma.transacoes.updateMany({
    where: { id_usuario: userId, id_categoria: ids.Moradia },
    data: { valor: 99999999.99 },
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.reload();
  await page
    .getByRole('button', { name: 'Acessibilidade', exact: true })
    .click();
  await page.getByRole('button', { name: 'Maior', exact: true }).click();
  await page.getByRole('button', { name: /^Alto contraste/ }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Minhas categorias', exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole('button', {
      name: 'Alterar período das categorias',
      exact: true,
    })
    .click();
  const period = page.getByRole('dialog', {
    name: 'Período das categorias',
    exact: true,
  });
  await expect(
    period.getByRole('button', { name: 'Fechar', exact: true }),
  ).toBeInViewport();
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Nova Categoria', exact: true })
    .click();
  const form = page.getByRole('dialog', {
    name: 'Nova Categoria',
    exact: true,
  });
  await expect(form.getByLabel('Nome da categoria')).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
