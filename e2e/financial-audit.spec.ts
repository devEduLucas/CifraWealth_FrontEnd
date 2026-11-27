import { test, expect, type Page } from '@playwright/test';

const TODAY = '2026-11-25';
const user = { id_usuario: 999991, nome: 'Auditoria', sobrenome: 'Isolada', email: 'audit@example.test', tem_senha: true, acesso_google: false };
const categories = [{ id_categoria: 1, nome: 'Moradia', tipo: 'despesa', cor: '#ef4444', icone: 'home' }];
const transactions = Array.from({ length: 25 }, (_, index) => ({ id_transacao: index + 1, id_categoria: 1, descricao: `Despesa ${index + 1}`, valor: 123.45, tipo: 'despesa', status: 'confirmada', data_transacao: TODAY }));
const goals = Array.from({ length: 5 }, (_, index) => ({ id_meta: index + 1, titulo: `Objetivo ${index + 1}`, descricao: null, valor_atual: 100, valor_objetivo: 1000, status: 'em_andamento', data_inicio: '2026-01-01', data_fim: '2027-12-31' }));

function report(monthCount: number) {
  const monthly = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(Date.UTC(2026, 10 - monthCount + 1 + index, 1));
    const id = date.toISOString().slice(0, 7);
    return { id, mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }), receitas: 3000 + index * 100, despesas: 2000, saldo: 1000 + index * 100 };
  });
  const income = monthly.reduce((sum, item) => sum + item.receitas, 0);
  const expense = monthly.reduce((sum, item) => sum + item.despesas, 0);
  return {
    dataInicio: monthly[0].id + '-01', dataFim: TODAY,
    summary: { receitas: income, despesas: expense, saldo: income - expense, taxaEconomiaPercentual: 33, variacaoReceitas: null, variacaoDespesas: null, variacaoSaldo: null, variacaoTaxaEconomia: null },
    evolution: monthly, monthlyComparison: monthly,
    history: monthly.map((item) => ({ ...item, periodo: item.mes, variacaoPercentual: null })),
    categoryBreakdown: [{ id: 1, nome: 'Moradia', total: expense, percentual: 100, cor: '#ef4444' }],
    insights: [], goals: [],
    transactions: [{ id: 1, data: TODAY, descricao: 'Despesa confirmada', categoria: 'Moradia', tipo: 'despesa', valor: 123.45 }],
  };
}

async function mockApp(page: Page, months = 12, appReducedMotion = false, withGoals = false) {
  await page.clock.setFixedTime(new Date(TODAY + 'T15:00:00Z'));
  await page.addInitScript(({ user, appReducedMotion }) => {
    localStorage.setItem('cifrawealth:token', 'isolated-financial-audit');
    localStorage.setItem('cifrawealth:user', JSON.stringify(user));
    localStorage.setItem('cifrawealth:accessibility', JSON.stringify({ textSize: 'normal', highContrast: false, underlineLinks: false, reduceMotion: appReducedMotion }));
  }, { user, appReducedMotion });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    const body = path === '/users/me' ? user : path === '/transactions' ? transactions : path === '/categories' ? categories : path === '/reports/detailed' ? report(months) : path === '/goals' ? (withGoals ? goals : []) : null;
    if (body === null) return route.fulfill({ status: 404, json: { message: 'Rota inesperada no teste: ' + path } });
    return route.fulfill({ json: body });
  });
}

for (const count of [12, 60]) {
  for (const theme of ['light', 'dark']) {
    test(`comparativo de ${count} meses permanece legível no tema ${theme}`, async ({ page }, info) => {
      await mockApp(page, count);
      const response = report(count);
      await page.goto(`/reports?inicio=${response.dataInicio}&fim=${TODAY}`);
      await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
      await page.getByRole('button', { name: 'Detalhamento', exact: true }).click();
      const region = page.getByRole('region', { name: 'Comparativo Mensal', exact: true });
      const svg = region.getByRole('img', { name: 'Comparação mensal de receitas e despesas', exact: true });
      await expect(svg).toBeVisible();
      const overlap = await svg.locator('text').evaluateAll((nodes, count) => {
        const labels = nodes.slice(-count).map((node) => node.getBoundingClientRect());
        return labels.slice(1).filter((label, index) => label.left < labels[index].right).length;
      }, count);
      expect(overlap).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (await region.evaluate((element) => element.scrollWidth > element.clientWidth)) {
        await region.focus();
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      }
      await region.screenshot({ path: info.outputPath(`comparativo-${count}-${theme}.png`) });
      await page.getByText('Ver valores do comparativo mensal', { exact: true }).click();
      const table = page.getByRole('table', { name: 'Receitas e despesas de cada mês do período', exact: true });
      await expect(table.getByRole('row')).toHaveCount(count + 1);
      await expect(table.getByRole('row').nth(1)).toContainText('R$ 3.000,00');
      await expect(table.getByRole('row').last()).toContainText(response.monthlyComparison.at(-1)!.mes);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

for (const preference of [
  { app: true, system: 'no-preference', behavior: 'instant' },
  { app: false, system: 'reduce', behavior: 'instant' },
  { app: false, system: 'no-preference', behavior: 'smooth' },
] as const) {
  test(`rolagens respeitam app=${preference.app} e sistema=${preference.system}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference.system });
    await mockApp(page, 12, preference.app, true);
    await page.addInitScript(() => {
      const calls: Array<{ kind: string; behavior?: string }> = [];
      Object.defineProperty(window, '__financialAuditScrolls', { value: calls });
      for (const method of ['scrollBy', 'scrollTo', 'scrollIntoView'] as const) {
        const original = Element.prototype[method];
        Object.defineProperty(Element.prototype, method, {
          configurable: true,
          value: function (this: Element, ...args: unknown[]) {
            const kind = this.matches('.goal-carousel') ? 'carousel' : this.getAttribute('aria-labelledby') === 'transaction-list-title' ? 'transactions' : null;
            if (kind) calls.push({ kind, behavior: (args[0] as ScrollOptions | undefined)?.behavior });
            return Reflect.apply(original, this, args);
          },
        });
      }
    });
    const calls = () => page.evaluate(() => (window as Window & { __financialAuditScrolls: Array<{ kind: string; behavior: string }> }).__financialAuditScrolls);
    await page.goto('/goals');
    await page.getByRole('button', { name: 'Próximas metas', exact: true }).click();
    expect((await calls()).filter((call) => call.kind === 'carousel').at(-1)?.behavior).toBe(preference.behavior);
    await page.getByRole('list', { name: 'Suas metas', exact: true }).focus();
    await page.keyboard.press('End');
    expect((await calls()).filter((call) => call.kind === 'carousel').at(-1)?.behavior).toBe(preference.behavior);
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Próxima', exact: true }).click();
    expect((await calls()).filter((call) => call.kind === 'transactions').at(-1)?.behavior).toBe(preference.behavior);
  });
}

test('criar primeira meta no relatório abre diretamente o formulário', async ({ page }) => {
  await mockApp(page);
  await page.goto('/reports');
  await page.getByRole('button', { name: 'Detalhamento', exact: true }).click();
  await page.getByText('Metas — situação atual, independente do período', { exact: true }).click();
  await page.getByRole('link', { name: '+ Criar primeira meta', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Nova Meta', exact: true })).toBeVisible();
});

for (const route of ['/profile', '/categories?view=usage']) {
  test(`comparação de receitas e despesas mantém termos e valores associados em ${route}`, async ({ page }) => {
    await mockApp(page);
    await page.goto(route);
    await expect(page.getByRole('term').filter({ hasText: /^Receitas$/ })).toBeVisible();
    await expect(page.getByRole('term').filter({ hasText: /^Despesas$/ })).toBeVisible();
    const invalidTerms = await page.locator('main dt, main dd').evaluateAll((terms) => terms.filter((term) => {
      const parent = term.parentElement;
      return parent?.tagName !== 'DL' && !(parent?.tagName === 'DIV' && parent.parentElement?.tagName === 'DL');
    }).map((term) => term.textContent));
    expect(invalidTerms).toEqual([]);
    for (const label of ['Receitas', 'Despesas']) {
      const pair = page.locator('dl').filter({ has: page.getByRole('term').filter({ hasText: new RegExp(`^${label}$`) }) });
      await expect(pair.getByRole('definition')).toHaveCount(1);
      await expect(pair.getByRole('definition')).toContainText('R$');
    }
  });
}
