import { test, expect } from '@playwright/test';

test('demonstração explícita exibe aviso e acessa somente dados fictícios locais', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/')) requests.push(request.url()); });
  await page.goto('/login');
  await expect(page.getByRole('status')).toContainText('Modo demonstração');
  await page.getByRole('button', { name: 'Entrar na demonstração', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('status')).toContainText('dados fictícios');
  await expect(page.getByText('Reserva de Emergência', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.evaluate(() => window.scrollTo(0, 500));
  const banner = await page.getByRole('status').boundingBox();
  const header = await page.getByRole('banner', { name: 'Cabeçalho principal' }).boundingBox();
  expect(banner!.y).toBe(0);
  expect(header!.y).toBe(banner!.height);
  await page.getByRole('button', { name: 'Notificações', exact: true }).click();
  const panel = await page.getByRole('region', { name: 'Notificações' }).boundingBox();
  expect(panel!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  expect(requests).toEqual([]);
});
