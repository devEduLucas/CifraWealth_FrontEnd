import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { prisma } from '../../CifraWealth_BackEnd/src/lib/prisma';
import { hashPassword } from '../../CifraWealth_BackEnd/src/utils/hashPassword';
import { DEFAULT_CATEGORIES } from '../../CifraWealth_BackEnd/src/utils/defaultCategories';
const API = process.env.E2E_API_URL!;
let userId: number;
let auth: { token: string; user: unknown };
let email: string;
const password = 'Sprint5Browser!123';
test.beforeAll(async ({ request }) => {
  expect(['localhost','127.0.0.1','[::1]']).toContain(new URL(process.env.DATABASE_URL!).hostname);
  email = 'browser-' + randomUUID() + '@example.com';
  // Verified fixtures avoid delivering e-mail to external recipients. The actual
  // registration/SMTP flow is covered by the backend's local capture server.
  const created=await prisma.usuarios.create({data:{nome:'Teste',sobrenome:'Navegador',email,senha:await hashPassword(password),email_verificado:true,categorias:{create:DEFAULT_CATEGORIES}}});userId=created.id_usuario;
  const login=await request.post(API+'/auth/login',{data:{email,password}});expect(login.status()).toBe(200);auth=await login.json();
});
test.afterAll(async () => {
  if(userId) { await prisma.transacoes.deleteMany({where:{id_usuario:userId}});await prisma.metas_financeiras.deleteMany({where:{id_usuario:userId}});await prisma.categorias.deleteMany({where:{id_usuario:userId}});await prisma.usuarios.deleteMany({where:{id_usuario:userId}}); }
  await prisma.$disconnect();
});
test('campos ocupam a área inteira, têm um único foco e login funciona', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button',{name:'Google indisponível'})).toBeDisabled();
  await expect(page.getByText(/Modo demonstração/)).toHaveCount(0);
  const emailInput=page.getByLabel('E-mail',{exact:true});await emailInput.fill(email);
  const shell=emailInput.locator('..');const bounds=await shell.boundingBox();expect(bounds).not.toBeNull();
  await page.mouse.click(bounds!.x+bounds!.width-8,bounds!.y+8);await expect(emailInput).toBeFocused();
  await expect(emailInput).toHaveCSS('outline-style','none');await expect(emailInput).toHaveCSS('box-shadow','none');
  await expect(shell).not.toHaveCSS('box-shadow','none');
  const passwordInput=page.getByLabel('Senha',{exact:true});await passwordInput.fill(password);
  await page.getByRole('button',{name:'Mostrar senha'}).click();await expect(passwordInput).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Ocultar senha'}).click();await expect(passwordInput).toHaveAttribute('type','password');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page).toHaveURL(/dashboard/);
});

test('confirmação de e-mail exige a senha e preserva erros para nova tentativa', async ({ page }) => {
  let confirmations = 0;
  await page.route('**/api/users/verify-email', async (route) => {
    confirmations++;
    const input = route.request().postDataJSON();
    expect(input.token).toBe('token-de-teste');
    const valid = input.password === password;
    await route.fulfill({status:valid ? 200 : 400,contentType:'application/json',body:JSON.stringify({message:valid ? 'E-mail confirmado com sucesso!' : 'A senha está incorreta.'})});
  });
  await page.goto('/verify-email?token=token-de-teste');
  await expect(page.getByLabel('Senha cadastrada',{exact:true})).toBeVisible();
  expect(confirmations).toBe(0);
  await page.getByLabel('Senha cadastrada',{exact:true}).fill('SenhaErrada!123');
  await page.getByRole('button',{name:'Confirmar e-mail',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('senha');
  await page.getByLabel('Senha cadastrada',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Confirmar e-mail',exact:true}).click();
  await expect(page.getByRole('link',{name:'Ir para entrar'})).toBeVisible();
  expect(confirmations).toBe(2);
});

test('transação e categoria mantêm o formulário e o foco em modais aninhados', async ({ page }) => {
  await page.addInitScript((saved)=>{localStorage.setItem('cifrawealth:token',saved.token);localStorage.setItem('cifrawealth:user',JSON.stringify(saved.user));},auth);
  await page.goto('/transactions');
  await page.getByRole('button',{name:'Nova Transação',exact:true}).click();
  const transaction=page.getByRole('dialog',{name:'Nova Transação',exact:true});
  await transaction.getByLabel('Descrição',{exact:true}).fill('Despesa do formulário');
  await transaction.getByRole('button',{name:'+ Nova categoria',exact:true}).click();
  const category=page.getByRole('dialog',{name:'Nova Categoria',exact:true});
  await expect(category.getByLabel('Nome da categoria')).toBeFocused();
  await category.getByLabel('Nome da categoria').fill('Categoria temporária');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(category.getByRole('button',{name:'Salvar',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(category).not.toBeVisible();
  await expect(transaction).toBeVisible();
  await expect(transaction.getByLabel('Descrição',{exact:true})).toHaveValue('Despesa do formulário');
  await expect(transaction.getByRole('button',{name:'+ Nova categoria',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(transaction).not.toBeVisible();
});
test('criar meta, guardar dinheiro, persistir progresso e concluir', async ({ page }, testInfo) => {
  await page.addInitScript((saved)=>{localStorage.setItem('cifrawealth:token',saved.token);localStorage.setItem('cifrawealth:user',JSON.stringify(saved.user));},auth);
  await page.goto('/goals?new=1');const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  await dialog.getByLabel('Nome da meta').fill('Reserva Sprint 5');await dialog.getByLabel('Valor objetivo').fill('1000');await dialog.getByLabel('Prazo (opcional)').fill('2026-10-25');
  await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  await page.getByRole('button',{name:'Registrar valor guardado',exact:true}).click();await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/não transfere dinheiro/)).toBeVisible();await dialog.getByLabel('Quanto você já reservou para esta meta?').fill('250');
  await dialog.getByRole('button',{name:'Registrar valor',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(page.getByRole('status')).toContainText('progresso');
  await page.reload();await expect(page.getByText('25%',{exact:true}).first()).toBeVisible();
  await page.screenshot({ animations: 'disabled',path:testInfo.outputPath('metas.png'),fullPage:true});
  await page.goto('/dashboard');await page.getByRole('link',{name:'Registrar valor guardado'}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:/Completar meta/}).click();await page.getByRole('dialog').getByRole('button',{name:'Registrar valor',exact:true}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.getByText('100%',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'Concluídas',exact:true}).click();await expect(page.getByText('Reserva Sprint 5',{exact:true}).first()).toBeVisible();
  await expect(page.getByRole('button',{name:'Registrar valor guardado',exact:true})).toHaveCount(0);
});

test('modal de categoria permanece aberto enquanto salva', async ({ page }) => {
  await page.addInitScript((saved)=>{localStorage.setItem('cifrawealth:token',saved.token);localStorage.setItem('cifrawealth:user',JSON.stringify(saved.user));},auth);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/categories', async (route) => {
    if (route.request().method() === 'POST') await gate;
    await route.continue();
  });
  try {
    await page.goto('/categories');
    await page.getByRole('button',{name:'Nova Categoria',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Nova Categoria',exact:true});
    await dialog.getByLabel('Nome da categoria').fill('Categoria durante gravação');
    await dialog.getByRole('button',{name:'Salvar',exact:true}).click();
    await expect(dialog.getByRole('button',{name:'Fechar',exact:true})).toBeDisabled();
    await page.keyboard.press('Escape');
    await page.mouse.click(2,2);
    await expect(dialog).toBeVisible();
    release();
    await expect(dialog).not.toBeVisible();
  } finally { release(); }
});
test('relatórios reais, período personalizado, detalhes, CSV e estados de erro', async ({ page, request }, testInfo) => {
  const headers={Authorization:'Bearer '+auth.token};
  const income=await request.post(API+'/categories',{headers,data:{nome:'Salário Sprint 5',tipo:'receita'}});expect(income.status()).toBe(201);
  const expense=await request.post(API+'/categories',{headers,data:{nome:'Mercado Sprint 5',tipo:'despesa'}});expect(expense.status()).toBe(201);
  const incomeId=(await income.json()).id_categoria,expenseId=(await expense.json()).id_categoria;
  for(const data of [{id_categoria:incomeId,valor:2000,tipo:'receita',descricao:'Salário do período',data_transacao:'2026-10-05'},{id_categoria:expenseId,valor:350,tipo:'despesa',descricao:'Compra do período',data_transacao:'2026-10-25'},{id_categoria:expenseId,valor:999,tipo:'despesa',descricao:'Despesa fora do período',data_transacao:'2026-10-26'},{id_categoria:expenseId,valor:500,tipo:'despesa',descricao:'Despesa pendente',data_transacao:'2026-10-06',status:'pendente'}]) expect((await request.post(API+'/transactions',{headers,data:{status:'confirmada',...data}})).status()).toBe(201);
  await page.addInitScript((saved)=>{localStorage.setItem('cifrawealth:token',saved.token);localStorage.setItem('cifrawealth:user',JSON.stringify(saved.user));},auth);
  await page.goto('/reports');await page.getByLabel('Selecionar período do relatório').selectOption('custom');
  await page.getByLabel('Data inicial',{exact:true}).fill('2026-10-05');await page.getByLabel('Data final',{exact:true}).fill('2026-10-25');
  await page.getByRole('button',{name:'Aplicar datas'}).click();await expect(page.getByText('Compra do período',{exact:true})).toBeVisible();await expect(page.getByText('Salário do período',{exact:true})).toBeVisible();
  await expect(page.getByText('Despesa fora do período',{exact:true})).toHaveCount(0);await expect(page.getByText('Despesa pendente',{exact:true})).toHaveCount(0);
  await expect(page.getByText(/1[.]650,00/).first()).toBeVisible();await expect(page.getByRole('img',{name:'Evolução mensal de receitas, despesas e saldo'})).toBeVisible();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar Relatório'}).click();expect((await download).suggestedFilename()).toBe('relatorio-2026-10-05-a-2026-10-25.csv');
  await page.screenshot({ animations: 'disabled',path:testInfo.outputPath('relatorios.png'),fullPage:true});
  await page.getByRole('button', { name: 'Ativar modo claro' }).click();
  await page.screenshot({ animations: 'disabled',path:testInfo.outputPath('relatorios-claro.png'),fullPage:true});
  await page.getByLabel('Data inicial',{exact:true}).fill('2026-10-26');await page.getByRole('button',{name:'Aplicar datas'}).click();await expect(page.getByRole('alert')).toContainText('inicial');
  await page.getByLabel('Data inicial',{exact:true}).fill('2026-10-25');await page.getByLabel('Data final',{exact:true}).fill('2026-10-25');await page.getByRole('button',{name:'Aplicar datas'}).click();await expect(page.getByText(/-R\$\s*350,00/).first()).toBeVisible();
  await page.getByLabel('Data inicial',{exact:true}).fill('2025-01-01');await page.getByLabel('Data final',{exact:true}).fill('2025-01-01');await page.getByRole('button',{name:'Aplicar datas'}).click();await expect(page.getByText(/Nenhuma transação confirmada neste período/)).toBeVisible();
  await page.route('**/api/reports/detailed?*',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({message:'Falha de teste'})}));
  await page.getByRole('button',{name:'Atualizar relatório'}).click();await expect(page.getByRole('alert')).toContainText('Falha de teste');await expect(page.getByRole('button',{name:'Exportar Relatório'})).toBeDisabled();
  await page.unroute('**/api/reports/detailed?*');await page.getByRole('button',{name:'Tentar novamente'}).click();await expect(page.getByRole('button',{name:'Exportar Relatório'})).toBeEnabled();
});
