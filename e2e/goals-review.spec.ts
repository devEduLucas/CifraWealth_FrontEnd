import { test, expect } from '@playwright/test';

const goal = {
  id_meta: 987,
  titulo: 'Reserva de segurança',
  descricao: 'Um objetivo para acompanhar neste teste.',
  valor_atual: 1234,
  valor_objetivo: 4936,
  status: 'em_andamento',
  data_fim: null,
};

test.beforeEach(async ({ page }) => {
  // Read-only browser fixtures: no database records or external messages.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('goals-review-seeded')) return;
    localStorage.setItem('cifrawealth:token', 'goals-review-local-fixture');
    localStorage.setItem('cifrawealth:user', JSON.stringify({ id_usuario: 987, nome: 'Teste', sobrenome: 'Metas', email: 'goals-review@example.test' }));
    localStorage.setItem('cifrawealth:hide-financial-values', 'true');
    sessionStorage.setItem('goals-review-seeded', 'true');
  });
  await page.route('**/api/goals', (route) => route.fulfill({ json: [goal] }));
  await page.route('https://vlibras.gov.br/**', (route) => route.abort());
});

test('privacidade compartilhada oculta valores, progresso e detalhes, preservando ações explícitas', async ({ page }) => {
  await page.goto('/goals');
  const main = page.getByRole('main');
  await expect(main.getByText('Reserva de segurança', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mostrar valores', exact: true })).toBeVisible();
  await expect(main).not.toContainText(/1\.234,00|4\.936,00|3\.702,00|25%/);
  await expect(main.locator('[style*="width"]')).toHaveCount(0);
  await main.getByRole('link', { name: 'Ver meta Reserva de segurança', exact: true }).click();
  const details = page.getByRole('main');
  await expect(page).toHaveURL(/\/goals\/987$/);
  await expect(details.getByText('Seu progresso', { exact: true })).toBeVisible();
  await expect(details.getByText('Oculto', { exact: true })).toBeVisible();
  await expect(details).not.toContainText(/1\.234,00|4\.936,00|25%/);
  await main.getByRole('button', { name: 'Guardar valor', exact: true }).click();
  const contribution = page.getByRole('dialog', { name: 'Adicionar valor guardado', exact: true });
  await expect(contribution.getByLabel('Valor deste aporte')).toBeEditable();
  await page.keyboard.press('Escape');
  await expect(main).not.toContainText(/1\.234,00|4\.936,00|3\.702,00|25%/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mostrar valores', exact: true })).toBeVisible();
  await expect(main).not.toContainText(/1\.234,00|4\.936,00|3\.702,00|25%/);
  await page.getByRole('button', { name: 'Mostrar valores', exact: true }).click();
  await expect(main).toContainText('1.234,00');
  await expect(main).toContainText('4.936,00');
  await expect(main).toContainText('3.702,00');
  await expect(main.getByText('25%', { exact: true }).first()).toBeVisible();
});

test('filtros e resumo compacto cabem em 320px com texto ampliado nos dois temas', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/goals');
  await expect(page.getByRole('button', { name: 'Mostrar valores', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
  await page.getByRole('button', { name: 'Maior', exact: true }).click();
  await page.keyboard.press('Escape');
  for (let theme = 0; theme < 2; theme++) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const summary = await page.getByLabel('Resumo das metas não canceladas', { exact: true }).boundingBox();
    expect(summary!.height).toBeLessThan(260);
    const filters = page.getByRole('group', { name: 'Filtrar metas por situação', exact: true });
    await filters.getByRole('button', { name: 'Concluídas', exact: true }).click();
    await expect(filters.getByRole('button', { name: 'Concluídas', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await filters.getByRole('button', { name: 'Todas', exact: true }).click();
    await page.getByRole('button', { name: /Ativar modo (claro|escuro)/ }).click();
  }
});
