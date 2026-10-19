import { test, expect } from '@playwright/test';

test('recuperação informa falha de envio e confirma solicitação sem expor existência da conta', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/auth/forgot-password', (route) => {
    attempts++;
    return route.fulfill({ status: attempts === 1 ? 503 : 200, contentType: 'application/json', body: JSON.stringify({ message: attempts === 1 ? 'Envio indisponível. Tente novamente mais tarde.' : 'Se a conta existir, as instruções serão enviadas.' }) });
  });
  await page.goto('/forgot-password');
  await page.getByLabel('E-mail', { exact: true }).fill('pessoa@example.com');
  await page.getByRole('button', { name: 'Enviar e-mail', exact: true }).click();
  await expect(page.getByText('Envio indisponível. Tente novamente mais tarde.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Enviar e-mail', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeVisible();
  await expect(page.getByText(/Se houver uma conta com senha cadastrada/)).toBeVisible();
  expect(attempts).toBe(2);
});

test('redefinição exige link, valida confirmação e permite tentar novamente após erro', async ({ page }) => {
  await page.goto('/reset-password');
  await expect(page.getByRole('heading', { name: 'Link inválido ou expirado' })).toBeVisible();
  await page.getByRole('link', { name: 'Solicitar novo link' }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  let attempts = 0;
  await page.route('**/api/auth/reset-password', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ token: 'browser-test-token', password: 'NovaSenha!123' });
    attempts++;
    await route.fulfill({ status: attempts === 1 ? 400 : 200, contentType: 'application/json', body: JSON.stringify({ message: attempts === 1 ? 'Link inválido ou já utilizado.' : 'Senha alterada com sucesso.' }) });
  });
  await page.goto('/reset-password?token=browser-test-token');
  await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha!123');
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('OutraSenha!123');
  await expect(page.getByRole('button', { name: 'Salvar nova senha' })).toBeDisabled();
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha!123');
  await page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await expect(page.getByText('Link inválido ou já utilizado.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await expect(page.getByRole('heading', { name: 'Senha alterada com sucesso!' })).toBeVisible();
  await page.getByRole('button', { name: 'Fazer login agora' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(attempts).toBe(2);
});
