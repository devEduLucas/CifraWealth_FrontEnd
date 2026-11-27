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
