import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { prisma } from '../../CifraWealth_BackEnd/src/lib/prisma';
import { hashPassword } from '../../CifraWealth_BackEnd/src/utils/hashPassword';
import { DEFAULT_CATEGORIES } from '../../CifraWealth_BackEnd/src/utils/defaultCategories';

const API = process.env.E2E_API_URL!;
let userId: number;
let auth: { token: string; user: unknown };
let incomeId: number;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const futureDate = new Date(today + 'T12:00:00Z'); futureDate.setUTCDate(futureDate.getUTCDate() + 1);
const future = futureDate.toISOString().slice(0,10);
const headers = () => ({ Authorization: 'Bearer ' + auth.token });

test.beforeAll(async ({ request }) => {
  expect(['localhost','127.0.0.1','[::1]']).toContain(new URL(process.env.DATABASE_URL!).hostname);
  const email = 'fixes-' + randomUUID() + '@example.com', password = 'Regressao!123';
  const user = await prisma.usuarios.create({ data: { nome:'Teste', sobrenome:'Correções', email, senha:await hashPassword(password), email_verificado:true, categorias:{create:DEFAULT_CATEGORIES} } });
  userId = user.id_usuario;
  const login = await request.post(API + '/auth/login', { data:{email,password} });expect(login.status()).toBe(200);auth=await login.json();
  const categories = await request.get(API + '/categories', { headers:headers() });
  incomeId = (await categories.json()).find((item: {tipo:string}) => item.tipo === 'receita').id_categoria;
});
test.afterAll(async () => {
  try { if (userId) {
    await prisma.transacoes.deleteMany({where:{id_usuario:userId}});
    await prisma.metas_financeiras.deleteMany({where:{id_usuario:userId}});
    await prisma.categorias.deleteMany({where:{id_usuario:userId}});
    await prisma.usuarios.deleteMany({where:{id_usuario:userId}});
  } } finally { await prisma.$disconnect(); }
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript((saved) => { localStorage.setItem('cifrawealth:token',saved.token);localStorage.setItem('cifrawealth:user',JSON.stringify(saved.user)); },auth);
});

test('dinheiro, edição, previsão, confirmação, busca e exclusão protegida', async ({ page, request }) => {
  await page.goto('/transactions?new=1&tipo=receita');let dialog=page.getByRole('dialog');
  await dialog.getByLabel('Descrição',{exact:true}).fill('Receita corrigível');await dialog.getByLabel('Valor',{exact:true}).fill('1.000');await dialog.getByLabel('Categoria',{exact:true}).selectOption(String(incomeId));
  await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  let row=page.getByRole('listitem').filter({hasText:'Receita corrigível'});
  await expect(row).toContainText('1.000,00');await row.getByRole('button',{name:'Editar transação'}).click();
  dialog=page.getByRole('dialog',{name:'Editar Transação'});await dialog.getByLabel('Valor',{exact:true}).fill('1.000,50');await dialog.getByLabel('Descrição',{exact:true}).fill('Receita com café');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  await page.getByLabel('Buscar transações').fill('cafe');await expect(page.getByRole('listitem').filter({hasText:'Receita com café'})).toBeVisible();await page.getByRole('button',{name:'Limpar filtros'}).click();
  await page.getByRole('button',{name:'Nova Transação',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Descrição',{exact:true}).fill('Recebimento futuro');await dialog.getByLabel('Valor',{exact:true}).fill('900');await dialog.getByLabel('Tipo',{exact:true}).selectOption('receita');await dialog.getByLabel('Categoria',{exact:true}).selectOption(String(incomeId));await dialog.getByLabel('Data',{exact:true}).fill(future);await expect(dialog.getByLabel('Situação')).toBeDisabled();await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  const list=await request.get(API+'/transactions',{headers:headers()});const scheduled=(await list.json()).find((item:{descricao:string})=>item.descricao==='Recebimento futuro');expect(scheduled.status).toBe('pendente');
  await page.getByLabel('Filtrar situação').selectOption('prevista');await expect(page.getByText('Recebimento futuro',{exact:true})).toBeVisible();await expect(page.getByText('Receita com café',{exact:true})).toHaveCount(0);
  await page.goto('/dashboard');await expect(page.getByText('Saldo dos lançamentos',{exact:true})).toBeVisible();const balance=await request.get(API+'/dashboard',{headers:headers()});expect((await balance.json()).saldo).toBe(1000.5);
  await page.goto('/transactions');row=page.getByRole('listitem').filter({hasText:'Recebimento futuro'});await row.getByRole('button',{name:'Editar transação'}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Data',{exact:true}).fill(today);await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();await row.getByRole('button',{name:'Confirmar',exact:true}).click();await expect(row).toContainText('Confirmada');
  await row.getByRole('button',{name:'Excluir transação'}).click();dialog=page.getByRole('dialog',{name:'Excluir transação'});await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();await expect(row).toBeVisible();await row.getByRole('button',{name:'Excluir transação'}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirmar exclusão',exact:true}).click();await expect(row).toHaveCount(0);
});

test('categorias permitem renomear e protegem registros vinculados', async ({ page, request }) => {
  await page.goto('/categories');await page.getByRole('button',{name:'Nova Categoria',exact:true}).click();let dialog=page.getByRole('dialog');await dialog.getByLabel('Nome da categoria').fill('Categoria editável');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  let row=page.getByRole('listitem').filter({hasText:'Categoria editável'});await row.getByRole('button',{name:'Editar categoria'}).click();dialog=page.getByRole('dialog',{name:'Editar Categoria'});await dialog.getByLabel('Nome da categoria').fill('Categoria renomeada');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  const categories=await request.get(API+'/categories',{headers:headers()});const category=(await categories.json()).find((item:{nome:string})=>item.nome==='Categoria renomeada');const created=await request.post(API+'/transactions',{headers:headers(),data:{descricao:'Vínculo preservado',valor:5,tipo:'despesa',id_categoria:category.id_categoria,data_transacao:today}});expect(created.status()).toBe(201);
  row=page.getByRole('listitem').filter({hasText:'Categoria renomeada'});await row.getByRole('button',{name:'Excluir categoria'}).click();dialog=page.getByRole('dialog',{name:'Excluir categoria'});await dialog.getByRole('button',{name:'Confirmar exclusão'}).click();await expect(dialog.getByRole('alert')).toContainText('possui transações');await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();await expect(row).toBeVisible();
});

test('metas diferenciam aporte, correção, retirada, detalhes e cancelamento', async ({ page, request }) => {
  await page.goto('/goals?new=1');let dialog=page.getByRole('dialog');await dialog.getByLabel('Nome da meta').fill('Meta ajustável');await dialog.getByLabel('Valor objetivo').fill('1.000');await dialog.getByLabel('Prazo (opcional)').fill('2026-10-25');await dialog.getByRole('button',{name:'Salvar',exact:true}).click();await expect(dialog).not.toBeVisible();
  for(const value of ['250','500']){await page.getByRole('button',{name:'Registrar valor guardado',exact:true}).click();dialog=page.getByRole('dialog',{name:'Adicionar valor guardado'});await dialog.getByLabel('Valor deste aporte').fill(value);await expect(dialog.getByRole('status')).toContainText('Após registrar');await dialog.getByRole('button',{name:'Registrar valor',exact:true}).click();await expect(dialog).not.toBeVisible();}
  const goals=await request.get(API+'/goals',{headers:headers()});const goal=(await goals.json()).find((item:{titulo:string})=>item.titulo==='Meta ajustável');expect(goal.valor_atual).toBe(750);
  await page.getByRole('button',{name:'Ajustar valor guardado',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Total correto guardado').fill('500');await dialog.getByRole('button',{name:'Salvar ajuste'}).click();await expect(dialog).not.toBeVisible();
  await page.getByRole('button',{name:'Ajustar valor guardado',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Operação').selectOption('withdraw');await dialog.getByLabel('Valor da retirada').fill('100');await expect(dialog.getByRole('status')).toContainText('400,00');await dialog.getByRole('button',{name:'Salvar ajuste'}).click();await expect(dialog).not.toBeVisible();await expect(page.getByText('40%',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'Visualizar',exact:true}).click();dialog=page.getByRole('dialog',{name:'Detalhes da meta'});await expect(dialog.getByText(/25 de outubro de 2026/)).toBeVisible();await expect(dialog.locator('input')).toHaveCount(0);await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Cancelar meta',exact:true}).click();await expect(page.getByRole('button',{name:'Reativar meta',exact:true})).toBeVisible();await page.getByRole('button',{name:'Reativar meta',exact:true}).click();await expect(page.getByRole('button',{name:'Registrar valor guardado',exact:true})).toBeVisible();await page.reload();await expect(page.getByText('40%',{exact:true}).first()).toBeVisible();
});

test('falha parcial do dashboard preserva o saldo e permite nova tentativa', async ({ page }) => {
  await page.route('**/api/goals',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({message:'Falha temporária de metas'})}));await page.goto('/dashboard');await expect(page.getByRole('alert')).toContainText('Falha temporária');await expect(page.getByText('Saldo dos lançamentos',{exact:true})).toBeVisible();await expect(page.getByText('Metas indisponíveis no momento. Use “Tentar novamente” acima.',{exact:true})).toBeVisible();
  await page.unroute('**/api/goals');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await expect(page.getByRole('alert')).toHaveCount(0);await expect(page.getByText('Meta ajustável',{exact:true})).toBeVisible();
});

test('textos e valores máximos não causam rolagem horizontal da página', async ({ page, request }, testInfo) => {
  const category=await request.post(API+'/categories',{headers:headers(),data:{nome:'X'.repeat(50),tipo:'despesa'}});expect(category.status()).toBe(201);
  expect((await request.post(API+'/transactions',{headers:headers(),data:{descricao:'Z'.repeat(200),valor:99999999.99,tipo:'despesa',id_categoria:(await category.json()).id_categoria,data_transacao:today}})).status()).toBe(201);
  expect((await request.post(API+'/goals',{headers:headers(),data:{titulo:'X'.repeat(100),descricao:'Y'.repeat(255),valor_objetivo:99999999.99}})).status()).toBe(201);
  for(const width of [320,390,1440])for(const route of ['/dashboard','/transactions','/categories','/goals','/reports']){
    await page.setViewportSize({width,height:900});await page.goto(route);await expect(page.getByText(/Carregando/)).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(route==='/dashboard'){
      const amount=page.getByText('Saldo dos lançamentos',{exact:true}).locator('..').locator('..').locator(':scope > p').first();
      expect(await amount.evaluate((el)=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    }
    if(width===320&&['/dashboard','/goals','/reports'].includes(route))await page.screenshot({animations:'disabled',path:testInfo.outputPath(route.slice(1)+'-320.png')});
  }
});
