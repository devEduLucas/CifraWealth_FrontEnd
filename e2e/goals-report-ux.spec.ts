import { test, expect, type Page } from '@playwright/test';
import type { GoalResponse } from '../src/lib/api';
import { REPORT_RESPONSES } from './fixtures/reportResponses';

const TODAY = '2026-10-25';
const user = { id_usuario: 909, nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.test', tem_senha: true };
const initialGoals: GoalResponse[] = ['Reserva de emergência', 'Viagem de férias', 'Notebook novo', 'Curso de inglês', 'Casa nova', 'Celular'].map((titulo, index) => ({
  id_meta: index + 1, titulo, descricao: 'Meu plano para ' + titulo.toLowerCase(), valor_atual: index === 5 ? 2000 : 500,
  valor_objetivo: 2000, status: index === 4 ? 'cancelada' : index === 5 ? 'concluida' : 'em_andamento',
  data_inicio: '2026-01-01', data_fim: '2027-12-31',
}));
async function setup(page: Page) {
  let goals = structuredClone(initialGoals);
  await page.clock.setFixedTime(new Date(TODAY + 'T15:00:00Z'));
  await page.addInitScript((user) => {
    localStorage.setItem('cifrawealth:token', 'goals-report-browser-fixture');
    localStorage.setItem('cifrawealth:user', JSON.stringify(user));
  }, user);
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api', '');
    const method = route.request().method();
    const respond = (body: unknown, status = 200) => route.fulfill({ json: body, status });
    if (path === '/users/me') return respond(user);
    if (path === '/goals' && method === 'POST') {
      const input = route.request().postDataJSON();
      const created: GoalResponse = { id_meta: 7, descricao: null, data_inicio: TODAY, data_fim: null, valor_atual: 0, status: 'em_andamento', ...input };
      goals = [created, ...goals]; return respond(created, 201);
    }
    if (path === '/goals') return respond(goals);
    const match = path.match(/^\/goals\/(\d+)(?:\/(contribute|withdraw))?$/);
    if (match) {
      const index = goals.findIndex((item) => item.id_meta === Number(match[1]));
      if (index === -1) return respond({ message: 'Meta não encontrada.' }, 404);
      if (method === 'DELETE') { goals.splice(index, 1); return respond({}); }
      const input = route.request().postDataJSON();
      if (match[2] === 'contribute') goals[index].valor_atual += input.valor;
      else if (match[2] === 'withdraw') goals[index].valor_atual -= input.valor;
      else goals[index] = { ...goals[index], ...input };
      if (goals[index].status !== 'cancelada') goals[index].status = goals[index].valor_atual >= goals[index].valor_objetivo ? 'concluida' : 'em_andamento';
      return respond(goals[index]);
    }
    if (path === '/reports/detailed') {
      const period = url.searchParams.get('data_inicio') + '|' + url.searchParams.get('data_fim');
      const fixture = REPORT_RESPONSES[period];
      if (!fixture) throw new Error('Período sem resposta de teste: ' + period);
      return respond({ ...structuredClone(fixture), goals: goals.map((goal) => ({ id: goal.id_meta, nome: goal.titulo, valorAtual: goal.valor_atual, valorAlvo: goal.valor_objetivo })) });
    }
    return respond([]);
  });
}

test('relatório compara um mês em barras e preserva receitas, despesas e saldo com centavos', async ({ page }, info) => {
  await setup(page);
  await page.goto('/reports');
  const chart = page.getByRole('region', { name: 'Receitas, despesas e saldo', exact: true });
  await expect(chart.getByText(/Um mês selecionado/)).toBeVisible();
  await expect(chart.locator('svg[role="img"] rect')).toHaveCount(3);
  await expect(chart.locator('dl').getByText('R$ 3.200,55', { exact: true })).toBeVisible();
  await expect(chart.locator('dl').getByText('R$ 800,25', { exact: true })).toBeVisible();
  await expect(chart.locator('dl').getByText('R$ 2.400,30', { exact: true })).toBeVisible();
  await chart.getByText('Ver valores do gráfico', { exact: true }).click();
  const table = chart.getByRole('table', { name: 'Valores mensais no período selecionado', exact: true });
  await expect(table.getByRole('row')).toHaveCount(2);
  await expect(table.getByRole('cell')).toHaveText(['R$ 3.200,55', 'R$ 800,25', 'R$ 2.400,30']);
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: info.outputPath('relatorio-mensal.png'), fullPage: true });
});

test('gráfico de vários meses representa os valores do contrato da API e aceita saldo negativo', async ({ page }, info) => {
  await setup(page);
  await page.goto('/reports');
  await page.getByLabel('Selecionar período do relatório').selectOption('3m');
  const chart = page.getByRole('region', { name: 'Receitas, despesas e saldo', exact: true });
  const svg = chart.locator('svg[role="img"]');
  await expect(svg.locator('polyline')).toHaveCount(3);
  await expect(svg.locator('circle')).toHaveCount(9);
  await chart.getByText('Ver valores do gráfico', { exact: true }).click();
  const rows = chart.getByRole('table').getByRole('row');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(1).getByRole('cell')).toHaveText(['R$ 0,00', 'R$ 0,00', 'R$ 0,00']);
  await expect(rows.nth(2).getByRole('cell')).toHaveText(['R$ 1.200,10', 'R$ 1.400,10', '-R$ 200,00']);
  await expect(rows.nth(3).getByRole('cell')).toHaveText(['R$ 3.200,55', 'R$ 800,25', 'R$ 2.400,30']);
  const points = (await svg.locator('[data-series="saldo"] polyline').getAttribute('points'))!.split(' ').map((point) => point.split(',').map(Number));
  expect(points[0][0]).toBeLessThan(points[1][0]);
  expect(points[1][0]).toBeLessThan(points[2][0]);
  expect(points[1][1]).toBeGreaterThan(points[0][1]);
  expect(points[2][1]).toBeLessThan(points[0][1]);
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: info.outputPath('relatorio-tres-meses.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(chart).toHaveCount(0);
  await expect(page.getByRole('main')).not.toContainText(/3\.200,55|800,25|2\.400,30/);
});

test('período personalizado representa barra de saldo negativo e mês vazio sem NaN', async ({ page }) => {
  await setup(page);
  await page.goto('/reports');
  await page.getByLabel('Selecionar período do relatório').selectOption('custom');
  await page.getByLabel('Data inicial', { exact: true }).fill('2026-09-01');
  await page.getByLabel('Data final', { exact: true }).fill('2026-09-30');
  await page.getByRole('button', { name: 'Aplicar datas', exact: true }).click();
  const chart = page.getByRole('region', { name: 'Receitas, despesas e saldo', exact: true });
  await expect(chart.locator('dl').getByText('-R$ 200,00', { exact: true })).toBeVisible();
  const svg = chart.locator('svg[role="img"]');
  const zeroY = Number(await svg.locator(':scope > line').getAttribute('y1'));
  const negative = svg.locator('[data-series="saldo"] rect');
  expect(Number(await negative.getAttribute('y'))).toBeCloseTo(zeroY);
  expect(Number(await negative.getAttribute('height'))).toBeGreaterThan(0);
  await page.getByLabel('Data inicial', { exact: true }).fill('2025-01-01');
  await page.getByLabel('Data final', { exact: true }).fill('2025-01-31');
  await page.getByRole('button', { name: 'Aplicar datas', exact: true }).click();
  await expect(chart.getByText('Sem movimentações confirmadas no período.', { exact: true })).toBeVisible();
  await expect(chart).not.toContainText('NaN');
});

test('coleção horizontal abre página própria, mantém cabeçalho e permite voltar', async ({ page }, info) => {
  await setup(page);
  await page.goto('/goals');
  const track = page.getByRole('list', { name: 'Suas metas', exact: true });
  await expect(track.getByRole('listitem')).toHaveCount(6);
  await page.getByRole('button', { name: 'Próximas metas', exact: true }).click();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await track.focus(); await page.keyboard.press('Home');
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: info.outputPath('colecao-metas.png'), fullPage: true });
  await page.getByRole('link', { name: 'Ver meta Reserva de emergência', exact: true }).click();
  await expect(page).toHaveURL(/\/goals\/1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reserva de emergência');
  await expect(page.getByRole('banner', { name: 'Cabeçalho principal' })).toBeVisible();
  const navigation = info.project.name === 'mobile' ? page.getByRole('navigation', { name: 'Menu móvel' }) : page.getByRole('complementary', { name: 'Menu lateral' });
  await expect(navigation.getByRole('link', { name: 'Metas', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('01 de janeiro de 2026', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reserva de emergência');
  await page.screenshot({ path: info.outputPath('pagina-meta.png'), fullPage: true });
  await page.getByRole('link', { name: 'Todas as metas', exact: true }).click();
  await expect(track).toBeVisible();
});

test('guardar, corrigir, retirar e excluir mantêm contexto na página da meta', async ({ page }) => {
  await setup(page);
  await page.goto('/goals/1?guardar=1');
  let dialog = page.getByRole('dialog', { name: 'Adicionar valor guardado', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Valor deste aporte').fill('250,50');
  await dialog.getByRole('button', { name: 'Registrar valor', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('R$ 750,50', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('R$ 750,50', { exact: true })).toBeVisible();
  await page.getByText('Gerenciar esta meta', { exact: true }).click();
  await page.getByRole('button', { name: 'Ajustar ou retirar valor guardado', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Ajustar valor guardado', exact: true });
  await dialog.getByLabel('Total correto guardado').fill('800,00');
  await dialog.getByRole('button', { name: 'Salvar ajuste', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('R$ 800,00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ajustar ou retirar valor guardado', exact: true }).click();
  await dialog.getByLabel('Operação').selectOption('withdraw');
  await dialog.getByLabel('Valor da retirada').fill('100,00');
  await dialog.getByRole('button', { name: 'Salvar ajuste', exact: true }).click();
  await expect(page.getByText('R$ 700,00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir meta', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Excluir meta', exact: true });
  await confirmation.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page).toHaveURL(/\/goals\/1$/);
  await page.getByRole('button', { name: 'Excluir meta', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
  await expect(page.getByRole('link', { name: 'Ver meta Reserva de emergência', exact: true })).toHaveCount(0);
  await page.goto('/goals/1');
  await expect(page.getByRole('heading', { name: 'Meta não encontrada', exact: true })).toBeVisible();
});

test('criar uma meta abre seu planejamento e links antigos continuam válidos', async ({ page }) => {
  await setup(page);
  await page.goto('/goals?new=1');
  const dialog = page.getByRole('dialog', { name: 'Nova Meta', exact: true });
  await dialog.getByLabel('Nome da meta').fill('Meu novo objetivo');
  await dialog.getByLabel('Valor objetivo').fill('1000,00');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page).toHaveURL(/\/goals\/7$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meu novo objetivo');
  await page.goto('/goals?detail=2');
  await expect(page).toHaveURL(/\/goals\/2$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Viagem de férias');
  await page.goto('/goals?contribute=2');
  await expect(page.getByRole('dialog', { name: 'Adicionar valor guardado', exact: true })).toBeVisible();
});

test('perfil restaura miniaturas claro, escuro e automático mantendo preferência', async ({ page }, info) => {
  await setup(page);
  await page.goto('/profile');
  const appearance = page.getByRole('group', { name: 'Aparência', exact: true });
  const automatic = appearance.getByRole('button', { name: /^Automático/ });
  const dark = appearance.getByRole('button', { name: /^Escuro/ });
  const light = appearance.getByRole('button', { name: /^Claro/ });
  await expect(automatic.locator('span[aria-hidden="true"]').first()).toHaveCSS('background-image', /linear-gradient/);
  await expect(light.locator('span[aria-hidden="true"]').first()).toHaveCSS('background-color', 'rgb(245, 248, 252)');
  await expect(dark.locator('span[aria-hidden="true"]').first()).toHaveCSS('background-color', 'rgb(17, 29, 48)');
  await dark.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await appearance.screenshot({ path: info.outputPath('previas-temas.png') });
  await automatic.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system');
});
