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

async function openDashboard(page: Page, empty = false) {
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
    } else if (url.pathname === '/api/reports/monthly') {
      body = empty ? [] : months.filter((month) => month.mes.startsWith(url.searchParams.get('ano')!));
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
