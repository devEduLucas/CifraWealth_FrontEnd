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
  let transactions = structuredClone(items);
  let categoryItems = structuredClone(categories);
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
    else if (path === '/categories' && method === 'POST') {
      const category = { ...route.request().postDataJSON(), id_categoria: Math.max(0, ...categoryItems.map((item) => item.id_categoria)) + 1 };
      categoryItems.push(category); body = category;
    } else if (/^\/categories\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      if (method === 'DELETE') {
        if (transactions.some((item) => item.id_categoria === id)) return route.fulfill({ status: 409, json: { message: 'Categoria possui transações vinculadas.' } });
        categoryItems = categoryItems.filter((item) => item.id_categoria !== id); body = { message: 'Categoria excluída.' };
      } else { categoryItems = categoryItems.map((item) => item.id_categoria === id ? { ...item, ...route.request().postDataJSON() } : item); body = categoryItems.find((item) => item.id_categoria === id); }
    } else if (path === '/categories') body = categoryItems;
    else if (path === '/dashboard') body = totals(transactions);
    else if (path === '/transactions' && method === 'POST') {
      const item = { ...route.request().postDataJSON(), id_transacao: 100, status: 'confirmada' };
      transactions.push(item); body = item;
    } else if (/^\/transactions\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      if (method === 'DELETE') { transactions = transactions.filter((item) => item.id_transacao !== id); body = { message: 'Transação excluída.' }; }
      else { transactions = transactions.map((item) => item.id_transacao === id ? { ...item, ...route.request().postDataJSON() } : item); body = transactions.find((item) => item.id_transacao === id); }
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
        summary: { receitas: total.total_receitas, despesas: total.total_despesas, saldo: total.saldo, taxaEconomiaPercentual: total.total_receitas > 0 ? Math.round(total.saldo / total.total_receitas * 10000) / 100 : 0, variacaoReceitas: null, variacaoDespesas: null, variacaoSaldo: null, variacaoTaxaEconomia: null },
        evolution: [{ mes: '2026-10', receitas: total.total_receitas, despesas: total.total_despesas, saldo: total.saldo }],
        categoryBreakdown: total.total_despesas ? [{ id: 2, nome: 'Moradia', total: total.total_despesas, percentual: 100, cor: '#ef4444' }] : [],
        monthlyComparison: [{ mes: '2026-10', receitas: total.total_receitas, despesas: total.total_despesas }],
        insights: list.length ? [{ id: 'flow', tipo: total.saldo >= 0 ? 'positivo' : 'negativo', mensagem: total.saldo >= 0 ? 'As receitas cobrem as despesas neste período.' : 'As despesas superam as receitas neste período.' }] : [], goals: goals.map((item) => ({ id: item.id_meta, nome: item.titulo, valorAtual: item.valor_atual, valorAlvo: item.valor_objetivo })),
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
  await page.getByRole('button', { name: 'Ver categorias de despesas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Categorias de despesa', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Todas as categorias', exact: true }).click();
  await page.getByRole('button', { name: 'Ver categorias de receitas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Categorias de receita', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Análise', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Receitas x despesas', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'De onde vieram suas receitas', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Alterar período das categorias', exact: true }).click();
  const period = page.getByRole('dialog', { name: 'Período das categorias', exact: true });
  await period.getByRole('button', { name: 'Todo o período', exact: true }).click();
  await period.getByRole('button', { name: 'Aplicar período', exact: true }).click();
  await expect(page.getByText('Todo o período', { exact: true })).toBeVisible();
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

test('categorias começam pelas coleções, preservam o tipo na recarga e permitem voltar', async ({ page }, info) => {
  await mockApp(page);
  await page.goto('/categories');
  const navigation = page.getByRole('group', { name: 'Visualização das categorias' });
  await expect(navigation.getByRole('button').first()).toHaveText('Minhas categorias');
  await expect(navigation.getByRole('button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Ver categorias de despesas', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver categorias de receitas', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Tipo das categorias' })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('categorias-entrada.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ver categorias de receitas', exact: true }).click();
  await expect(page).toHaveURL(/tipo=receita/);
  const list = page.getByRole('list', { name: 'Lista de categorias' });
  await expect(list.getByRole('listitem')).toHaveCount(1);
  await expect(list).toContainText('Salário');
  await expect(list).not.toContainText('Moradia');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Categorias de receita', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Todas as categorias', exact: true }).click();
  await page.getByRole('button', { name: 'Ver categorias de despesas', exact: true }).click();
  await expect(list).toContainText('Moradia');
  await page.goBack();
  await expect(page.getByRole('region', { name: 'Escolha suas categorias' })).toBeVisible();
});

test('comparação de categorias inclui os dois rankings, exclui pendências e protege valores', async ({ page }) => {
  await mockApp(page);
  await page.goto('/categories?view=usage');
  const analysis = page.getByRole('region', { name: 'Análise das categorias' });
  await expect(analysis.getByRole('heading', { name: 'Receitas x despesas', exact: true })).toBeVisible();
  await expect(analysis).toContainText('4.000,00');
  await expect(analysis).toContainText('1.000,00');
  await expect(analysis).toContainText('3.000,00');
  await expect(analysis).not.toContainText('150,00');
  await expect(page.getByTestId('category-ranking')).toHaveCount(2);
  const ids = await page.locator('[id]').evaluateAll((items) => items.map((item) => item.id));
  expect(new Set(ids).size).toBe(ids.length);
  await page.getByLabel('Tipo das categorias', { exact: true }).selectOption('despesa');
  await expect(page.getByTestId('category-ranking')).toHaveCount(1);
  await page.getByRole('button', { name: 'Por quantidade', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Despesas mais frequentes', exact: true })).toBeVisible();
  await page.getByLabel('Tipo das categorias', { exact: true }).selectOption('all');
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(analysis).not.toContainText(/4\.000,00|1\.000,00|3\.000,00|\d+%/);
  await expect(page.getByTestId('category-ranking')).toHaveCount(0);
  expect(await analysis.locator('[aria-hidden="true"] [style*="width"]').count()).toBe(0);
});

test('categorias criam e editam no tipo escolhido e mantêm a proteção de exclusão', async ({ page }) => {
  await mockApp(page);
  await page.goto('/categories?view=manage&tipo=receita');
  await page.getByRole('button', { name: 'Nova Categoria', exact: true }).click();
  let form = page.getByRole('dialog', { name: 'Nova Categoria', exact: true });
  await expect(form.getByLabel('Tipo', { exact: true })).toHaveValue('receita');
  await form.getByLabel('Nome da categoria', { exact: true }).fill('Projetos');
  await form.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(form).not.toBeVisible();
  await page.getByRole('button', { name: 'Editar categoria Projetos', exact: true }).click();
  form = page.getByRole('dialog', { name: 'Editar Categoria', exact: true });
  await form.getByLabel('Nome da categoria', { exact: true }).fill('Projetos pessoais');
  await form.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByRole('button', { name: 'Excluir categoria Projetos pessoais', exact: true }).click();
  let deletion = page.getByRole('dialog', { name: 'Excluir categoria', exact: true });
  await deletion.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Lista de categorias' })).not.toContainText('Projetos pessoais');
  await page.getByRole('button', { name: 'Excluir categoria Salário', exact: true }).click();
  deletion = page.getByRole('dialog', { name: 'Excluir categoria', exact: true });
  await deletion.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(deletion.getByRole('alert')).toContainText('vinculadas');
  await deletion.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('link', { name: 'Ver transações de Salário', exact: true }).click();
  await expect(page).toHaveURL(/categoria=1/);
  await expect(page.locator('.transaction-entry')).toHaveCount(3);
});

test('lista compacta reduz a altura, abre detalhes por teclado e permite editar, confirmar e excluir', async ({ page }, info) => {
  await mockApp(page);
  await page.goto('/transactions');
  const compactRow = page.locator('.transaction-entry').filter({ hasText: 'Conta a conferir' });
  const compactHeight = (await compactRow.boundingBox())!.height;
  await page.screenshot({ path: info.outputPath('transacoes-compactas.png'), fullPage: true });
  await page.getByRole('button', { name: 'Detalhada', exact: true }).click();
  await expect(page.getByTestId('detailed-transaction-feed')).toBeVisible();
  const detailedHeight = (await page.locator('.transaction-entry').filter({ hasText: 'Conta a conferir' }).boundingBox())!.height;
  expect(compactHeight).toBeLessThan(detailedHeight * 0.7);
  await page.getByRole('button', { name: 'Compacta', exact: true }).click();
  let open = page.getByRole('button', { name: 'Ver detalhes de Conta a conferir', exact: true });
  await open.focus();
  await page.keyboard.press('Enter');
  let details = page.getByRole('dialog', { name: 'Detalhes da transação', exact: true });
  await expect(details).toContainText('150,00');
  await expect(details).toContainText('Pendente');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await open.click();
  await details.getByRole('button', { name: 'Editar transação', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Editar Transação', exact: true });
  await expect(form.getByLabel('Descrição', { exact: true })).toHaveValue('Conta a conferir');
  await form.getByLabel('Descrição', { exact: true }).fill('Conta revisada');
  await form.getByRole('button', { name: 'Salvar', exact: true }).click();
  open = page.getByRole('button', { name: 'Ver detalhes de Conta revisada', exact: true });
  await open.click();
  details = page.getByRole('dialog', { name: 'Detalhes da transação', exact: true });
  await details.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(details).toContainText('Confirmada');
  await details.getByRole('button', { name: 'Excluir transação', exact: true }).click();
  await page.getByRole('dialog', { name: 'Excluir transação', exact: true }).getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(open).toHaveCount(0);
});

test('confirmação recusada mostra erro nos detalhes e permite tentar novamente sem perder a transação', async ({ page }) => {
  await mockApp(page);
  let fail = true;
  await page.route('**/api/transactions/3', async (route) => {
    if (route.request().method() === 'PUT' && fail) {
      fail = false;
      return route.fulfill({ status: 503, json: { message: 'Não foi possível confirmar agora.' } });
    }
    return route.fallback();
  });
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Ver detalhes de Conta a conferir', exact: true }).click();
  const details = page.getByRole('dialog', { name: 'Detalhes da transação', exact: true });
  await details.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(details.getByRole('alert')).toHaveText('Não foi possível confirmar agora.');
  await expect(details).toContainText('Pendente');
  await expect(details.getByRole('button', { name: 'Confirmar', exact: true })).toBeEnabled();
  await details.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(details).toContainText('Confirmada');
  await expect(details.getByRole('alert')).toHaveCount(0);
});

test('transações longas e valores máximos cabem na lista e detalhes preservam o texto completo', async ({ page }) => {
  const description = 'Movimentação com descrição extensa para conferir sem perder informações '.repeat(2).slice(0, 200);
  await mockApp(page, [{ ...history[0], descricao: description, valor: 99999999.99 }, history[3]]);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/transactions');
  await expect(page.getByTestId('compact-transaction-feed')).toContainText('99.999.999,99');
  expect((await page.getByRole('heading', { name: 'Suas movimentações', exact: true }).boundingBox())!.height).toBeLessThanOrEqual(56);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Ver detalhes de ' + description, exact: true }).click();
  const details = page.getByRole('dialog', { name: 'Detalhes da transação', exact: true });
  await expect(details.getByRole('heading', { name: description, exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Ver detalhes de Próximo salário', exact: true }).click();
  await expect(details).toContainText('Prevista');
  await expect(details.getByRole('button', { name: 'Confirmar', exact: true })).toHaveCount(0);
});

test('perfil compara entradas e saídas com centavos e preserva metas se o resumo falhar', async ({ page }, info) => {
  await mockApp(page, [{ ...history[0], valor: 0.29 }, { ...history[1], valor: 0.58 }]);
  await page.goto('/profile');
  const overview = page.getByRole('region', { name: 'Seu momento financeiro', exact: true });
  await expect(overview).toContainText('-R$ 0,29');
  await expect(overview).toContainText('R$ 0,58');
  await expect(overview).toContainText('R$ 200,00');
  await page.screenshot({ path: info.outputPath('perfil-visual.png'), fullPage: true });
  await overview.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(overview).not.toContainText(/0,29|0,58|200,00|\d+%/);
  expect(await overview.locator('[aria-hidden="true"] [style*="width"]').count()).toBe(0);
  await page.route('**/api/reports/detailed?**', (route) => route.fulfill({ status: 500, json: { message: 'Resumo indisponível.' } }));
  await page.reload();
  await expect(overview.getByRole('alert')).toContainText('resumo do mês');
  await expect(overview.getByRole('link', { name: /Guardado nas metas/ })).toBeVisible();
});

test('relatórios preenchem a coluna de categorias com destaques e ocultam toda a análise financeira', async ({ page }, info) => {
  await mockApp(page);
  await page.goto('/reports');
  const category = page.getByRole('region', { name: 'Despesas por Categoria', exact: true });
  const highlights = page.getByRole('region', { name: 'Destaques do período', exact: true });
  await expect(category).toContainText('Moradia');
  await expect(highlights).toContainText('receitas cobrem');
  const first = (await category.boundingBox())!;
  const next = (await highlights.boundingBox())!;
  expect(Math.abs(first.x - next.x)).toBeLessThan(1);
  expect(next.y - first.y - first.height).toBeGreaterThanOrEqual(12);
  expect(next.y - first.y - first.height).toBeLessThanOrEqual(24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('relatorios-colunas.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await expect(highlights).toHaveCount(0);
  await expect(page.getByRole('main')).not.toContainText(/4\.000,00|1\.000,00|3\.000,00|100%/);
});

for (const theme of ['light', 'dark'] as const) {
  test(`cores de receitas e despesas mantêm contraste e respeitam alto contraste em ${theme}`, async ({ page }, info) => {
    await mockApp(page);
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/categories');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const expense = page.getByRole('button', { name: 'Ver categorias de despesas', exact: true });
    const income = page.getByRole('button', { name: 'Ver categorias de receitas', exact: true });
    await expect(expense).toBeVisible();
    const backgrounds = await page.locator('.category-collection').evaluateAll((cards) => cards.map((card) => getComputedStyle(card).backgroundImage));
    expect(backgrounds[0]).toContain('linear-gradient');
    expect(backgrounds[0]).not.toBe(backgrounds[1]);
    const contrast = await page.locator('.category-collection').evaluateAll((cards) => {
      const rgb = (value: string) => value.startsWith('#') ? value.slice(1).match(/../g)!.map((channel) => parseInt(channel, 16)) : value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const luminance = (color: number[]) => color.map((channel) => channel / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const ratio = (text: number[], background: number[]) => (Math.max(luminance(text), luminance(background)) + 0.05) / (Math.min(luminance(text), luminance(background)) + 0.05);
      const wash = (color: number[], alpha: number) => color.map((channel) => channel * (1 - alpha) + 255 * alpha);
      return cards.map((card) => {
        const style = getComputedStyle(card);
        // Include a conservative white overlay for the glow/decor and the translucent badges.
        const stops = ['--hero-start', '--hero-middle', '--hero-end'].map((name) => wash(rgb(style.getPropertyValue(name).trim()), 0.1));
        const text = rgb(getComputedStyle(card.querySelector('.hero-muted')!).color);
        const badge = rgb(getComputedStyle(card.querySelector('.hero-glass')!).color);
        return { text: Math.min(...stops.map((background) => ratio(text, background))), badge: Math.min(...stops.map((background) => ratio(badge, wash(background, 0.08)))) };
      });
    });
    for (const card of contrast) { expect(card.text).toBeGreaterThanOrEqual(4.5); expect(card.badge).toBeGreaterThanOrEqual(4.5); }
    await page.screenshot({ path: info.outputPath(`categorias-cores-${theme}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    await page.getByRole('dialog', { name: 'Acessibilidade', exact: true }).getByRole('button', { name: /^Alto contraste/ }).click();
    await page.keyboard.press('Escape');
    await expect(expense).toHaveCSS('background-image', 'none');
    await expect(income).toHaveCSS('background-image', 'none');
    const foreground = theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
    await expect(expense.locator('.hero-ink').first()).toHaveCSS('color', foreground);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  for (const empty of [false, true]) test(`relatório ${empty ? 'vazio' : 'com dados'} alinha gráficos e base em ${theme}`, async ({ page }, info) => {
    await mockApp(page, empty ? [] : history);
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/reports');
    const chart = page.getByRole('region', { name: 'Receitas, despesas e saldo', exact: true });
    const categories = page.getByRole('region', { name: 'Despesas por Categoria', exact: true });
    const highlights = page.getByRole('region', { name: 'Destaques do período', exact: true });
    const details = page.getByRole('button', { name: 'Ver histórico e transações detalhadas', exact: true });
    await expect(chart).toBeVisible();
    if (empty) await expect(page.getByText('Taxa de Economia', { exact: true }).locator('../..')).toContainText('0%');
    await expect(details).toHaveCSS('text-decoration-line', 'none');
    if (info.project.name === 'desktop') {
      const bounds = await Promise.all([chart, categories, highlights, details].map((item) => item.boundingBox()));
      const [first, second, lowerRight, lowerLeft] = bounds.map((item) => item!);
      expect(Math.abs(first.y + first.height - second.y - second.height)).toBeLessThan(2);
      expect(Math.abs(lowerLeft.y - lowerRight.y)).toBeLessThan(2);
      expect(Math.abs(lowerLeft.y + lowerLeft.height - lowerRight.y - lowerRight.height)).toBeLessThan(2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(`relatorios-${empty ? 'vazio' : 'dados'}-${theme}.png`), fullPage: true });
    await details.click();
    await expect(page.getByRole('heading', { name: 'Transações detalhadas', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Baixar PDF', exact: true })).toBeEnabled();
  });
}
