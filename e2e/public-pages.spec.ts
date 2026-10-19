import { test, expect } from '@playwright/test';

test('landing alinha header às bordas, identifica exemplos e abre informações do cadastro', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'desktop') await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const header = page.getByRole('banner');
  const logo = header.getByRole('link').first();
  expect((await header.boundingBox())!.x).toBe(0);
  expect((await logo.boundingBox())!.x).toBeLessThanOrEqual(32);
  await expect(page.getByText('Exemplo ilustrativo', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('home-claro.png') });
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('home-escuro.png') });
  const question = page.getByRole('button', { name: 'Meus dados e histórico financeiro estão realmente seguros?' });
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await page.goto('/register');
  await page.getByLabel('Nome completo', { exact: true }).fill('Cadastro preservado');
  for (const [name, title] of [['Termos de Uso (abre em nova aba)', 'Termos de uso'], ['Política de Privacidade (abre em nova aba)', 'Privacidade']]) {
    const popup = page.waitForEvent('popup');
    await page.getByRole('link', { name, exact: true }).click();
    const info = await popup;
    await expect(info.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    expect(await info.evaluate(() => window.opener === null)).toBe(true);
    await info.close();
    await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Cadastro preservado');
  }
});

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
