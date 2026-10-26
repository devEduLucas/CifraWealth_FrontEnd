import { test, expect, type Page } from '@playwright/test';
import type { TransactionResponse, GoalResponse } from '../src/lib/api';

const TODAY = '2026-10-25';
const user = { id_usuario: 999999, nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.test', tem_senha: true, acesso_google: false };
const categories = [
  { id_categoria: 1, nome: 'Salário', tipo: 'receita', cor: '#10b981', icone: 'briefcase' },
  { id_categoria: 2, nome: 'Moradia', tipo: 'despesa', cor: '#ef4444', icone: 'home' },
];
const history: TransactionResponse[] = [
  { id_transacao: 1, id_categoria: 1, descricao: 'Salário de outubro', valor: 4000, tipo: 'receita', status: 'confirmada', data_transacao: '2026-10-05' },
  { id_transacao: 2, id_categoria: 2, descricao: 'Aluguel de outubro', valor: 1000, tipo: 'despesa', status: 'confirmada', data_transacao: '2026-10-10' },
  { id_transacao: 3, id_categoria: 2, descricao: 'Conta a conferir', valor: 150, tipo: 'despesa', status: 'pendente', data_transacao: '2026-10-24' },
  { id_transacao: 4, id_categoria: 1, descricao: 'Próximo salário', valor: 4000, tipo: 'receita', status: 'pendente', data_transacao: '2026-11-05' },
  { id_transacao: 5, id_categoria: 1, descricao: 'Salário de setembro', valor: 4000, tipo: 'receita', status: 'confirmada', data_transacao: '2026-09-05' },
  { id_transacao: 6, id_categoria: 2, descricao: 'Aluguel de setembro', valor: 2000, tipo: 'despesa', status: 'confirmada', data_transacao: '2026-09-10' },
  { id_transacao: 7, id_categoria: 2, descricao: 'Reparo no fim do mês', valor: 1000, tipo: 'despesa', status: 'confirmada', data_transacao: '2026-09-30' },
];
const goal: GoalResponse = { id_meta: 1, titulo: 'Reserva para imprevistos', descricao: 'Meu plano', valor_atual: 200, valor_objetivo: 1000, status: 'em_andamento', data_inicio: '2026-01-01', data_fim: '2026-10-24' };
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(browserErrors.get(page)).toEqual([]));

async function mockApp(page: Page, items = history, loggedIn = true, goalItems: GoalResponse[] = [goal]) {
  const transactions = structuredClone(items);
  let goals = structuredClone(goalItems);
  await page.clock.setFixedTime(new Date(TODAY + 'T15:00:00Z'));
  await page.addInitScript(({ user, loggedIn }) => {
    if (loggedIn) {
      localStorage.setItem('cifrawealth:token', 'isolated-ux-fixture');
      localStorage.setItem('cifrawealth:user', JSON.stringify(user));
    }
  }, { user, loggedIn });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api', '');
    const method = route.request().method();
    const totals = (list: TransactionResponse[], end = TODAY) => {
      const actual = list.filter((item) => item.status === 'confirmada' && item.data_transacao <= end);
      const income = actual.filter((item) => item.tipo === 'receita').reduce((sum, item) => sum + item.valor, 0);
      const expense = actual.filter((item) => item.tipo === 'despesa').reduce((sum, item) => sum + item.valor, 0);
      return { saldo: income - expense, total_receitas: income, total_despesas: expense, por_categoria: [] };
    };
    let body: unknown;
    if (path === '/users/me') body = user;
    else if (path === '/categories') body = categories;
    else if (path === '/dashboard') body = totals(transactions);
    else if (path === '/transactions' && method === 'POST') {
      const item = { ...route.request().postDataJSON(), id_transacao: 100, status: 'confirmada' };
      transactions.push(item); body = item;
    } else if (path === '/transactions') {
      let list = transactions.filter((item) => (!url.searchParams.get('status') || item.status === url.searchParams.get('status')) && (!url.searchParams.get('data_fim') || item.data_transacao <= url.searchParams.get('data_fim')!));
      list = [...list].sort((a, b) => b.data_transacao.localeCompare(a.data_transacao));
      body = url.searchParams.has('limit') ? list.slice(0, Number(url.searchParams.get('limit'))) : list;
    } else if (path === '/reports/monthly') body = Array.from({ length: 12 }, (_, index) => {
      const mes = `${url.searchParams.get('ano')}-${String(index + 1).padStart(2, '0')}`;
      return { mes, ...totals(transactions.filter((item) => item.data_transacao.startsWith(mes)), url.searchParams.get('data_fim') ?? TODAY) };
    });
    else if (path === '/reports/detailed') {
      const start = url.searchParams.get('data_inicio')!;
      const end = url.searchParams.get('data_fim')!;
      const list = transactions.filter((item) => item.status === 'confirmada' && item.data_transacao >= start && item.data_transacao <= end && item.data_transacao <= TODAY);
      const total = totals(list);
      body = {
        dataInicio: start, dataFim: end,
        summary: { receitas: total.total_receitas, despesas: total.total_despesas, saldo: total.saldo, taxaEconomiaPercentual: 75, variacaoReceitas: null, variacaoDespesas: null, variacaoSaldo: null, variacaoTaxaEconomia: null },
        evolution: [{ mes: '2026-10', receitas: total.total_receitas, despesas: total.total_despesas, saldo: total.saldo }],
        categoryBreakdown: total.total_despesas ? [{ id: 2, nome: 'Moradia', total: total.total_despesas, percentual: 100, cor: '#ef4444' }] : [],
        monthlyComparison: [{ mes: '2026-10', receitas: total.total_receitas, despesas: total.total_despesas }],
        insights: [], goals: goals.map((item) => ({ id: item.id_meta, nome: item.titulo, valorAtual: item.valor_atual, valorAlvo: item.valor_objetivo })),
        history: [{ id: '2026-10', periodo: 'Outubro de 2026', receitas: total.total_receitas, despesas: total.total_despesas, saldo: total.saldo, variacaoPercentual: null }],
        transactions: list.map((item) => ({ id: item.id_transacao, data: item.data_transacao, descricao: item.descricao, categoria: categories.find((category) => category.id_categoria === item.id_categoria)!.nome, tipo: item.tipo, valor: item.valor })),
      };
    } else if (path === '/goals') body = goals;
    else if (path === '/goals/1/contribute') {
      goals = goals.map((item) => ({ ...item, valor_atual: item.valor_atual + route.request().postDataJSON().valor }));
      body = goals[0];
    } else if (path === '/users/register') body = { email: route.request().postDataJSON().email, message: 'Confira seu e-mail.' };
    else if (path === '/users/verify-email') body = { message: 'E-mail confirmado. Você já pode entrar.' };
    else if (path === '/users/resend-verification') body = { message: 'Se houver cadastro pendente, uma mensagem será enviada.' };
    else if (path === '/auth/forgot-password') body = { message: 'Se a conta existir, as instruções serão enviadas.' };
    else if (path === '/auth/reset-password') body = { message: 'Senha alterada com sucesso.' };
    else return route.fulfill({ status: 404, json: { message: 'Rota não esperada no teste: ' + path } });
    return route.fulfill({ json: body });
  });
}

test('saldo vem antes dos atalhos, comparação usa dias equivalentes e privacidade cobre o resumo', async ({ page }, info) => {
  await mockApp(page);
  await page.goto('/dashboard');
  const balance = page.getByRole('region', { name: 'Saldo acumulado dos registros', exact: true });
  await expect(balance).toBeVisible();
  const action = page.getByRole('link', { name: 'Registrar receita', exact: true });
  expect((await balance.boundingBox())!.y).toBeLessThan((await action.boundingBox())!.y);
  await expect(page.getByText(/50% menos/)).toHaveClass(/text-positive/);
  await expect(page.getByRole('heading', { name: /^outubro de 2026$/i })).toBeVisible();
  await page.screenshot({ path: info.outputPath('visao-geral.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(balance.getByLabel('Saldo oculto')).toBeVisible();
  await expect(page.getByText(/50% menos/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Gráfico oculto' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText('4.000,00');
});

test('metas mantêm 29% e 58% no dashboard, coleção, página individual e relatórios', async ({ page }) => {
  await mockApp(page, history, true, [
    { ...goal, id_meta: 1, titulo: 'Meta de vinte e nove', valor_atual: 29, valor_objetivo: 100 },
    { ...goal, id_meta: 2, titulo: 'Meta de cinquenta e oito', valor_atual: 58, valor_objetivo: 100 },
  ]);
  await page.goto('/dashboard');
  const dashboardGoals = page.getByRole('region', { name: /Suas metas/ });
  await expect(dashboardGoals.getByText('29%', { exact: true })).toBeVisible();
  await expect(dashboardGoals.getByText('58%', { exact: true })).toBeVisible();
  await page.goto('/goals');
  await expect(page.getByText('29% do objetivo', { exact: true })).toBeVisible();
  await expect(page.getByText('58% do objetivo', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ver meta Meta de vinte e nove', exact: true }).click();
  await expect(page.getByText('29%', { exact: true })).toBeVisible();
  await page.goto('/goals/2');
  await expect(page.getByText('58%', { exact: true })).toBeVisible();
  await page.goto('/reports');
  await page.getByRole('button', { name: 'Detalhamento', exact: true }).click();
  await page.getByText('Metas — situação atual, independente do período', { exact: true }).click();
  await expect(page.getByText('29%', { exact: true })).toBeVisible();
  await expect(page.getByText('58%', { exact: true })).toBeVisible();
});

test('primeiro uso guia o registro, mas saldo zero e pendências preservam a visão diária', async ({ page }) => {
  await mockApp(page, []);
  await page.goto('/dashboard');
  await expect(page.getByRole('link', { name: 'Registrar primeira movimentação', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Saldo acumulado dos registros', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Registrar primeira movimentação', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Nova Transação', exact: true })).toBeVisible();
});

for (const [name, items] of [
  ['saldo zero com histórico', [history[0], { ...history[1], valor: 4000 }]],
  ['apenas uma pendência', [history[2]]], ['apenas um registro futuro', [history[3]]],
] as const) test(`não trata ${name} como primeiro acesso`, async ({ page }) => {
  await mockApp(page, [...items]);
  await page.goto('/dashboard');
  await expect(page.getByRole('region', { name: 'Saldo acumulado dos registros', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Registrar primeira movimentação', exact: true })).toHaveCount(0);
});

test('ações de filtro ficam visíveis, rascunho só aplica ao confirmar e densidade persiste', async ({ page }, info) => {
  await mockApp(page);
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Filtrar transações', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Filtrar transações', exact: true });
  await expect(modal.getByRole('button', { name: 'Aplicar filtros', exact: true })).toBeInViewport();
  await expect(modal.getByRole('button', { name: 'Cancelar', exact: true })).toBeInViewport();
  await modal.getByLabel('Filtrar tipo', { exact: true }).selectOption('despesa');
  await modal.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.locator('.transaction-entry').filter({ hasText: 'Salário de outubro' })).toBeVisible();
  await page.getByRole('button', { name: 'Filtrar transações', exact: true }).click();
  await modal.getByLabel('Filtrar tipo', { exact: true }).selectOption('despesa');
  await modal.getByRole('button', { name: 'Aplicar filtros', exact: true }).click();
  await expect(page.locator('.transaction-entry').filter({ hasText: 'Salário de outubro' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Detalhada', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Detalhada', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Compacta', exact: true }).click();
  await page.screenshot({ path: info.outputPath('transacoes.png'), fullPage: true });
});

test('notificações abrem detalhes sem aporte e pendências já filtradas; ajuda mantém contexto', async ({ page }) => {
  await mockApp(page);
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Notificações', exact: true }).click();
  await page.getByRole('region', { name: 'Notificações', exact: true }).getByRole('link', { name: /Reserva para imprevistos/ }).click();
  await expect(page).toHaveURL(/\/goals\/1$/);
  await expect(page.getByRole('heading', { name: goal.titulo, exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Adicionar valor guardado', exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Notificações', exact: true }).click();
  await page.getByRole('link', { name: /1 transação pendente/ }).click();
  await expect(page).toHaveURL(/situacao=pendente/);
  await expect(page.locator('.transaction-entry')).toHaveCount(1);
  await expect(page.locator('.transaction-entry')).toContainText('Conta a conferir');
  const help = page.getByRole('button', { name: 'Ajuda desta página', exact: true });
  await help.click();
  const dialog = page.getByRole('dialog', { name: 'Registre e encontre suas movimentações', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Sobre o projeto/ })).toHaveAttribute('target', '_blank');
  await page.keyboard.press('Escape');
  await expect(help).toBeFocused();
});

test('categorias gerenciam separadamente, metas alternam apresentação e relatório mantém exportação completa', async ({ page }, info) => {
  await mockApp(page);
  await page.goto('/categories?view=manage');
  await expect(page.getByRole('button', { name: 'Minhas categorias', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: /Suas categorias de despesa/ })).toBeVisible();
  await page.getByLabel('Tipo das categorias', { exact: true }).selectOption('receita');
  await expect(page.getByRole('heading', { name: /Suas categorias de receita/ })).toBeVisible();
  await page.getByRole('button', { name: 'Análise', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Suas categorias de despesa/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'De onde vieram suas receitas', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Alterar período das categorias', exact: true }).click();
  const period = page.getByRole('dialog', { name: 'Período das categorias', exact: true });
  await period.getByRole('button', { name: 'Todo o período', exact: true }).click();
  await period.getByRole('button', { name: 'Aplicar período', exact: true }).click();
  await expect(page.getByText(/Todo o período · Somente transações/)).toBeVisible();
  await page.getByLabel('Tipo das categorias', { exact: true }).selectOption('despesa');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('categorias-controles.png'), fullPage: true });
  await page.goto('/goals');
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tabela', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await page.goto('/reports');
  await expect(page.getByLabel('Selecionar período do relatório')).toHaveValue('month');
  await expect(page.getByText(/Período aplicado: 01\/10\/2026 a 25\/10\/2026/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Transações detalhadas', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Detalhamento', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Transações detalhadas', exact: true })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(await download.failure()).toBeNull();
  await page.screenshot({ path: info.outputPath('relatorio.png'), fullPage: true });
});

test('recuperar e redefinir senha são tarefas visíveis na primeira tela', async ({ page }, info) => {
  await mockApp(page, [], false);
  await page.goto('/forgot-password');
  await expect(page.getByLabel('E-mail', { exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Enviar e-mail', exact: true })).toBeInViewport();
  await page.screenshot({ path: info.outputPath('recuperar-acesso.png'), fullPage: true });
  await page.goto('/reset-password?token=example-test-link');
  await expect(page.getByLabel('Nova senha', { exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Salvar nova senha', exact: true })).toBeInViewport();
  await expect(page.locator('main')).not.toContainText('VISA');
});

test('cadastro explica confirmação, permite corrigir email e confirmação esconde recuperação secundária', async ({ page }) => {
  await mockApp(page, [], false);
  await page.goto('/register');
  await page.getByLabel('Nome completo', { exact: true }).fill('Ana Silva');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('TesteLocal!2026');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('TesteLocal!2026');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Já confirmei — entrar', exact: true })).toBeVisible();
  await expect(page.getByText(/informe a senha que acabou de criar/)).toBeVisible();
  await page.getByRole('button', { name: 'Corrigir endereço de e-mail', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('ana@example.test');
  await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('');
  await page.goto('/verify-email?token=example-test-link');
  await expect(page.getByLabel('E-mail usado no cadastro', { exact: true })).not.toBeVisible();
  await page.getByText('Problemas com o link?', { exact: true }).click();
  await expect(page.getByLabel('E-mail usado no cadastro', { exact: true })).toBeVisible();
});

test('perfil, guia e landing mantêm destinos claros e não apresentam rolagem horizontal', async ({ page }, info) => {
  await mockApp(page);
  for (const path of ['/profile', '/help?section=profile', '/home']) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(path.includes('profile') && !path.includes('help') ? 'perfil.png' : path.includes('help') ? 'guia.png' : 'landing.png'), fullPage: true });
  }
});

test('primeiro lançamento e registro em meta atualizam a interface sem etapas obrigatórias extras', async ({ page }) => {
  await mockApp(page, []);
  await page.goto('/dashboard');
  await page.getByRole('link', { name: 'Registrar primeira movimentação', exact: true }).click();
  const transaction = page.getByRole('dialog', { name: 'Nova Transação', exact: true });
  await transaction.getByLabel('Descrição', { exact: true }).fill('Meu primeiro registro');
  await transaction.getByLabel('Valor', { exact: true }).fill('50,00');
  await transaction.getByLabel('Categoria', { exact: true }).selectOption('2');
  await transaction.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(transaction).not.toBeVisible();
  await page.getByRole('navigation', { name: /Menu (principal|móvel)/ }).getByRole('link', { name: 'Visão geral', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Saldo acumulado dos registros', exact: true })).toContainText('50,00');
  await expect(page.getByRole('link', { name: 'Registrar primeira movimentação', exact: true })).toHaveCount(0);
  await page.goto('/goals?detail=1');
  await page.getByRole('button', { name: 'Guardar valor', exact: true }).click();
  const contribution = page.getByRole('dialog', { name: 'Adicionar valor guardado', exact: true });
  await contribution.getByLabel('Valor deste aporte', { exact: true }).fill('50,00');
  await contribution.getByRole('button', { name: 'Registrar valor', exact: true }).click();
  await expect(contribution).not.toBeVisible();
  await expect(page.getByText(/R\$\s*250,00/).first()).toBeVisible();
});

test('tema escuro e texto ampliado preservam ações dos filtros e navegação por teclado', async ({ page }, info) => {
  await mockApp(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/transactions');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
  const settings = page.getByRole('dialog', { name: 'Acessibilidade', exact: true });
  await settings.getByRole('button', { name: 'Maior', exact: true }).click();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Filtrar transações', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Filtrar transações', exact: true });
  await expect(modal.getByRole('button', { name: 'Aplicar filtros', exact: true })).toBeInViewport();
  await page.keyboard.press('Shift+Tab');
  await expect(modal.getByRole('button', { name: 'Aplicar filtros', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(modal.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused();
  await page.screenshot({ path: info.outputPath('filtros-escuro-texto-ampliado.png') });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Filtrar transações', exact: true })).toBeFocused();
});
