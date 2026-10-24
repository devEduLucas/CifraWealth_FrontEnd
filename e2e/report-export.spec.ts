import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { DetailedReportResponse } from '../src/types/reports.types';

function reportFor(start: string, end: string): DetailedReportResponse {
  const transactions = Array.from({ length: 45 }, (_, index) => ({ id: index + 1, data: start, descricao: `Registro com café ${String(index).padStart(3, '0')}`, categoria: index % 2 ? 'Alimentação' : 'Salário', tipo: index % 2 ? 'despesa' as const : 'receita' as const, valor: index % 2 ? 25 : 100 }));
  const receitas = 2300, despesas = 550, saldo = 1750;
  const date = new Date(start.slice(0, 7) + '-01T00:00:00Z');
  const history: DetailedReportResponse['history'] = [];
  while (date.toISOString().slice(0, 7) <= end.slice(0, 7)) {
    const first = history.length === 0, id = date.toISOString().slice(0, 7);
    history.push({ id, periodo: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }), receitas: first ? receitas : 0, despesas: first ? despesas : 0, saldo: first ? saldo : 0, variacaoPercentual: null });
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return { dataInicio: start, dataFim: end, summary: { receitas, despesas, saldo, taxaEconomiaPercentual: 76.09, variacaoReceitas: null, variacaoDespesas: null, variacaoSaldo: null, variacaoTaxaEconomia: null }, history, evolution: history.map(item => ({ mes: item.periodo, receitas: item.receitas, despesas: item.despesas, saldo: item.saldo })), monthlyComparison: history.map(item => ({ mes: item.periodo, receitas: item.receitas, despesas: item.despesas })), categoryBreakdown: [{ id: 2, nome: 'Alimentação', total: despesas, percentual: 100, cor: '#2563eb' }], insights: [{ id: 'balance', tipo: 'positivo', mensagem: 'As receitas cobrem as despesas neste período.' }], goals: [{ id: 1, nome: 'Reserva de emergência', valorAtual: 7500, valorAlvo: 10000 }], transactions };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cifrawealth:token', 'pdf-interface-test');
    localStorage.setItem('cifrawealth:user', JSON.stringify({ id_usuario: 1, nome: 'Teste', sobrenome: 'Relatórios', email: 'pdf@example.com' }));
  });
  await page.route('**/api/reports/detailed?*', route => {
    const query = new URL(route.request().url()).searchParams;
    return route.fulfill({ status: 200, json: reportFor(query.get('data_inicio')!, query.get('data_fim')!) });
  });
});

async function downloadPdf(page: Page, start: string, end: string) {
  await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(`relatorio-${start}-a-${end}.pdf`);
  expect(await download.failure()).toBeNull();
  const bytes = await readFile((await download.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(bytes.length).toBeGreaterThan(15000);
  return download;
}

test('PDF respeita presets e datas aplicadas, preservando CSV e todos os registros', async ({ page }, testInfo) => {
  await page.goto('/reports');
  await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
  for (const period of ['3m', '6m', '12m']) {
    const response = page.waitForResponse(value => value.url().includes('/api/reports/detailed?') && value.status() === 200);
    await page.getByLabel('Selecionar período do relatório').selectOption(period);
    const report = await (await response).json() as DetailedReportResponse;
    await downloadPdf(page, report.dataInicio, report.dataFim);
  }
  await page.getByLabel('Selecionar período do relatório').selectOption('custom');
  await page.getByLabel('Data inicial', { exact: true }).fill('2026-10-05');
  await page.getByLabel('Data final', { exact: true }).fill('2026-10-25');
  await page.getByRole('button', { name: 'Aplicar datas' }).click();
  await expect(page.getByText('Período aplicado:', { exact: false })).toContainText('05/10/2026 a 25/10/2026');
  await page.getByLabel('Buscar descrição ou categoria').fill('Registro com café 044');
  await expect(page.getByText('1 transações · Página 1 de 1', { exact: true })).toBeVisible();
  const download = await downloadPdf(page, '2026-10-05', '2026-10-25');
  await download.saveAs(testInfo.outputPath('relatorio-periodo-personalizado.pdf'));
  const csvEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar planilha CSV' }).click();
  const csv = await csvEvent;
  expect(csv.suggestedFilename()).toBe('relatorio-2026-10-05-a-2026-10-25.csv');
  expect((await readFile((await csv.path())!, 'utf8'))).toContain('Registro com café 000');
  expect((await readFile((await csv.path())!, 'utf8'))).toContain('Registro com café 044');
});

test('falha ao carregar a fonte do PDF informa o erro e permite repetir sem perder o relatório', async ({ page }) => {
  let fail = true;
  await page.route('**/NotoSans-Regular.ttf*', route => {
    if (fail) { fail = false; return route.fulfill({ status: 503, body: 'Temporariamente indisponível' }); }
    return route.continue();
  });
  await page.goto('/reports');
  await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível gerar o PDF');
  await expect(page.getByRole('heading', { name: 'Transações detalhadas' })).toBeVisible();
  const filename = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click();
  expect((await filename).suggestedFilename()).toMatch(/\.pdf$/);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
});

test('privacidade oculta valores, gráficos e análises, persiste e preserva exportação completa', async ({ page }) => {
  await page.goto('/reports');
  await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  const main = page.locator('main');
  await expect(main).not.toContainText(/R\$\s*\d/);
  await expect(main).not.toContainText(/\d[\d,.]*%/);
  await expect(main).not.toContainText('As receitas cobrem as despesas');
  await expect(page.getByRole('img', { name: 'Evolução mensal de receitas, despesas e saldo' })).toHaveCount(0);
  await expect(main).toContainText('Os arquivos PDF e CSV incluem os valores completos.');
  await expect(page.getByRole('table', { name: 'Transações detalhadas' })).toContainText('Registro com café 000');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Mostrar valores', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
  await expect(main).not.toContainText(/R\$\s*\d/);
  await page.getByLabel('Buscar descrição ou categoria').fill('Registro com café 044');
  await expect(main).toContainText('1 transações · Página 1 de 1');
  const csvEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar planilha CSV' }).click();
  const csv = await csvEvent;
  const contents = await readFile((await csv.path())!, 'utf8');
  expect(contents).toContain('Registro com café 000');
  expect(contents).toContain('Registro com café 044');
  expect(contents).toContain('100,00');
  const pdfEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click();
  const pdf = await pdfEvent;
  expect((await readFile((await pdf.path())!)).subarray(0, 5).toString()).toBe('%PDF-');
  await expect(main).not.toContainText(/R\$\s*\d/);
  await page.getByRole('button', { name: 'Mostrar valores', exact: true }).click();
  await expect(main).toContainText('R$ 2.300,00');
  await expect(main).toContainText('76.09%');
  await expect(page.getByRole('img', { name: 'Evolução mensal de receitas, despesas e saldo' })).toBeVisible();
});
