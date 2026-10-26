import { test, expect, type Page } from '@playwright/test';

const months = Array.from({ length: 6 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 5 + index);
  return {
    mes: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    total_receitas: 1234.56 + index,
    total_despesas: 100.01 + index,
    saldo: 1134.55,
  };
});
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function openDashboard(page: Page, empty = false, onlyCurrentMonth = false, zeroesBeforeLastMonth = false) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem('cifrawealth:token', 'chart-review-local-fixture');
    localStorage.setItem('cifrawealth:user', JSON.stringify({
      id_usuario: 999999, nome: 'Teste', sobrenome: 'Gráfico', email: 'chart@example.test',
    }));
    localStorage.removeItem('cifrawealth:hide-financial-values');
  });
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = [];
    if (url.pathname === '/api/dashboard') {
      body = { saldo: 6807.3, total_receitas: 7422.36, total_despesas: 615.06, por_categoria: [] };
    } else if (url.pathname === '/api/transactions' && url.searchParams.get('limit') === '1') {
      // An established account can have no recent confirmed entries.
      body = [{ id_transacao: 1, id_categoria: 1, valor: 1, tipo: 'receita', descricao: 'Registro pendente', data_transacao: '2026-01-01', status: 'pendente' }];
    } else if (url.pathname === '/api/reports/monthly') {
      const chartMonths = zeroesBeforeLastMonth ? months.map((month, index) => index < months.length - 1 ? { ...month, total_receitas: 0, total_despesas: 0, saldo: 0 } : month) : months;
      body = empty ? [] : (onlyCurrentMonth ? chartMonths.slice(-1) : chartMonths).filter((month) => month.mes.startsWith(url.searchParams.get('ano')!));
    }
    await route.fulfill({ status: 200, json: body });
  });
  await page.goto('/dashboard');
}

test('dados do gráfico são acessíveis por teclado e seguem a ocultação de valores', async ({ page }) => {
  await openDashboard(page);
  const toggle = page.getByText('Ver dados do gráfico', { exact: true });
  const table = page.getByRole('table', { name: /Receitas e despesas por mês/ });
  await expect(toggle).toBeVisible();
  await expect(table).toBeHidden();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(table).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(7);
  for (let index = 0; index < months.length; index += 1) {
    const row = table.getByRole('row').nth(index + 1);
    await expect(row.getByRole('cell').nth(0)).toHaveText(currency.format(months[index].total_receitas));
    await expect(row.getByRole('cell').nth(1)).toHaveText(currency.format(months[index].total_despesas));
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(table).toHaveCount(0);
  await expect(toggle).toHaveCount(0);
  await page.getByRole('button', { name: 'Mostrar valores', exact: true }).click();
  await expect(toggle).toBeVisible();
  await expect(table).toBeHidden();
});

test('gráfico aceita resposta mensal vazia sem interromper o dashboard', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openDashboard(page, true);
  await expect(page.getByText('Sem movimentações neste período.', { exact: true })).toBeVisible();
  await page.getByText('Ver dados do gráfico', { exact: true }).click();
  await expect(page.getByText('Nenhum mês disponível neste período.', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('primeiro mês com valores tem gráfico e dados sem mensagem de ausência de registros', async ({ page }) => {
  await openDashboard(page, false, true);
  await expect(page.getByRole('img', { name: 'Evolução de receitas e despesas' })).toBeVisible();
  await expect(page.getByText('Sem movimentações neste período.', { exact: true })).toHaveCount(0);
  await page.getByText('Ver dados do gráfico', { exact: true }).click();
  const table = page.getByRole('table', { name: /Receitas e despesas por mês/ });
  await expect(table.getByRole('row')).toHaveCount(2);
  await expect(table.getByRole('cell').first()).toHaveText(currency.format(months[months.length - 1].total_receitas));
});

test('meses zerados seguidos de receita não criam um trecho negativo no gráfico', async ({ page }) => {
  await openDashboard(page, false, false, true);
  const lines = page.getByRole('img', { name: 'Evolução de receitas e despesas' }).locator('path[fill="none"]');
  await expect(lines).toHaveCount(2);
  for (const line of await lines.all()) {
    const geometry = await line.evaluate((element) => {
      const path = element as SVGPathElement;
      const start = path.getPointAtLength(0);
      const box = path.getBBox();
      return { zeroBaseline: start.y, lowestPoint: box.y + box.height };
    });
    expect(geometry.lowestPoint).toBeLessThanOrEqual(geometry.zeroBaseline + 0.01);
  }
});
