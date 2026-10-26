import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../CifraWealth_BackEnd/src/lib/prisma';
import { hashPassword } from '../../CifraWealth_BackEnd/src/utils/hashPassword';
import {
  signToken,
  sessionVersion,
} from '../../CifraWealth_BackEnd/src/utils/jwt';
import type { AuthResponse } from '../src/lib/api';

const API = process.env.E2E_API_URL!;
const password = 'PerfilBrowser!123';
let auth: AuthResponse;
let userId: number;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(['localhost', '127.0.0.1', '[::1]']).toContain(
    new URL(process.env.DATABASE_URL!).hostname,
  );
  const user = await prisma.usuarios.create({
    data: {
      nome: 'Conta',
      sobrenome: 'Perfil',
      email: `profile-browser-${randomUUID()}@example.test`,
      senha: await hashPassword(password),
      email_verificado: true,
    },
  });
  userId = user.id_usuario;
  auth = {
    token: signToken({ userId, credentialVersion: sessionVersion(user) }),
    user: {
      id_usuario: userId,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      foto_perfil: null,
      capa_perfil: null,
      tem_senha: true,
      acesso_google: false,
    },
  };
  await page.addInitScript((saved) => {
    if (sessionStorage.getItem('profile-fixture-seeded')) return;
    localStorage.setItem('cifrawealth:token', saved.token);
    localStorage.setItem('cifrawealth:user', JSON.stringify(saved.user));
    sessionStorage.setItem('profile-fixture-seeded', 'true');
  }, auth);
  await page.route('https://vlibras.gov.br/**', (route) => route.abort());
});

test.afterEach(async () => {
  if (userId) {
    await prisma.transacoes.deleteMany({ where: { id_usuario: userId } });
    await prisma.metas_financeiras.deleteMany({
      where: { id_usuario: userId },
    });
    await prisma.categorias.deleteMany({ where: { id_usuario: userId } });
    await prisma.usuarios.deleteMany({ where: { id_usuario: userId } });
  }
});
test.afterAll(async () => {
  await prisma.$disconnect();
});

async function seedFinances() {
  const today = new Date();
  const date = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
  const category = await prisma.categorias.create({
    data: { id_usuario: userId, nome: 'Receitas de teste', tipo: 'receita' },
  });
  const expense = await prisma.categorias.create({
    data: { id_usuario: userId, nome: 'Despesas de teste', tipo: 'despesa' },
  });
  await prisma.transacoes.createMany({
    data: [
      {
        id_usuario: userId,
        id_categoria: category.id_categoria,
        descricao: 'Entrada de teste',
        valor: 1234.56,
        tipo: 'receita',
        status: 'confirmada',
        data_transacao: new Date(date + 'T12:00:00Z'),
      },
      {
        id_usuario: userId,
        id_categoria: expense.id_categoria,
        descricao: 'Saída de teste',
        valor: 234.56,
        tipo: 'despesa',
        status: 'confirmada',
        data_transacao: new Date(date + 'T12:00:00Z'),
      },
    ],
  });
  await prisma.metas_financeiras.create({
    data: {
      id_usuario: userId,
      titulo: 'Minha reserva',
      valor_objetivo: 1000,
      valor_atual: 200,
      status: 'em_andamento',
    },
  });
  return { start: date.slice(0, 7) + '-01', end: date };
}

test('perfil apresenta finanças reais, abre relatório do mês e salva capa pronta ou cor sem mudar o nome', async ({
  page,
  request,
}, testInfo) => {
  const range = await seedFinances();
  await page.goto('/profile');
  const overview = page.getByRole('region', { name: 'Seu momento financeiro' });
  await expect(
    overview.getByText('Receitas do mês', { exact: true }),
  ).toBeVisible();
  await expect(overview).toContainText('1.234,56');
  await expect(overview).toContainText('234,56');
  await expect(overview).toContainText('1.000,00');
  const goalsLink = overview.getByRole('link', { name: /1 meta em andamento/ });
  await expect(goalsLink).toContainText('200,00 guardados');
  await expect(goalsLink).toHaveAttribute('href', '/goals');
  await page.getByRole('navigation', { name: 'Seções do perfil' }).getByRole('link', { name: 'Aparência', exact: true }).click();
  await expect(page.locator('#profile-appearance')).toBeInViewport();
  const email = page.getByRole('region', { name: 'Seu perfil' });
  await email
    .getByRole('button', { name: 'Ocultar e-mail', exact: true })
    .click();
  await expect(email).not.toContainText(auth.user.email);
  await expect(
    email.getByRole('button', { name: 'Mostrar e-mail', exact: true }),
  ).toHaveText('');
  await email
    .getByRole('button', { name: 'Mostrar e-mail', exact: true })
    .click();
  await expect(email).toContainText(auth.user.email);
  await email.getByRole('button', { name: 'Personalizar capa' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Editar perfil',
    exact: true,
  });
  await dialog
    .getByRole('button', { name: 'Capa Oceano', exact: true })
    .click();
  await expect(
    dialog.getByRole('button', { name: 'Capa Oceano', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await dialog
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  const saved = await (
    await request.get(API + '/users/me', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
  ).json();
  expect(saved.capa_perfil).toMatch(/^data:image\/jpeg;base64,/);
  expect(saved.nome).toBe('Conta');
  await page.reload();
  await page
    .getByRole('button', { name: 'Editar perfil', exact: true })
    .click();
  await expect(
    dialog.getByRole('button', { name: 'Capa Oceano', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await dialog
    .getByLabel('Escolher cor da capa')
    .evaluate((el: HTMLInputElement) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )!.set!.call(el, '#7c3aed');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  await expect(
    dialog.getByRole('button', { name: 'Capa Oceano', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await dialog
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  const colored = await (
    await request.get(API + '/users/me', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
  ).json();
  expect(colored.capa_perfil).not.toBe(saved.capa_perfil);
  const link = page.getByRole('link', {
    name: 'Abrir meu perfil',
    exact: true,
  });
  await link.focus();
  const bounds = await link.boundingBox();
  expect(bounds!.width).toBe(bounds!.height);
  expect(bounds!.width).toBe(40);
  expect(
    await link.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius)),
  ).toBeGreaterThanOrEqual(20);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({
    path: testInfo.outputPath('perfil-financeiro-escuro.png'),
    fullPage: true,
  });
  await page
    .getByRole('group', { name: 'Aparência', exact: true })
    .getByRole('button', { name: /^Claro/ })
    .click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({
    path: testInfo.outputPath('perfil-financeiro-claro.png'),
    fullPage: true,
  });
  await overview
    .getByRole('link', { name: 'Analisar relatório do mês' })
    .click();
  await expect(page.getByLabel('Data inicial', { exact: true })).toHaveValue(
    range.start,
  );
  await expect(page.getByLabel('Data final', { exact: true })).toHaveValue(
    range.end,
  );
  await expect(
    page.getByText('Carregando relatório...', { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('main')).toContainText('1.234,56');
});

test('privacidade persiste entre telas e saldo antecede os atalhos compactos', async ({
  page,
}, testInfo) => {
  await seedFinances();
  await page.goto('/dashboard');
  const main = page.getByRole('main');
  await expect(main).toContainText('1.234,56');
  const actions = page.getByRole('region', {
    name: 'Registrar movimentação',
  });
  const balance = page.getByRole('region', { name: 'Saldo acumulado dos registros', exact: true });
  expect((await balance.boundingBox())!.y).toBeLessThan(
    (await actions.boundingBox())!.y,
  );
  await page
    .getByRole('button', { name: 'Ocultar valores', exact: true })
    .click();
  await expect(main).not.toContainText(
    /1\.234,56|234,56|1\.000,00|200,00|\d+%/,
  );
  await expect(
    main.getByRole('img', { name: 'Evolução de receitas e despesas' }),
  ).toHaveCount(0);
  await expect(main.getByText('Gráfico oculto', { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Mostrar valores', exact: true }),
  ).toBeVisible();
  await expect(main).not.toContainText(
    /1\.234,56|234,56|1\.000,00|200,00|\d+%/,
  );
  const help = page.getByRole('button', {
    name: 'Ajuda desta página',
  });
  const helpBounds = await help.boundingBox();
  if (testInfo.project.name === 'desktop')
    expect(1000 - helpBounds!.y - helpBounds!.height).toBe(20);
  else {
    const nav = await page
      .getByRole('navigation', { name: 'Menu móvel' })
      .boundingBox();
    expect(helpBounds!.y + helpBounds!.height).toBeLessThan(nav!.y);
    expect(nav!.y - helpBounds!.y - helpBounds!.height).toBeLessThan(20);
  }
  await page
    .getByRole('link', { name: 'Registrar receita', exact: true })
    .click();
  await expect(
    page
      .getByRole('dialog', { name: 'Nova Transação', exact: true })
      .getByLabel('Tipo', { exact: true }),
  ).toHaveValue('receita');
  await page.keyboard.press('Escape');
  await page.goto('/profile');
  const overview = page.getByRole('region', { name: 'Seu momento financeiro' });
  await expect(overview).toContainText('Valores e indicadores ocultos.');
  await expect(overview).not.toContainText(
    /1\.234,56|234,56|1\.000,00|200,00|\d+%/,
  );
  await expect(overview.getByRole('progressbar')).toHaveCount(0);
  await overview
    .getByRole('button', { name: 'Mostrar valores', exact: true })
    .click();
  await expect(overview).toContainText('1.234,56');
  await page.goto('/dashboard');
  await expect(main).toContainText('1.234,56');
});

test('perfil mostra primeiro uso e permite tentar novamente quando só o resumo financeiro falha', async ({
  page,
}) => {
  await page.route('**/api/reports/detailed?*', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Falha temporária no relatório.' }),
    }),
  );
  await page.goto('/profile');
  const overview = page.getByRole('region', { name: 'Seu momento financeiro' });
  await expect(overview.getByRole('alert')).toContainText(
    'O resumo do mês está indisponível.',
  );
  await expect(
    page.getByRole('button', { name: 'Editar perfil', exact: true }),
  ).toBeEnabled();
  await expect(
    overview.getByRole('link', { name: 'Criar minha próxima meta' }),
  ).toBeVisible();
  await page.unroute('**/api/reports/detailed?*');
  await overview
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .click();
  await expect(
    overview.getByText('Seu próximo passo começa aqui:', { exact: false }),
  ).toBeVisible();
  await expect(overview.getByRole('alert')).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 568 });
  await page
    .getByRole('button', { name: 'Acessibilidade', exact: true })
    .click();
  await page.getByRole('button', { name: 'Maior', exact: true }).click();
  await page.getByRole('button', { name: /^Alto contraste/ }).click();
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole('button', { name: 'Editar perfil', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Editar perfil',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: 'Capa Azul Cifra', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('perfil salva nome, avatar e capa na API, preserva rascunho após erro e permite remover imagens', async ({
  page,
  request,
}) => {
  await page.goto('/profile');
  const edit = page.getByRole('button', { name: 'Editar perfil', exact: true });
  await expect(edit).toBeEnabled();
  let rejectOnce = true;
  await page.route('**/api/users/me', async (route) => {
    if (route.request().method() === 'PATCH' && rejectOnce) {
      rejectOnce = false;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Falha temporária ao salvar. Tente novamente.',
        }),
      });
    } else await route.continue();
  });
  await edit.click();
  const dialog = page.getByRole('dialog', {
    name: 'Editar perfil',
    exact: true,
  });
  await expect(
    dialog.getByLabel('Nome completo', { exact: true }),
  ).toBeFocused();
  await expect(dialog.getByLabel('E-mail', { exact: true })).toHaveCount(0);
  await dialog
    .getByLabel('Nome completo', { exact: true })
    .fill('Perfil Nome Atualizado');
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#2563eb';
    context.fillRect(0, 0, 1200, 800);
    context.fillStyle = '#14b8a6';
    context.fillRect(400, 0, 400, 800);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const file = {
    name: 'perfil-teste.png',
    mimeType: 'image/png',
    buffer: Buffer.from(image, 'base64'),
  };
  await dialog.getByLabel('Escolher foto', { exact: true }).setInputFiles(file);
  await expect(
    dialog.getByLabel('Escolher capa', { exact: true }),
  ).toBeEnabled();
  await dialog.getByLabel('Escolher capa', { exact: true }).setInputFiles(file);
  const save = dialog.getByRole('button', {
    name: 'Salvar alterações',
    exact: true,
  });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(dialog.getByRole('alert')).toHaveText(
    'Falha temporária ao salvar. Tente novamente.',
  );
  await expect(dialog.getByLabel('Nome completo', { exact: true })).toHaveValue(
    'Perfil Nome Atualizado',
  );
  await expect(
    page.getByRole('banner', { name: 'Cabeçalho principal' }),
  ).toContainText('Conta Perfil');
  await save.click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('banner', { name: 'Cabeçalho principal' }),
  ).toContainText('Perfil Nome Atualizado');
  const snapshot = await request.get(API + '/users/me', {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  expect(snapshot.status()).toBe(200);
  const profile = await snapshot.json();
  expect(profile.nome).toBe('Perfil');
  expect(profile.sobrenome).toBe('Nome Atualizado');
  expect(profile.email).toBe(auth.user.email);
  expect(profile.foto_perfil).toMatch(/^data:image\/jpeg;base64,/);
  expect(profile.capa_perfil).toMatch(/^data:image\/jpeg;base64,/);
  await page.reload();
  await expect(edit).toBeEnabled();
  await expect(
    page.getByRole('link', { name: 'Abrir meu perfil' }).locator('img'),
  ).toHaveAttribute('src', profile.foto_perfil);
  await expect(
    page.getByRole('region', { name: 'Seu perfil' }).locator('img').first(),
  ).toHaveAttribute('src', profile.capa_perfil);
  await edit.click();
  await dialog
    .getByRole('button', { name: 'Remover foto', exact: true })
    .click();
  await dialog
    .getByRole('button', { name: 'Remover capa', exact: true })
    .click();
  await save.click();
  await expect(dialog).toHaveCount(0);
  const removed = await (
    await request.get(API + '/users/me', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
  ).json();
  expect(removed.foto_perfil).toBeNull();
  expect(removed.capa_perfil).toBeNull();
});

test('exclusão exige senha, mantém a conta após erro e só encerra a sessão após apagar no servidor', async ({
  page,
  request,
}, testInfo) => {
  await page.goto('/profile');
  await expect(
    page.getByRole('button', { name: 'Excluir minha conta', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Acessibilidade', exact: true })
    .click();
  await page.getByRole('button', { name: /^Alto contraste/ }).click();
  await page.keyboard.press('Escape');
  const opener = page.getByRole('button', {
    name: 'Excluir minha conta',
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole('dialog', {
    name: 'Excluir sua conta?',
    exact: true,
  });
  const field = dialog.getByLabel('Sua senha', { exact: true });
  await expect(field).toBeFocused();
  const confirm = dialog.getByRole('button', {
    name: 'Excluir conta permanentemente',
    exact: true,
  });
  await expect(confirm).toBeDisabled();
  const colors = await confirm.evaluate((el) => ({
    foreground: getComputedStyle(el).color,
    background: getComputedStyle(el).backgroundColor,
  }));
  expect(colors.foreground).not.toBe(colors.background);
  await field.fill('senha-incorreta');
  await confirm.click();
  await expect(dialog.getByRole('alert')).toHaveText(
    'Senha incorreta. Confira sua senha e tente novamente.',
  );
  await expect(field).toBeFocused();
  expect(
    (
      await request.get(API + '/users/me', {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
    ).status(),
  ).toBe(200);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(field).toHaveValue('');
  await field.fill(password);
  await page.screenshot({
    path: testInfo.outputPath('exclusao-alto-contraste.png'),
  });
  await confirm.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByText('Conta e dados financeiros excluídos com sucesso.', {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('cifrawealth:token')),
  ).toBeNull();
  expect(
    (
      await request.get(API + '/users/me', {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
    ).status(),
  ).toBe(401);
  expect(await prisma.usuarios.count({ where: { id_usuario: userId } })).toBe(
    0,
  );
});

test('acessibilidade fica no header, mantém o foco e cabe em 320px com texto ampliado', async ({
  page,
}, testInfo) => {
  await page.goto('/profile');
  const header = page.getByRole('banner', { name: 'Cabeçalho principal' });
  const opener = header.getByRole('button', {
    name: 'Acessibilidade',
    exact: true,
  });
  await expect(opener).toBeVisible();
  await expect(page.locator('.accessibility-tools')).toHaveCount(0);
  await opener.click();
  const dialog = page.getByRole('dialog', {
    name: 'Acessibilidade',
    exact: true,
  });
  const close = dialog.getByRole('button', { name: 'Fechar', exact: true });
  await expect(close).toBeFocused();
  expect(await page.locator('#root').evaluate((el) => el.inert)).toBe(true);
  const last = dialog.getByRole('link', { name: /Ajuda do VLibras/ });
  await last.focus();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.getByRole('button', { name: 'Maior', exact: true }).click();
  await page.getByRole('button', { name: /^Alto contraste/ }).click();
  await page.getByRole('button', { name: /^Sublinhar links/ }).click();
  await page.setViewportSize({ width: 320, height: 568 });
  const bounds = await dialog.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(568);
  await expect(close).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('acessibilidade-320-texto-ampliado.png'),
  });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await page.locator('#root').evaluate((el) => el.inert)).toBe(false);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-text-size',
    'larger',
  );
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-high-contrast',
    'true',
  );
  await expect(page.locator('html')).toHaveAttribute(
    'data-a11y-underline-links',
    'true',
  );
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#conteudo-principal')).toBeFocused();
});
