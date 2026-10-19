import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import {
  api,
  ApiError,
  type CategoryResponse,
  type CategoryType,
  type TransactionResponse,
} from '../lib/api';
import { session } from '../lib/session';
import { formatCurrency, formatDate } from '../utils/format';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Button } from '../components/Button/Button';
import {
  TransactionFormModal,
  type TransactionFormValues,
} from '../components/TransactionFormModal/TransactionFormModal';
import {
  CategoryFormModal,
  type CategoryFormValues,
} from '../components/CategoryFormModal/CategoryFormModal';

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTipo, setDefaultTipo] = useState<CategoryType>('despesa');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryDefaultTipo, setCategoryDefaultTipo] = useState<CategoryType>('despesa');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

  function loadData() {
    setLoading(true);
    setPageError(null);
    Promise.all([api.listTransactions(), api.listCategories()])
      .then(([transactionsResult, categoriesResult]) => {
        setTransactions(transactionsResult);
        setCategories(categoriesResult);
      })
      .catch((err: unknown) => {
        setPageError(err instanceof ApiError ? err.message : 'Erro ao carregar transações.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  useEffect(() => {
    if (loading || searchParams.get('new') !== '1') return;
    setDefaultTipo(searchParams.get('tipo') === 'receita' ? 'receita' : 'despesa');
    setModalError(null);
    setSelectedCategory(null);
    setModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    next.delete('tipo');
    setSearchParams(next, { replace: true });
  }, [loading, searchParams, setSearchParams]);

  const categoriesById = new Map(categories.map((category) => [category.id_categoria, category]));
  const sortedTransactions = [...transactions].sort((a, b) =>
    b.data_transacao.localeCompare(a.data_transacao)
  );

  function openModal() {
    setDefaultTipo('despesa');
    setModalError(null);
    setSelectedCategory(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || categoryModalOpen) return;
    setModalOpen(false);
  }

  function closeCategoryModal() {
    if (categorySaving) return;
    setCategoryModalOpen(false);
  }

  function handleCreate(values: TransactionFormValues) {
    setSaving(true);
    setModalError(null);
    api
      .createTransaction(values)
      .then(() => {
        setModalOpen(false);
        loadData();
      })
      .catch((err: unknown) => {
        setModalError(err instanceof ApiError ? err.message : 'Erro ao criar transação.');
      })
      .finally(() => setSaving(false));
  }

  function handleCreateCategory(values: CategoryFormValues) {
    setCategorySaving(true);
    setCategoryError(null);
    api
      .createCategory(values)
      .then((created) => {
        setCategories((prev) => [...prev, created]);
        setSelectedCategory(created);
        setCategoryModalOpen(false);
      })
      .catch((err: unknown) => {
        setCategoryError(err instanceof ApiError ? err.message : 'Erro ao criar categoria.');
      })
      .finally(() => setCategorySaving(false));
  }

  function handleDelete(id: number) {
    setPageError(null);
    api
      .deleteTransaction(id)
      .then(loadData)
      .catch((err: unknown) => {
        setPageError(err instanceof ApiError ? err.message : 'Erro ao excluir transação.');
      });
  }

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader
        title="Transações"
        subtitle="Todas as suas receitas e despesas."
        action={
          <Button icon={Plus} onClick={openModal}>
            Nova Transação
          </Button>
        }
      />

      {pageError && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {pageError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando transações...</p>
      ) : sortedTransactions.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="text-sm text-muted">Nenhuma transação registrada ainda.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedTransactions.map((transaction) => {
            const isReceita = transaction.tipo === 'receita';
            const Icon = isReceita ? ArrowUpRight : ArrowDownRight;
            const category = categoriesById.get(transaction.id_categoria);

            return (
              <li
                key={transaction.id_transacao}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isReceita ? 'bg-positive/10 text-positive' : 'bg-danger/15 text-danger'
                  }`}
                >
                  <Icon size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{transaction.descricao}</p>
                  <p className="text-xs text-muted">
                    {category?.nome ?? 'Sem categoria'} · {formatDate(transaction.data_transacao)}
                    {transaction.status === 'pendente' && ' · Pendente'}
                  </p>
                </div>

                <span
                  className={`text-sm font-semibold ${isReceita ? 'text-positive' : 'text-danger'}`}
                >
                  {isReceita ? '+' : '-'}
                  {formatCurrency(transaction.valor)}
                </span>

                <button
                  type="button"
                  aria-label="Excluir transação"
                  onClick={() => handleDelete(transaction.id_transacao)}
                  className="text-subtle transition-colors hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <TransactionFormModal
        open={modalOpen}
        defaultTipo={defaultTipo}
        categories={categories}
        selectedCategory={selectedCategory}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleCreate}
        onNewCategory={(tipo) => {
          setCategoryDefaultTipo(tipo);
          setCategoryError(null);
          setCategoryModalOpen(true);
        }}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        defaultTipo={categoryDefaultTipo}
        saving={categorySaving}
        error={categoryError}
        onClose={closeCategoryModal}
        onSubmit={handleCreateCategory}
      />
    </DashboardLayout>
  );
}
