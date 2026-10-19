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
