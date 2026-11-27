import { test, expect, type Page } from '@playwright/test';

const user = { id_usuario: 999972, nome: 'Ana', sobrenome: 'Teste', email: 'history@example.test', tem_senha: true };
const categories = [{ id_categoria: 1, nome: 'Trabalho', tipo: 'receita', cor: '#10b981', icone: 'wallet' }, { id_categoria: 2, nome: 'Moradia', tipo: 'despesa', cor: '#ef4444', icone: 'home' }];

async function setup(page: Page) {
  const reads: URL[] = [];
  let count = 41;
  await page.clock.setFixedTime(new Date('2026-11-25T15:00:00Z'));
  await page.addInitScript((user) => {
    localStorage.setItem('cifrawealth:token', 'history-fixture-only');
    localStorage.setItem('cifrawealth:user', JSON.stringify(user));
  }, user);
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.slice(4);
    if (path.startsWith('/transactions/') && route.request().method() === 'DELETE') {
      count = 40; return route.fulfill({ json: {} });
    }
    expect(route.request().method()).toBe('GET');
    reads.push(url);
    if (path === '/users/me') return route.fulfill({ json: user });
    if (path === '/goals') return route.fulfill({ json: [] });
    if (path === '/dashboard') return route.fulfill({ json: { saldo: 3000, total_receitas: 4000, total_despesas: 1000, por_categoria: [] } });
    if (path === '/reports/monthly') return route.fulfill({ json: [{ mes: '2026-11', total_receitas: 4000, total_despesas: 1000, saldo: 3000 }] });
    if (path === '/reports/detailed') return route.fulfill({ json: {
      dataInicio: url.searchParams.get('data_inicio'), dataFim: url.searchParams.get('data_fim'),
      summary: { receitas: 4000, despesas: 1000, saldo: 3000, taxaEconomiaPercentual: 75, variacaoReceitas: null, variacaoDespesas: null, variacaoSaldo: null, variacaoTaxaEconomia: null },
      evolution: [], monthlyComparison: [], history: [], categoryBreakdown: [], goals: [], insights: [], transactions: [],
    } });
    if (path === '/categories') {
      if (url.searchParams.get('view') !== 'usage') return route.fulfill({ json: categories });
      const all = !url.searchParams.has('start');
      return route.fulfill({ json: { items: [
        { id_categoria: 1, amount: all ? 9000 : 4000, count: all ? 90 : 40, historyCount: 1000 },
        { id_categoria: 2, amount: all ? 2000 : 1000, count: all ? 20 : 10, historyCount: 500 },
      ] } });
    }
    if (path === '/transactions') {
      expect(url.searchParams.get('view')).toBe('page');
      const pending = url.searchParams.get('state') === 'pendente';
      const search = url.searchParams.get('search');
      if (search === 'devagar') await new Promise((resolve) => setTimeout(resolve, 550));
      const total = search ? 0 : pending ? (count === 41 ? 1 : 0) : count;
      const pageSize = Number(url.searchParams.get('pageSize'));
      const current = Math.min(Number(url.searchParams.get('pageNumber')), Math.max(1, Math.ceil(total / pageSize)));
      const start = (current - 1) * pageSize;
      const items = Array.from({ length: Math.min(pageSize, total - start) }, (_, index) => {
        const id = pending ? 41 : start + index + 1;
        return { id_transacao: id, id_categoria: 1, descricao: 'Lançamento ' + id, valor: 1, tipo: 'receita', status: id === 41 ? 'pendente' : 'confirmada', data_transacao: '2026-11-25' };
      });
      return route.fulfill({ json: { items, total, page: current, pageSize, hasHistory: true,
        summary: { income: search || pending ? 0 : 40, expense: 0, result: search || pending ? 0 : 40, pending: total && count === 41 ? 1 : 0, scheduled: 0 } } });
    }
    return route.fulfill({ status: 404, json: { message: 'Rota inesperada: ' + path } });
  });
  return reads;
}

test('paginação usa totais completos e recua ao excluir a última linha da última página', async ({ page }) => {
  const reads = await setup(page);
  await page.goto('/transactions');
  const pagination = page.getByRole('navigation', { name: 'Paginação das transações', exact: true });
  await expect(page.getByRole('region', { name: 'Resumo das transações', exact: true })).toContainText('R$ 40,00');
  await expect(page.locator('.transaction-entry')).toHaveCount(20);
  await expect(pagination).toContainText('de 41 · Página 1 de 3');
  for (let index = 0; index < 2; index++) {
    await pagination.getByRole('button', { name: 'Próxima', exact: true }).click();
    await expect(pagination).toContainText('Página ' + (index + 2) + ' de 3');
  }
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ver detalhes de Lançamento 41', exact: true }).click();
  await page.getByRole('dialog', { name: 'Detalhes da transação', exact: true }).getByRole('button', { name: 'Excluir transação', exact: true }).click();
  await page.getByRole('dialog', { name: 'Excluir transação', exact: true }).getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(pagination).toContainText('de 40 · Página 2 de 2');
  await expect(page.locator('.transaction-entry')).toHaveCount(20);
  expect(reads.filter((url) => url.pathname === '/api/transactions').every((url) => Number(url.searchParams.get('pageSize')) <= 20)).toBe(true);
});

test('filtros contam lançamentos fora da página atual e respostas antigas não sobrescrevem a busca', async ({ page }) => {
  await setup(page);
  await page.goto('/transactions');
  await expect(page.locator('.transaction-entry')).toHaveCount(20);
  await page.getByRole('button', { name: 'Filtrar transações', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Filtrar transações', exact: true });
  await modal.getByLabel('Filtrar situação', { exact: true }).selectOption('pendente');
  await expect(modal).toContainText('1 transação corresponde à seleção');
  await modal.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await expect(page.locator('.transaction-entry')).toContainText('Lançamento 41');
  await page.getByRole('button', { name: 'Remover filtro Pendentes', exact: true }).click();
  await expect(page.locator('.transaction-entry')).toHaveCount(20);
  const search = page.getByPlaceholder('Descrição ou categoria', { exact: true });
  await search.fill('devagar');
  await page.waitForRequest((request) => request.url().includes('search=devagar'));
  await search.fill('inexistente');
  await expect(page.getByText('Nenhuma transação encontrada com estes filtros.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver todas as transações', exact: true })).toBeVisible();
  await search.fill('');
  await expect(page.locator('.transaction-entry')).toHaveCount(20);
});

test('categorias recebem estatísticas completas sem baixar transações e atualizam o período', async ({ page }) => {
  const reads = await setup(page);
  await page.goto('/categories?view=usage');
  const summary = page.getByRole('region', { name: 'Resumo das categorias', exact: true });
  await expect(summary).toContainText('R$ 4.000,00');
  await expect(summary).toContainText('R$ 1.000,00');
  await page.getByRole('button', { name: 'Alterar período das categorias', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByRole('button', { name: 'Todo o período', exact: true }).click();
  await modal.getByRole('button', { name: 'Aplicar período', exact: true }).click();
  await expect(summary).toContainText('R$ 9.000,00');
  await expect(summary).toContainText('R$ 2.000,00');
  expect(reads.some((url) => url.pathname === '/api/transactions')).toBe(false);
});

test('falha ao carregar uma página oferece recuperação e volta a funcionar ao recarregar', async ({ page }) => {
  await setup(page);
  const route = '**/src/pages/HelpPage.tsx*';
  await page.route(route, (request) => request.abort());
  await page.goto('/help');
  await expect(page.getByRole('heading', { name: 'Não foi possível abrir esta página', exact: true })).toBeVisible();
  await page.unroute(route);
  await page.getByRole('button', { name: 'Recarregar página', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Como usar a CifraWealth', exact: true })).toBeVisible();
});
