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
