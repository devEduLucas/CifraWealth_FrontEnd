import { test, expect, type Page } from '@playwright/test';

const firstUser = { id_usuario: 999981, nome: 'Ana', sobrenome: 'Guia', email: 'ana-tour@example.test', tem_senha: true, acesso_google: false };
const secondUser = { ...firstUser, id_usuario: 999982, nome: 'Bia', email: 'bia-tour@example.test' };
const password = 'TourSomenteLocal!2026';
const TODAY = '2026-11-25';

function emptyReport(start: string, end: string) {
  return {
    dataInicio: start, dataFim: end,
    summary: { receitas: 0, despesas: 0, saldo: 0, taxaEconomiaPercentual: 0, variacaoReceitas: null, variacaoDespesas: null, variacaoSaldo: null, variacaoTaxaEconomia: null },
    evolution: [], monthlyComparison: [], categoryBreakdown: [], insights: [], history: [], goals: [], transactions: [],
  };
}

async function mockApp(page: Page, baseURL: string, loggedIn = true) {
  const writes: string[] = [];
  let currentUser = firstUser;
  await page.clock.setFixedTime(new Date(TODAY + 'T15:00:00Z'));
  await page.addInitScript(({ user, loggedIn }) => {
    if (loggedIn) {
      localStorage.setItem('cifrawealth:token', 'tour-fixture-only');
      localStorage.setItem('cifrawealth:user', JSON.stringify(user));
    }
  }, { user: firstUser, loggedIn });
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL).origin) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    const path = url.pathname.slice(4);
    const method = route.request().method();
    if (path === '/auth/login' && method === 'POST') {
      currentUser = route.request().postDataJSON().email === secondUser.email ? secondUser : firstUser;
      return route.fulfill({ json: { token: 'tour-fixture-' + currentUser.id_usuario, user: currentUser } });
    }
    if (method !== 'GET') {
      writes.push(method + ' ' + path);
      return route.fulfill({ status: 400, json: { message: 'O tour não pode alterar dados.' } });
    }
    if (path === '/users/me') return route.fulfill({ json: currentUser });
    if (path === '/dashboard') return route.fulfill({ json: { saldo: 0, total_receitas: 0, total_despesas: 0, por_categoria: [] } });
    if (path === '/reports/monthly') return route.fulfill({ json: Array.from({ length: 12 }, (_, index) => ({ mes: `${url.searchParams.get('ano')}-${String(index + 1).padStart(2, '0')}`, total_receitas: 0, total_despesas: 0, saldo: 0 })) });
    if (path === '/reports/detailed') return route.fulfill({ json: emptyReport(url.searchParams.get('data_inicio') ?? TODAY, url.searchParams.get('data_fim') ?? TODAY) });
    if (path === '/categories') return route.fulfill({ json: [
      { id_categoria: 1, nome: 'Salário', tipo: 'receita', cor: '#10b981', icone: 'wallet' },
      { id_categoria: 2, nome: 'Alimentação', tipo: 'despesa', cor: '#f97316', icone: 'utensils' },
    ] });
    if (path === '/transactions' || path === '/goals') return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: { message: 'Rota inesperada no teste: ' + path } });
  });
  return writes;
}

async function login(page: Page, email = firstUser.email, openPage = true) {
  if (openPage) await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function logout(page: Page) {
  await page.getByRole('link', { name: 'Abrir meu perfil', exact: true }).click();
  await page.getByRole('button', { name: 'Encerrar sessão', exact: true }).click();
  await page.getByRole('dialog', { name: 'Encerrar sessão?', exact: true }).getByRole('button', { name: 'Confirmar e sair', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

function tour(page: Page) { return page.getByRole('dialog', { name: 'Tour guiado', exact: true }); }
function invitation(page: Page) { return page.getByRole('dialog', { name: 'Conheça a CifraWealth', exact: true }); }

test('primeiro login oferece o guia, permite pular e não repete para a mesma conta', async ({ page, baseURL }) => {
  const writes = await mockApp(page, baseURL!, false);
  await login(page);
  await expect(invitation(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(invitation(page)).toHaveCount(0);
  await page.reload();
  await expect(invitation(page)).toHaveCount(0);
  await logout(page);
  await login(page);
  await expect(invitation(page)).toHaveCount(0);
  await expect(tour(page)).toHaveCount(0);
  expect(writes).toEqual([]);
});

test('convite já exibido não reaparece após recarregar aberto ou entrar em outra aba', async ({ page, context, baseURL }) => {
  const writes = await mockApp(page, baseURL!, false);
  await login(page);
  await expect(invitation(page)).toBeVisible();
  // Exibir o convite já conta como primeiro acesso, sem obrigar a completar o tour.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(invitation(page)).toHaveCount(0);
  await logout(page);
  const nextVisit = await context.newPage();
  try {
    const nextWrites = await mockApp(nextVisit, baseURL!, false);
    await page.close();
    await login(nextVisit);
    await expect(invitation(nextVisit)).toHaveCount(0);
    await expect(tour(nextVisit)).toHaveCount(0);
    expect(nextWrites).toEqual([]);
  } finally { await nextVisit.close(); }
  expect(writes).toEqual([]);
});

test('atalho para conteúdo fica oculto sem deixar sombra e continua utilizável pelo teclado', async ({ page, baseURL }, info) => {
  await mockApp(page, baseURL!);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo principal', exact: true });
  await expect(skip).toHaveCSS('box-shadow', 'none');
  expect(await skip.evaluate((node) => node.getBoundingClientRect().bottom)).toBeLessThan(0);
  await page.screenshot({ path: info.outputPath('header-sem-sombra.png') });
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await expect(skip).toHaveCSS('clip-path', 'none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#conteudo-principal')).toBeFocused();
  await expect(skip).toHaveCSS('box-shadow', 'none');
});

test('preferência do convite é separada por conta e a sessão encerrada não reabre o tour anterior', async ({ page, baseURL }) => {
  await mockApp(page, baseURL!, false);
  await login(page);
  await expect(invitation(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await logout(page);
  await login(page, secondUser.email);
  await expect(invitation(page)).toBeVisible();
  await invitation(page).getByRole('button', { name: 'Conhecer o site', exact: true }).click();
  await expect(tour(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await logout(page);
  await login(page, firstUser.email);
  await expect(invitation(page)).toHaveCount(0);
  await expect(tour(page)).toHaveCount(0);
});

test('tour pode ser repetido pela Ajuda, avança pelas telas e nunca registra dados', async ({ page, baseURL }, info) => {
  const writes = await mockApp(page, baseURL!);
  await page.goto('/help');
  await expect(invitation(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Iniciar tour guiado', exact: true }).click();
  const dialog = tour(page);
  const paths = ['/dashboard', '/dashboard', '/transactions', '/categories', '/goals', '/reports', '/profile', '/help'];
  for (let index = 0; index < paths.length; index++) {
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(new RegExp(paths[index] + '(?:\\?.*)?$'));
    await expect(dialog).toContainText(new RegExp(`${index + 1}\\s*(?:de|/)\\s*${paths.length}`));
    expect(await page.evaluate(() => Boolean(document.querySelector('main')?.closest('[inert]')))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(dialog.getByRole('button', { name: index === paths.length - 1 ? 'Concluir' : 'Próximo', exact: true })).toBeEnabled();
    if ([0, 2, 5, 7].includes(index)) await page.screenshot({ path: info.outputPath('tour-passo-' + (index + 1) + '.png'), animations: 'disabled' });
    if (index === 2) {
      await dialog.getByRole('button', { name: 'Voltar', exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
      await dialog.getByRole('button', { name: 'Próximo', exact: true }).click();
      await expect(page).toHaveURL(/\/transactions$/);
    }
    await dialog.getByRole('button', { name: index === paths.length - 1 ? 'Concluir' : 'Próximo', exact: true }).click();
  }
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Iniciar tour guiado', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Iniciar tour guiado', exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Sair do tour', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes).toEqual([]);
});

test('tour mantém foco por teclado, fecha com Escape e cabe em 320px com texto ampliado', async ({ page, baseURL }, info) => {
  const writes = await mockApp(page, baseURL!);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/help');
  await page.evaluate(() => { document.documentElement.style.fontSize = '20px'; });
  await page.getByRole('button', { name: 'Iniciar tour guiado', exact: true }).click();
  const dialog = tour(page);
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press(index % 3 === 0 ? 'Shift+Tab' : 'Tab');
    const focus = await dialog.evaluate((element) => ({ inside: element.contains(document.activeElement), active: document.activeElement?.outerHTML.slice(0, 400), inert: Boolean(element.closest('[inert]')) }));
    expect(focus.inside, JSON.stringify(focus)).toBe(true);
  }
  await expect(dialog.getByRole('button', { name: 'Próximo', exact: true })).toBeInViewport();
  await expect(dialog.getByRole('button', { name: 'Sair do tour', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('tour-320-teclado.png'), animations: 'disabled' });
  for (let index = 0; index < 2; index++) {
    await dialog.locator('[data-tour-copy]').evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await dialog.getByRole('button', { name: 'Próximo', exact: true }).click();
  }
  await expect(dialog.getByRole('heading', { name: 'Suas transações, do seu jeito', exact: true })).toBeInViewport();
  expect(await dialog.locator('[data-tour-copy]').evaluate((element) => element.scrollTop)).toBe(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[inert]')))).toBe(false);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  expect(writes).toEqual([]);
});

test('Ajuda preserva o assunto na URL, busca sem acentos e informa resultado vazio', async ({ page, baseURL }) => {
  await mockApp(page, baseURL!);
  await page.goto('/help?section=goals');
  await expect(page.getByRole('navigation', { name: 'Assuntos da ajuda' }).getByRole('link', { name: 'Metas', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'Acompanhe o que você está reservando', exact: true })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Buscar na ajuda', exact: true });
  await search.fill('transacoes');
  await expect(page.getByRole('region', { name: 'Resultados da busca', exact: true }).getByRole('link', { name: 'Transações', exact: true })).toBeVisible();
  await search.fill('inexistente-xyz-999');
  await expect(page.getByText(/Nenhum resultado/)).toBeVisible();
  await page.getByRole('button', { name: 'Limpar busca', exact: true }).click();
  await expect(search).toHaveValue('');
  expect(new URL(page.url()).searchParams.get('section')).toBe('goals');
});

test('tour da área retorna ao assunto e ao botão de origem sem aumentar o histórico', async ({ page, baseURL }) => {
  const writes = await mockApp(page, baseURL!);
  await page.goto('/help?section=reports');
  const historyLength = await page.evaluate(() => history.length);
  const start = page.getByRole('button', { name: 'Ver tour desta área', exact: true });
  await start.click();
  await expect(tour(page)).toContainText('Passo 1 de 1');
  await expect(page).toHaveURL(/\/reports$/);
  await tour(page).getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(tour(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/help\?section=reports$/);
  await expect(start).toBeFocused();
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  expect(writes).toEqual([]);
});

test('Voltar do navegador encerra o tour sem forçar outra navegação', async ({ page, baseURL }) => {
  await mockApp(page, baseURL!);
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Ajuda desta página', exact: true }).click();
  await page.getByRole('link', { name: 'Ver guia completo', exact: true }).click();
  await expect(page).toHaveURL(/\/help\?section=profile$/);
  await page.getByRole('button', { name: 'Iniciar tour guiado', exact: true }).click();
  await expect(tour(page)).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(tour(page)).toHaveCount(0);
  expect(await page.evaluate(() => Boolean(document.querySelector('main')?.closest('[inert]')))).toBe(false);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('uma área lenta não bloqueia o guia e recebe o destaque quando termina de carregar', async ({ page, baseURL }) => {
  const writes = await mockApp(page, baseURL!);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/dashboard', async (route) => {
    await gate;
    await route.fulfill({ json: { saldo: 0, total_receitas: 0, total_despesas: 0, por_categoria: [] } });
  });
  try {
    await page.goto('/help');
    await page.getByRole('button', { name: 'Iniciar tour guiado', exact: true }).click();
    const dialog = tour(page);
    await expect(dialog.getByText('Esta área não está visível no momento.', { exact: false })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Próximo', exact: true })).toBeEnabled();
    release();
    await expect(page.locator('[data-tour-highlight]')).toBeVisible();
    await expect(dialog.getByText('Esta área não está visível no momento.', { exact: false })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(writes).toEqual([]);
  } finally { release(); }
});

test('armazenamento do guia bloqueado mantém login, navegação e dispensa na sessão', async ({ page, baseURL }) => {
  await mockApp(page, baseURL!, false);
  await page.addInitScript(() => {
    const originalGet = Storage.prototype.getItem, originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) { if (key.startsWith('cifrawealth:onboarding:')) throw new Error('blocked fixture'); return originalGet.call(this, key); };
    Storage.prototype.setItem = function (key, value) { if (key.startsWith('cifrawealth:onboarding:')) throw new Error('blocked fixture'); originalSet.call(this, key, value); };
  });
  await login(page);
  await expect(invitation(page)).toBeVisible();
  await invitation(page).getByRole('button', { name: 'Explorar por conta própria', exact: true }).click();
  await logout(page);
  // Stay in the same document: there is deliberately no durable storage here.
  await login(page, firstUser.email, false);
  await expect(invitation(page)).toHaveCount(0);
});

test('convite aguarda outro diálogo antes de aparecer', async ({ page, baseURL }) => {
  await mockApp(page, baseURL!, false);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/auth/login', async (route) => { await gate; await route.fulfill({ json: { token: 'tour-fixture-only', user: firstUser } }); });
  try {
    await page.goto('/login');
    await page.getByLabel('E-mail', { exact: true }).fill(firstUser.email);
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    const accessibility = page.getByRole('dialog', { name: 'Acessibilidade', exact: true });
    await expect(accessibility).toBeVisible();
    release();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(invitation(page)).toHaveCount(0);
    await expect(accessibility).toBeVisible();
    await accessibility.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(invitation(page)).toBeVisible();
    await page.keyboard.press('Escape');
  } finally { release(); }
});

test('conta com histórico pode repetir o tour no modo escuro sem revelar valores ocultos', async ({ page, baseURL }, info) => {
  const writes = await mockApp(page, baseURL!);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.route('**/api/transactions*', (route) => route.fulfill({ json: [{ id_transacao: 1, id_categoria: 1, descricao: 'Salário privado', tipo: 'receita', valor: 500, status: 'confirmada', data_transacao: '2026-11-01' }] }));
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Ocultar valores', exact: true }).click();
  await page.getByRole('button', { name: 'Ajuda desta página', exact: true }).click();
  await page.getByRole('link', { name: 'Ver guia completo', exact: true }).click();
  await page.getByRole('button', { name: 'Iniciar tour guiado', exact: true }).click();
  const dialog = tour(page);
  await expect(dialog.getByRole('button', { name: 'Próximo', exact: true })).toBeEnabled();
  await expect(page.locator('[data-tour="dashboard-summary"]')).toHaveAttribute('aria-label', 'Saldo acumulado dos registros');
  await expect(page.locator('[data-tour="dashboard-summary"]')).toContainText('R$ ••••••');
  await page.screenshot({ path: info.outputPath('tour-conta-com-historico-escuro.png'), animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Próximo', exact: true }).click();
  await expect(dialog).toContainText('Comece pelos registros');
  await expect(page.locator('[data-tour="dashboard-actions"]')).toHaveAttribute('aria-label', 'Registrar movimentação');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Abrir meu perfil', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('cifrawealth:hide-financial-values'))).toBe('true');
  expect(writes).toEqual([]);
});

test('ajuda contextual abre o tour da página e devolve foco ao botão de ajuda', async ({ page, baseURL }) => {
  const writes = await mockApp(page, baseURL!);
  await page.goto('/transactions');
  const helpButton = page.getByRole('button', { name: 'Ajuda desta página', exact: true });
  await helpButton.click();
  await page.getByRole('button', { name: 'Ver tour desta página', exact: true }).click();
  await expect(tour(page)).toContainText('Passo 1 de 1');
  await expect(tour(page)).toContainText('Suas transações, do seu jeito');
  await tour(page).getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(tour(page)).toHaveCount(0);
  await expect(helpButton).toBeFocused();
  expect(writes).toEqual([]);
});

test('resultado de uma pergunta abre e foca a resposta preservando o assunto na URL', async ({ page, baseURL }) => {
  await mockApp(page, baseURL!);
  await page.goto('/help?section=reports');
  await page.getByRole('searchbox', { name: 'Buscar na ajuda', exact: true }).fill('busca detalhamento');
  const question = 'A busca do detalhamento também filtra o PDF e o CSV?';
  await page.getByRole('region', { name: 'Resultados da busca', exact: true }).getByRole('link', { name: question, exact: true }).click();
  await expect(page).toHaveURL(/\/help\?section=reports&question=pdf-filtros$/);
  const summary = page.locator('summary').filter({ hasText: question });
  await expect(summary).toBeFocused();
  await expect(summary.locator('..')).toHaveJSProperty('open', true);
  await expect(summary.locator('..')).toContainText('preservam todos os lançamentos confirmados');
});
