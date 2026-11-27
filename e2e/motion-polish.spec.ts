import { test, expect, type Page } from '@playwright/test';
import { REPORT_RESPONSES } from './fixtures/reportResponses';

test.use({ reducedMotion: 'no-preference' });

type RecordedMotion = { node: Element; animation: Animation };
type MotionWindow = Window & { chartMotions: RecordedMotion[] };
const user = { id_usuario: 999973, nome: 'Ana', sobrenome: 'Teste', email: 'motion@example.test', tem_senha: true };
const categories = [
  { id_categoria: 1, nome: 'Salário', tipo: 'receita', cor: '#10b981', icone: 'wallet' },
  { id_categoria: 2, nome: 'Moradia', tipo: 'despesa', cor: '#ef4444', icone: 'home' },
];
const transactions = [
  { id_transacao: 1, id_categoria: 1, descricao: 'Salário de outubro', valor: 3200.55, tipo: 'receita', status: 'confirmada', data_transacao: '2026-10-05' },
  { id_transacao: 2, id_categoria: 2, descricao: 'Aluguel de outubro', valor: 800.25, tipo: 'despesa', status: 'confirmada', data_transacao: '2026-10-15' },
];

async function setup(page: Page, { appReduced = false, pauseCharts = false } = {}) {
  await page.clock.setFixedTime(new Date('2026-10-25T15:00:00Z'));
  await page.addInitScript(({ user, appReduced, pauseCharts }) => {
    localStorage.setItem('cifrawealth:token', 'isolated-motion-fixture');
    localStorage.setItem('cifrawealth:user', JSON.stringify(user));
    localStorage.setItem('cifrawealth:accessibility', JSON.stringify({ textSize: 'normal', highContrast: false, underlineLinks: false, reduceMotion: appReduced }));
    const motions: RecordedMotion[] = [];
    Object.defineProperty(window, 'chartMotions', { value: motions });
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = Reflect.apply(animate, this, args) as Animation;
      if (this.hasAttribute('data-chart-motion')) {
        motions.push({ node: this, animation });
        if (pauseCharts) animation.pause();
      }
      return animation;
    };
  }, { user, appReduced, pauseCharts });
  // All finances are intercepted fixtures. This suite cannot send email or modify accounts.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.route('**/api/**', async (route) => {
    expect(route.request().method()).toBe('GET');
    const url = new URL(route.request().url());
    const path = url.pathname.slice(4);
    let body: unknown = [];
    if (path === '/users/me') body = user;
    else if (path === '/categories') body = categories;
    else if (path === '/transactions') body = transactions;
    else if (path === '/goals') body = [{ id_meta: 1, titulo: 'Reserva', valor_atual: 500, valor_objetivo: 2000, status: 'em_andamento', data_inicio: '2026-01-01', data_fim: '2027-12-31' }];
    else if (path === '/dashboard') body = { saldo: 2400.3, total_receitas: 3200.55, total_despesas: 800.25, por_categoria: [] };
    else if (path === '/reports/monthly') body = Array.from({ length: 12 }, (_, index) => ({ mes: `2026-${String(index + 1).padStart(2, '0')}`, total_receitas: 3200.55, total_despesas: 800.25, saldo: 2400.3 }));
    else if (path === '/reports/detailed') {
      body = REPORT_RESPONSES[url.searchParams.get('data_inicio') + '|' + url.searchParams.get('data_fim')];
      expect(body).toBeDefined();
    }
    return route.fulfill({ json: body });
  });
}

async function finishCharts(page: Page) {
  await page.evaluate(() => {
    for (const { animation } of (window as MotionWindow).chartMotions) {
      if (animation.playState !== 'idle') animation.finish();
    }
  });
}

const evolution = (page: Page) => page.getByRole('region', { name: 'Receitas, despesas e saldo', exact: true });

test('barras e rosca animam a apresentação sem alterar totais, escala ou orientação', async ({ page }, info) => {
  await setup(page, { pauseCharts: true });
  await page.goto('/reports');
  const chart = evolution(page);
  await chart.scrollIntoViewIfNeeded();
  await expect(chart).toHaveAttribute('data-motion-state', 'playing');
  await expect(chart.locator('dl')).toContainText('R$ 3.200,55');
  await chart.locator('rect').evaluateAll((nodes) => {
    nodes.forEach((node) => node.getAnimations().forEach((animation) => { animation.currentTime = 180; }));
  });
  await chart.screenshot({ path: info.outputPath('barras-durante-animacao.png') });
  const heights = await chart.locator('rect').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('height')));
  const donut = page.getByRole('region', { name: 'Despesas por Categoria', exact: true });
  await donut.scrollIntoViewIfNeeded();
  await expect(donut).toHaveAttribute('data-motion-state', 'playing');
  await expect(donut).toContainText('R$ 800,25');
  await expect(donut).toContainText('100%');
  const rotation = await donut.locator('svg').evaluate((svg) => getComputedStyle(svg).transform);
  expect(rotation).not.toBe('none');
  const timings = await page.evaluate(() => (window as MotionWindow).chartMotions.map(({ animation }) => animation.effect!.getComputedTiming()));
  expect(timings.every((timing) => Number(timing.endTime) <= 900 && timing.iterations === 1)).toBe(true);
  await finishCharts(page);
  await expect(chart).toHaveAttribute('data-motion-state', 'finished');
  await expect(donut).toHaveAttribute('data-motion-state', 'finished');
  expect(await chart.locator('rect').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('height')))).toEqual(heights);
  expect(await donut.locator('svg').evaluate((svg) => getComputedStyle(svg).transform)).toBe(rotation);
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: info.outputPath('relatorio-animado-final.png'), fullPage: true });
});

test('linhas preservam os centavos e traçados após trocar o período', async ({ page }) => {
  await setup(page, { pauseCharts: true });
  await page.goto('/reports');
  await page.getByLabel('Selecionar período do relatório').selectOption('3m');
  const chart = evolution(page);
  await chart.scrollIntoViewIfNeeded();
  await expect(chart).toHaveAttribute('data-motion-state', 'playing');
  const lines = chart.locator('polyline');
  await expect(lines).toHaveCount(3);
  const geometry = await lines.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('points')));
  await expect(chart.locator('[data-series="despesas"] polyline')).toHaveAttribute('stroke-dasharray', '6 4');
  await expect(chart.locator('[data-series="saldo"] polyline')).toHaveAttribute('stroke-dasharray', '2 4');
  await finishCharts(page);
  await expect(chart).toHaveAttribute('data-motion-state', 'finished');
  expect(await lines.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('points')))).toEqual(geometry);
  await chart.getByText('Ver valores do gráfico', { exact: true }).click();
  await expect(chart.getByRole('row').nth(2)).toContainText('-R$ 200,00');
  await expect(chart.getByRole('row').last()).toContainText('R$ 3.200,55');
  const count = await page.evaluate(() => (window as MotionWindow).chartMotions.length);
  await lines.first().hover({ force: true });
  expect(await page.evaluate(() => (window as MotionWindow).chartMotions.length)).toBe(count);
});

test('barra de saldo negativo cresce a partir do zero e termina no mesmo valor', async ({ page }) => {
  await setup(page, { pauseCharts: true });
  await page.goto('/reports?inicio=2026-09-01&fim=2026-09-30');
  const chart = evolution(page);
  await chart.scrollIntoViewIfNeeded();
  await expect(chart).toHaveAttribute('data-motion-state', 'playing');
  const bar = chart.locator('[data-series="saldo"] rect');
  const zero = Number(await chart.locator('svg[role="img"] > line').getAttribute('y1'));
  expect(Number(await bar.getAttribute('y'))).toBeCloseTo(zero);
  await expect(bar).toHaveAttribute('data-motion-negative', 'true');
  const origin = await bar.evaluate((node) => getComputedStyle(node).transformOrigin);
  expect(Number.parseFloat(origin.split(' ')[1])).toBe(0);
  await expect(chart.locator('dl')).toContainText('-R$ 200,00');
  await finishCharts(page);
  await expect(chart).toHaveAttribute('data-motion-state', 'finished');
  await expect(bar).toHaveCSS('transform', 'none');
  expect(Number(await bar.getAttribute('height'))).toBeGreaterThan(0);
});

test('dashboard mantém o tooltip estável e a privacidade cancela gráficos em andamento', async ({ page }) => {
  await setup(page, { pauseCharts: true });
  await page.goto('/dashboard');
  const svg = page.getByRole('img', { name: 'Evolução de receitas e despesas', exact: true });
  await svg.scrollIntoViewIfNeeded();
  const chart = svg.locator('xpath=../..');
  await expect(chart).toHaveAttribute('data-motion-state', 'playing');
  const count = await page.evaluate(() => (window as MotionWindow).chartMotions.length);
  await svg.hover({ force: true });
  await expect(chart).toContainText('R$ 3.200,55');
  expect(await page.evaluate(() => (window as MotionWindow).chartMotions.length)).toBe(count);
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(svg).toHaveCount(0);
  expect(await page.evaluate(() => (window as MotionWindow).chartMotions.every(({ node, animation }) => node.isConnected || animation.playState === 'idle'))).toBe(true);
  await expect(page.getByRole('main')).not.toContainText('3.200,55');
  await page.getByRole('button', { name: 'Mostrar valores', exact: true }).click();
  await svg.scrollIntoViewIfNeeded();
  await expect(chart).toHaveAttribute('data-motion-state', 'playing');
  await finishCharts(page);
  await expect(chart).toHaveAttribute('data-motion-state', 'finished');
});

for (const preference of ['app', 'system'] as const) {
  test(`reduzir movimentos pelo ${preference} mantém gráficos e janelas imediatos`, async ({ page }) => {
    if (preference === 'system') await page.emulateMedia({ reducedMotion: 'reduce' });
    await setup(page, { appReduced: preference === 'app' });
    await page.goto('/reports');
    const chart = evolution(page);
    await chart.scrollIntoViewIfNeeded();
    await expect(chart).toHaveAttribute('data-motion-state', 'reduced');
    expect(await page.evaluate(() => (window as MotionWindow).chartMotions.length)).toBe(0);
    await expect(chart.locator('rect').first()).toHaveCSS('transform', 'none');
    await page.getByRole('button', { name: 'Ajuda desta página', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS('animation-name', 'none');
    await expect(dialog).toHaveCSS('transform', 'none');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Ajuda desta página', exact: true })).toBeFocused();
  });

  test(`ativar redução pelo ${preference} interrompe uma animação e restaura o gráfico inteiro`, async ({ page }) => {
    await setup(page, { pauseCharts: true });
    await page.goto('/reports');
    const chart = evolution(page);
    await chart.scrollIntoViewIfNeeded();
    await expect(chart).toHaveAttribute('data-motion-state', 'playing');
    if (preference === 'system') await page.emulateMedia({ reducedMotion: 'reduce' });
    else {
      await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
      await page.getByRole('button', { name: /Reduzir movimentos/ }).click();
      await page.keyboard.press('Escape');
    }
    await expect(chart).toHaveAttribute('data-motion-state', 'reduced');
    await expect(chart.locator('rect').first()).toHaveCSS('transform', 'none');
    expect(await page.evaluate(() => (window as MotionWindow).chartMotions.every(({ animation }) => animation.playState === 'idle'))).toBe(true);
    await expect(chart.locator('dl')).toContainText('R$ 3.200,55');
  });
}

test('barras de categorias e metas aparecem ao entrar na tela e ocultam os valores', async ({ page }, info) => {
  await setup(page, { pauseCharts: true });
  await page.goto('/categories?view=usage');
  const ranking = page.getByRole('region', { name: 'Onde você mais gastou', exact: true });
  await ranking.scrollIntoViewIfNeeded();
  await expect(ranking).toHaveAttribute('data-motion-state', 'playing');
  await expect(ranking.locator('[data-chart-motion="progress"]')).toHaveAttribute('style', /width: 100%/);
  await ranking.getByRole('button', { name: 'Por quantidade', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Despesas mais frequentes', exact: true })).toHaveAttribute('data-motion-state', 'playing');
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(page.locator('.category-usage-bar')).toHaveCount(0);
  await page.goto('/goals');
  await page.getByRole('button', { name: 'Mostrar valores', exact: true }).click();
  const progress = page.locator('[data-motion-state]').filter({ has: page.locator('[data-chart-motion="progress"]') }).first();
  await progress.scrollIntoViewIfNeeded();
  await expect(progress).toHaveAttribute('data-motion-state', 'playing');
  await expect(progress.locator('[data-chart-motion="progress"]')).toHaveCSS('width', /.+px/);
  await finishCharts(page);
  await expect(progress).toHaveAttribute('data-motion-state', 'finished');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: info.outputPath('metas-animadas-final.png'), fullPage: true });
});

for (const theme of ['light', 'dark'] as const) {
  test(`efeitos terminam sozinhos e preservam hover, foco e teclado no tema ${theme}`, async ({ page }, info) => {
    await setup(page);
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/reports');
    const chart = evolution(page);
    await chart.scrollIntoViewIfNeeded();
    await expect(chart).toHaveAttribute('data-motion-state', 'finished');
    await expect(chart.locator('rect').first()).toHaveCSS('transform', 'none');
    await page.getByRole('button', { name: 'Notificações', exact: true }).click();
    await expect(page.locator('#app-notifications')).toHaveCSS('animation-name', 'finance-popover-in');
    await page.getByRole('button', { name: 'Fechar notificações', exact: true }).click();
    await page.getByRole('button', { name: 'Ajuda desta página', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveCSS('animation-name', 'finance-panel-in');
    await expect.poll(() => dialog.evaluate((node) => node.getAnimations().length)).toBe(0);
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Ajuda desta página', exact: true })).toBeFocused();
    await page.goto('/categories');
    const card = page.getByRole('button', { name: 'Ver categorias de despesas', exact: true });
    await expect.poll(() => card.evaluate((node) => node.getAnimations().length)).toBe(0);
    await card.hover({ force: true });
    await expect(card).toHaveCSS('transform', info.project.name === 'desktop' ? 'matrix(1, 0, 0, 1, 0, -2)' : 'none');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.mouse.move(0, 0);
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
    await page.screenshot({ path: info.outputPath(`categorias-motion-${theme}.png`), fullPage: true });
  });
}
