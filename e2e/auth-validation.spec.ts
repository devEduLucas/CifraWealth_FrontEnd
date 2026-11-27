import { test, expect, type Page } from '@playwright/test';

const password = 'TesteAcesso!2026';
const user = { id_usuario: 999999, nome: 'Teste', sobrenome: 'Local', email: 'teste@example.invalid', tem_senha: true, acesso_google: false };

test.beforeEach(async ({ page, baseURL }) => {
  // These journeys never use the database, a real account or an email provider.
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL!).origin) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    if (url.pathname === '/api/users/me') return route.fulfill({ json: user });
    if (url.pathname === '/api/dashboard') return route.fulfill({ json: { saldo: 0, total_receitas: 0, total_despesas: 0, por_categoria: [] } });
    return route.fulfill({ json: [] });
  });
});

async function fillRegistration(page: Page) {
  await page.getByLabel('Nome completo', { exact: true }).fill('Teste Local');
  await page.getByLabel('E-mail', { exact: true }).fill(user.email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByLabel('Confirmar senha', { exact: true }).fill(password);
  await page.getByRole('checkbox').check();
}

test('cadastro explica campos obrigatórios e foca o primeiro sem chamar a API', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/users/register', (route) => { requests++; return route.fulfill({ status: 500 }); });
  await page.goto('/register');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(5);
  await expect(page.getByLabel('Nome completo', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Confirme sua senha.', { exact: true })).toBeVisible();
  await expect(page.getByText('Você precisa aceitar os termos para continuar.', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('cadastro informa senha curta e divergência no blur e remove erros ao corrigir', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/users/register', (route) => { requests++; return route.fulfill({ status: 500 }); });
  await page.goto('/register');
  await page.getByLabel('Nome completo', { exact: true }).fill('Teste Local');
  await page.getByLabel('E-mail', { exact: true }).fill('email-invalido');
  await page.getByLabel('Senha', { exact: true }).fill('curta');
  await expect(page.getByText('Informe um e-mail válido.', { exact: true })).toBeVisible();
  await page.getByLabel('Confirmar senha', { exact: true }).fill('OutraSenha!2026');
  await expect(page.getByText('A senha deve ter no mínimo 8 caracteres.', { exact: true })).toBeVisible();
  // A direct pointer click blurs confirmation: its new error must not move the
  // checkbox between pointerdown and pointerup and consume the first click.
  await page.getByRole('checkbox').check();
  await expect(page.getByRole('checkbox')).toBeChecked();
  await expect(page.getByText('As senhas não coincidem.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirmar senha', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  const errorId = await page.getByLabel('Confirmar senha', { exact: true }).getAttribute('aria-describedby');
  expect(errorId).toBeTruthy();
  await expect(page.locator(`[id="${errorId}"]`)).toHaveText('As senhas não coincidem.');
  await page.getByLabel('E-mail', { exact: true }).fill(user.email);
  await expect(page.getByText('Informe um e-mail válido.', { exact: true })).toHaveCount(0);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByLabel('Confirmar senha', { exact: true })).toBeFocused();
  expect(requests).toBe(0);
  await page.getByLabel('Confirmar senha', { exact: true }).fill(password);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('Confirmar senha', { exact: true })).not.toHaveAttribute('aria-invalid', 'true');
  // Changing the original password must invalidate a previously matching confirmation.
  await page.getByLabel('Senha', { exact: true }).fill('NovaSenha!2026');
  await expect(page.getByText('As senhas não coincidem.', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('cadastro bloqueia duplicação, permite corrigir falha do servidor e anuncia confirmação', async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  const firstResponse = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/users/register', async (route) => {
    requests++;
    if (requests === 1) {
      await firstResponse;
      return route.fulfill({ status: 503, json: { message: 'Envio indisponível no teste.' } });
    }
    return route.fulfill({ json: { email: route.request().postDataJSON().email, message: 'Confira seu e-mail.' } });
  });
  await page.goto('/register');
  await fillRegistration(page);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect.poll(() => requests).toBe(1);
  await expect(page.getByLabel('E-mail', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Criando conta...', exact: true })).toBeDisabled();
  await page.locator('form').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  release();
  await expect(page.getByRole('alert')).toHaveText('Envio indisponível no teste.');
  expect(requests).toBe(1);
  await page.getByLabel('E-mail', { exact: true }).fill('corrigido@example.invalid');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Confira sua caixa de entrada', exact: true })).toBeFocused();
  expect(requests).toBe(2);
  await page.getByRole('button', { name: 'Corrigir endereço de e-mail', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Teste Local');
  await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Confirmar senha', { exact: true })).toHaveValue('');
});

test('login corrige erros sem mensagem antiga, aceita autofill e protege nova tentativa', async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  const firstResponse = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/auth/login', async (route) => {
    requests++;
    if (requests === 1) {
      await firstResponse;
      return route.fulfill({ status: 401, json: { message: 'E-mail ou senha incorretos.' } });
    }
    return route.fulfill({ json: { token: 'auth-validation-fixture', user } });
  });
  await page.goto('/login');
  const email = page.getByLabel('E-mail', { exact: true });
  const secret = page.getByLabel('Senha', { exact: true });
  await expect(email).toHaveAttribute('autocomplete', 'username');
  await expect(secret).toHaveAttribute('autocomplete', 'current-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(email).toBeFocused();
  await expect(page.getByText('Informe seu e-mail.', { exact: true })).toBeVisible();
  await expect(page.getByText('Informe sua senha.', { exact: true })).toBeVisible();
  await email.fill('email-invalido');
  await secret.fill(password);
  await expect(page.getByText('Informe um e-mail válido.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  expect(requests).toBe(0);
  await email.fill(user.email);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect.poll(() => requests).toBe(1);
  await expect(email).toBeDisabled();
  await expect(secret).toBeDisabled();
  await page.locator('form').evaluate((form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  release();
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.');
  expect(requests).toBe(1);
  await secret.fill('SenhaCorrigida!2026');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(requests).toBe(2);
});

test('recuperação permite repetir falha e direciona foco ao sucesso e à correção', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/auth/forgot-password', (route) => {
    requests++;
    return route.fulfill({ status: requests === 1 ? 503 : 200, json: { message: requests === 1 ? 'Envio indisponível no teste.' : 'Se a conta existir, as instruções serão enviadas.' } });
  });
  await page.goto('/forgot-password');
  await page.getByLabel('E-mail', { exact: true }).fill(user.email);
  await page.getByRole('button', { name: 'Enviar e-mail', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Envio indisponível no teste.');
  await page.getByRole('button', { name: 'Enviar e-mail', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Verifique seu e-mail', exact: true })).toBeFocused();
  await expect(page.getByRole('status').filter({ hasText: 'Se houver uma conta com senha cadastrada' })).toBeVisible();
  await page.getByRole('button', { name: 'Não recebeu? Tentar com outro e-mail', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toBeFocused();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('');
  expect(requests).toBe(2);
});

test('redefinição explica divergência, permite retry e anuncia sucesso com foco', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/auth/reset-password', (route) => {
    requests++;
    return route.fulfill({ status: requests === 1 ? 400 : 200, json: { message: requests === 1 ? 'Link inválido no teste.' : 'Senha alterada com sucesso.' } });
  });
  await page.goto('/reset-password?token=auth-validation-fixture');
  await page.getByLabel('Nova senha', { exact: true }).fill(password);
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('OutraSenha!2026');
  await page.getByLabel('Nova senha', { exact: true }).focus();
  await expect(page.getByRole('alert')).toHaveText('As senhas não coincidem.');
  await expect(page.getByRole('button', { name: 'Salvar nova senha', exact: true })).toBeDisabled();
  expect(requests).toBe(0);
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill(password);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Salvar nova senha', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Link inválido no teste.');
  await page.getByRole('button', { name: 'Salvar nova senha', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Senha alterada com sucesso!', exact: true })).toBeFocused();
  await expect(page.getByRole('status').filter({ hasText: 'Sua senha foi atualizada.' })).toBeVisible();
  expect(requests).toBe(2);
});
