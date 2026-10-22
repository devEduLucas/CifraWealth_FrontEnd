import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, ApiError, type CategoryResponse, type CategoryType, type TransactionResponse } from '../lib/api';
import { session } from '../lib/session';
import { formatCurrency, formatDate } from '../utils/format';
import { localDateOnly } from '../utils/reports';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Select } from '../components/Select/Select';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { TransactionFormModal, type TransactionFormValues } from '../components/TransactionFormModal/TransactionFormModal';
import { CategoryFormModal, type CategoryFormValues } from '../components/CategoryFormModal/CategoryFormModal';

const PAGE_SIZE = 20;
const normalize = (text: string) => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const emptyFilters = { search: '', tipo: '', status: '', category: '', start: '', end: '' };
const message = (err: unknown) => err instanceof ApiError ? err.message : 'Não foi possível concluir. Tente novamente.';

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = session.getUser();
  const fullName = user ? (user.nome + ' ' + (user.sobrenome ?? '')).trim() : 'Usuário';
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionResponse | null>(null);
  const [defaultTipo, setDefaultTipo] = useState<CategoryType>('despesa');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<TransactionResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryDefaultTipo, setCategoryDefaultTipo] = useState<CategoryType>('despesa');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const today = localDateOnly();

  function loadData() {
    setLoading(true); setPageError(null);
    Promise.all([api.listTransactions(), api.listCategories()])
      .then(([items, cats]) => { setTransactions(items); setCategories(cats); })
      .catch((err: unknown) => setPageError(message(err)))
      .finally(() => setLoading(false));
  }
  useEffect(loadData, []);
  useEffect(() => {
    if (loading || searchParams.get('new') !== '1') return;
    setDefaultTipo(searchParams.get('tipo') === 'receita' ? 'receita' : 'despesa');
    setEditing(null); setModalError(null); setSelectedCategory(null); setModalOpen(true);
    const next = new URLSearchParams(searchParams); next.delete('new'); next.delete('tipo');
    setSearchParams(next, { replace: true });
  }, [loading, searchParams, setSearchParams]);

  const categoriesById = new Map(categories.map((category) => [category.id_categoria, category]));
  const invalidRange = Boolean(filters.start && filters.end && filters.start > filters.end);
  const filtered = transactions.filter((item) => {
    const category = categoriesById.get(item.id_categoria)?.nome ?? '';
    const status = item.data_transacao > today ? 'prevista' : item.status;
    return normalize(item.descricao + ' ' + category).includes(normalize(filters.search))
      && (!filters.tipo || item.tipo === filters.tipo)
      && (!filters.status || status === filters.status)
      && (!filters.category || item.id_categoria === Number(filters.category))
      && (!filters.start || item.data_transacao >= filters.start)
      && (!filters.end || item.data_transacao <= filters.end);
  }).sort((a, b) => b.data_transacao.localeCompare(a.data_transacao) || b.id_transacao - a.id_transacao);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  function changeFilter(key: keyof typeof filters, value: string) { setFilters((old) => ({ ...old, [key]: value })); setPage(0); }
  function openModal(item: TransactionResponse | null = null) {
    setPageError(null);
    setEditing(item); setDefaultTipo(item?.tipo ?? 'despesa'); setModalError(null); setSelectedCategory(null); setModalOpen(true);
  }
  function closeModal() { if (!saving && !categoryModalOpen) setModalOpen(false); }
  async function handleSave(values: TransactionFormValues) {
    if (saving) return;
    setSaving(true); setModalError(null);
    try {
      const item = editing ? await api.updateTransaction(editing.id_transacao, values) : await api.createTransaction(values);
      setTransactions((old) => editing ? old.map((tx) => tx.id_transacao === item.id_transacao ? item : tx) : [item, ...old]);
      setModalOpen(false);
    } catch (err) { setModalError(message(err)); } finally { setSaving(false); }
  }
  async function handleCreateCategory(values: CategoryFormValues) {
    if (categorySaving) return;
    setCategorySaving(true); setCategoryError(null);
    try {
      const created = await api.createCategory(values);
      setCategories((old) => [...old, created]); setSelectedCategory(created); setCategoryModalOpen(false);
    } catch (err) { setCategoryError(message(err)); } finally { setCategorySaving(false); }
  }
  async function handleDelete() {
    if (!deleting || busyId !== null) return;
    setBusyId(deleting.id_transacao); setDeleteError(null);
    try {
      await api.deleteTransaction(deleting.id_transacao);
      setTransactions((old) => old.filter((item) => item.id_transacao !== deleting.id_transacao)); setDeleting(null);
    } catch (err) { setDeleteError(message(err)); } finally { setBusyId(null); }
  }
  async function confirmTransaction(item: TransactionResponse) {
    if (busyId !== null) return;
    setBusyId(item.id_transacao); setPageError(null);
    try {
      const confirmed = await api.updateTransaction(item.id_transacao, { status: 'confirmada' });
      setTransactions((old) => old.map((tx) => tx.id_transacao === confirmed.id_transacao ? confirmed : tx));
    } catch (err) { setPageError(message(err)); } finally { setBusyId(null); }
  }

  return <DashboardLayout userName={fullName}>
    <PageHeader title="Transações" subtitle="Registre, confira e corrija suas receitas e despesas."
      action={<Button icon={Plus} onClick={() => openModal()}>Nova Transação</Button>} />
    {pageError && <div role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
      <p>{pageError}</p><button className="mt-2 min-h-11 font-semibold underline" onClick={loadData}>Tentar novamente</button>
    </div>}
    <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-3">
      <Input label="Buscar transações" placeholder="Descrição ou categoria" value={filters.search} onChange={(e) => changeFilter('search', e.target.value)} />
      <Select label="Filtrar tipo" value={filters.tipo} onChange={(e) => changeFilter('tipo', e.target.value)}><option value="">Todos os tipos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></Select>
      <Select label="Filtrar situação" value={filters.status} onChange={(e) => changeFilter('status', e.target.value)}><option value="">Todas as situações</option><option value="confirmada">Confirmadas</option><option value="pendente">Pendentes</option><option value="prevista">Previstas — data futura</option></Select>
      <Select label="Filtrar categoria" value={filters.category} onChange={(e) => changeFilter('category', e.target.value)}><option value="">Todas as categorias</option>{categories.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nome}</option>)}</Select>
      <Input label="Data inicial" type="date" value={filters.start} onChange={(e) => changeFilter('start', e.target.value)} />
      <Input label="Data final" type="date" value={filters.end} onChange={(e) => changeFilter('end', e.target.value)} />
      <button className="min-h-11 text-left text-sm font-semibold text-accent-ink" onClick={() => { setFilters(emptyFilters); setPage(0); }}>Limpar filtros</button>
      {invalidRange && <p role="alert" className="text-sm text-danger">A data inicial deve ser anterior ou igual à final.</p>}
    </div>
    {loading ? <p role="status" className="text-sm text-muted">Carregando transações...</p> : filtered.length === 0 ? <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">{transactions.length ? 'Nenhuma transação encontrada com estes filtros.' : 'Nenhuma transação registrada ainda.'}</div> : <>
      <ul className="flex min-w-0 flex-col gap-3">{filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((item) => {
        const future = item.data_transacao > today;
        const isReceita = item.tipo === 'receita';
        return <li key={item.id_transacao} className="min-w-0 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-foreground">{item.descricao}</p><p className="mt-1 break-words text-xs text-muted">{categoriesById.get(item.id_categoria)?.nome ?? 'Sem categoria'} · {formatDate(item.data_transacao)}</p></div>
            <span className={'break-words text-sm font-semibold ' + (isReceita ? 'text-positive' : 'text-danger')}>{isReceita ? '+' : '-'}{formatCurrency(item.valor)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted">{future ? 'Prevista · fora do saldo atual' : item.status === 'pendente' ? 'Pendente · fora do saldo' : 'Confirmada'}</span>
            <div className="flex flex-wrap gap-1">
              {item.status === 'pendente' && !future && <Button size="sm" variant="secondary" icon={Check} disabled={busyId !== null} onClick={() => confirmTransaction(item)}>Confirmar</Button>}
              <button aria-label={'Editar transação ' + item.descricao} title={'Editar ' + item.descricao} disabled={busyId !== null} onClick={() => openModal(item)} className="flex h-11 w-11 items-center justify-center rounded-lg text-accent-ink hover:bg-hover disabled:opacity-40"><Pencil size={17} /></button>
              <button aria-label={'Excluir transação ' + item.descricao} title={'Excluir ' + item.descricao} disabled={busyId !== null} onClick={() => { setDeleteError(null); setDeleting(item); }} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-danger disabled:opacity-40"><Trash2 size={17} /></button>
            </div>
          </div>
        </li>;
      })}</ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted"><span>{filtered.length} transações · Página {currentPage + 1} de {pageCount}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</Button></div></div>
    </>}
    <TransactionFormModal open={modalOpen} transaction={editing} defaultTipo={defaultTipo} categories={categories} selectedCategory={selectedCategory} saving={saving} error={modalError} onClose={closeModal} onSubmit={handleSave}
      onNewCategory={(tipo) => { setCategoryDefaultTipo(tipo); setCategoryError(null); setCategoryModalOpen(true); }} />
    <CategoryFormModal open={categoryModalOpen} defaultTipo={categoryDefaultTipo} saving={categorySaving} error={categoryError} onClose={() => { if (!categorySaving) setCategoryModalOpen(false); }} onSubmit={handleCreateCategory} />
    <ConfirmDialog open={Boolean(deleting)} title="Excluir transação" description={'Excluir “' + (deleting?.descricao ?? '') + '”? Esta ação remove o lançamento e recalcula seus relatórios. Não é possível desfazer.'} saving={busyId !== null} error={deleteError} onClose={() => { if (busyId === null) setDeleting(null); }} onConfirm={handleDelete} />
  </DashboardLayout>;
}
