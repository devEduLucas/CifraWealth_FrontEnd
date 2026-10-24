import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  api,
  ApiError,
  type CategoryResponse,
  type CategoryType,
  type TransactionResponse,
} from '../lib/api';
import { useSessionUser } from '../hooks/useSessionUser';
import { useFinancialPrivacy } from '../hooks/useFinancialPrivacy';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Select } from '../components/Select/Select';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { FinancialPrivacyButton } from '../components/FinancialPrivacyButton/FinancialPrivacyButton';
import {
  CategoryFormModal,
  type CategoryFormValues,
} from '../components/CategoryFormModal/CategoryFormModal';
import { CategoryIcon } from '../components/CategoryIcon/CategoryIcon';
import { CategoryUsageChart } from '../components/CategoryUsageChart/CategoryUsageChart';
import { CategoryPeriodModal } from '../components/CategoryPeriodModal/CategoryPeriodModal';
import {
  buildCategoryUsage,
  categoryUsageSummary,
  orderCategoryUsage,
  categoryTransactionsLink,
  type CategoryPeriod,
  type CategoryOrder,
  type CategoryMetric,
} from '../utils/categoryUsage';
import { categoryColor } from '../utils/categoryAppearance';
import { formatCurrency, formatDate } from '../utils/format';
import { localDateOnly } from '../utils/reports';
import { transactionDateRange } from '../utils/transactions';

export function CategoriesPage() {
  const user = useSessionUser();
  const fullName = user
    ? `${user.nome} ${user.sobrenome ?? ''}`.trim()
    : 'Usuário';
  const { valuesVisible } = useFinancialPrivacy();
  const today = localDateOnly();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [categoriesAvailable, setCategoriesAvailable] = useState(false);
  const [usageAvailable, setUsageAvailable] = useState(false);
  const [notice, setNotice] = useState('');
  const [type, setType] = useState<CategoryType>('despesa');
  const [metric, setMetric] = useState<CategoryMetric>('amount');
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<CategoryOrder>('name');
  const [period, setPeriod] = useState<CategoryPeriod>(() =>
    transactionDateRange('month', today),
  );
  const [periodOpen, setPeriodOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [deleting, setDeleting] = useState<CategoryResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const version = useRef(0);

  function loadData() {
    const current = ++version.current;
    setLoading(true);
    setPageError(null);
    setUsageError(null);
    Promise.allSettled([api.listCategories(), api.listTransactions()])
      .then(([cats, items]) => {
        if (current !== version.current) return;
        setCategoriesAvailable(cats.status === 'fulfilled');
        setUsageAvailable(items.status === 'fulfilled');
        if (cats.status === 'fulfilled') setCategories(cats.value);
        else
          setPageError(
            cats.reason instanceof ApiError
              ? cats.reason.message
              : 'Não foi possível carregar suas categorias.',
          );
        if (items.status === 'fulfilled') setTransactions(items.value);
        else
          setUsageError(
            'Não foi possível carregar o uso das categorias. Você ainda pode gerenciar suas categorias.',
          );
      })
      .finally(() => {
        if (current === version.current) setLoading(false);
      });
  }
  function cancelLoad() {
    version.current++;
  }
  useEffect(() => {
    loadData();
    return cancelLoad;
  }, []);

  const usage = useMemo(
    () => buildCategoryUsage(categories, transactions, period, today),
    [categories, transactions, period, today],
  );
  const summary = useMemo(
    () => categoryUsageSummary(usage, type),
    [usage, type],
  );
  const visibleCategories = useMemo(
    () =>
      orderCategoryUsage(usage, type, usageAvailable ? order : 'name', search),
    [usage, type, order, search, usageAvailable],
  );
  const usageById = new Map(
    usage.map((item) => [item.category.id_categoria, item]),
  );
  const periodLabel =
    !period.start && !period.end
      ? 'Todo o período'
      : period.start && period.end
        ? `${formatDate(period.start)} a ${formatDate(period.end)}`
        : period.start
          ? `Desde ${formatDate(period.start)}`
          : `Até ${formatDate(period.end)}`;

  function openModal(category: CategoryResponse | null = null) {
    setEditing(category);
    setModalError(null);
    setModalOpen(true);
  }
  function closeModal() {
    if (!saving) setModalOpen(false);
  }
  async function handleSave(values: CategoryFormValues) {
    if (saving) return;
    setSaving(true);
    setModalError(null);
    try {
      const result = editing
        ? await api.updateCategory(editing.id_categoria, values)
        : await api.createCategory(values);
      setCategories((old) =>
        editing
          ? old.map((category) =>
              category.id_categoria === result.id_categoria ? result : category,
            )
          : [...old, result],
      );
      setType(result.tipo);
      setSearch('');
      setModalOpen(false);
      setNotice(
        editing
          ? 'Categoria atualizada com sucesso.'
          : 'Categoria criada com sucesso.',
      );
    } catch (err) {
      setModalError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a categoria.',
      );
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete() {
    if (!deleting || deletingBusy) return;
    setDeletingBusy(true);
    setDeleteError(null);
    try {
      await api.deleteCategory(deleting.id_categoria);
      setCategories((old) =>
        old.filter(
          (category) => category.id_categoria !== deleting.id_categoria,
        ),
      );
      setDeleting(null);
      setNotice('Categoria excluída com sucesso.');
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a categoria.',
      );
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader
        title="Categorias"
        subtitle="Entenda para onde vai seu dinheiro e organize cada tipo de movimentação."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FinancialPrivacyButton />
            <Button
              icon={Plus}
              disabled={!categoriesAvailable || loading}
              onClick={() => openModal()}
            >
              Nova Categoria
            </Button>
          </div>
        }
      />
      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center gap-3 rounded-xl border border-positive/25 bg-positive/10 p-3 text-sm text-foreground"
        >
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            aria-label="Dispensar aviso"
            onClick={() => setNotice('')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-hover"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      {pageError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
        >
          <p>{pageError}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-2 min-h-11 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {loading ? (
        <p role="status" className="text-sm text-muted">
          Carregando categorias...
        </p>
      ) : (
        categoriesAvailable && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Tipo das categorias"
                className="inline-flex max-w-full gap-1 rounded-xl border border-line bg-surface p-1"
              >
                {(
                  [
                    { value: 'despesa', label: 'Despesas', icon: ArrowUpRight },
                    {
                      value: 'receita',
                      label: 'Receitas',
                      icon: ArrowDownLeft,
                    },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={type === value}
                    onClick={() => {
                      setType(value);
                      setSearch('');
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${type === value ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:bg-elevated'}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Alterar período das categorias"
                aria-haspopup="dialog"
                aria-expanded={periodOpen}
                onClick={() => setPeriodOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-sm font-semibold text-foreground hover:bg-elevated"
              >
                <CalendarDays size={17} aria-hidden="true" />
                Período
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              {periodLabel} · Somente transações confirmadas até hoje.
              Pendências e datas futuras ficam fora dos indicadores.
            </p>
            {usageError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground"
              >
                <p>{usageError}</p>
                <button
                  type="button"
                  onClick={loadData}
                  className="mt-2 min-h-11 font-semibold text-accent-ink underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                <section
                  aria-label="Resumo das categorias"
                  className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  <div className="col-span-2 flex min-w-0 flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-line bg-surface p-4 sm:col-span-1 sm:block">
                    <p className="text-xs text-muted">
                      {type === 'despesa'
                        ? 'Total em despesas'
                        : 'Total em receitas'}
                    </p>
                    <p className="max-w-full break-words text-2xl font-bold tabular-nums text-foreground sm:mt-2">
                      {valuesVisible
                        ? formatCurrency(summary.amount)
                        : 'R$ ••••••'}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-2xl border border-line bg-surface p-3 sm:p-4">
                    <p className="text-xs text-muted">
                      Lançamentos confirmados
                    </p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                      {summary.count}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-2xl border border-line bg-surface p-3 sm:p-4">
                    <p className="text-xs text-muted">
                      Categorias usadas no período
                    </p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                      {summary.used}
                      <span className="ml-2 text-sm font-medium text-muted">
                        de {summary.total}
                      </span>
                    </p>
                  </div>
                </section>
                <CategoryUsageChart
                  items={usage}
                  type={type}
                  metric={metric}
                  period={period}
                  valuesVisible={valuesVisible}
                  onMetricChange={setMetric}
                />
              </>
            )}

            <section aria-labelledby="category-list-title" className="mt-7">
              <div className="mb-4">
                <h2
                  id="category-list-title"
                  className="text-lg font-bold text-foreground"
                >
                  Suas categorias de{' '}
                  {type === 'despesa' ? 'despesa' : 'receita'}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Personalize nome, ícone e cor. Categorias com lançamentos
                  conservam o tipo e não podem ser excluídas.
                </p>
              </div>
              <div className="mb-4 grid gap-3 min-[600px]:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)]">
                <Input
                  label="Buscar categorias"
                  icon={<Search size={18} />}
                  placeholder="Nome da categoria"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Select
                  label="Ordenar categorias"
                  value={usageAvailable ? order : 'name'}
                  onChange={(event) =>
                    setOrder(event.target.value as CategoryOrder)
                  }
                >
                  <option value="name">Nome: A–Z</option>
                  <option value="amount" disabled={!usageAvailable}>
                    Maior valor
                  </option>
                  <option value="count" disabled={!usageAvailable}>
                    Mais utilizadas
                  </option>
                </Select>
              </div>
              <p
                role="status"
                aria-live="polite"
                className="mb-4 text-xs text-muted"
              >
                {visibleCategories.length}{' '}
                {visibleCategories.length === 1
                  ? 'categoria encontrada'
                  : 'categorias encontradas'}
                {search ? ' na busca' : ''}
              </p>
              {visibleCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-6 text-center">
                  <Tag
                    size={25}
                    aria-hidden="true"
                    className="mx-auto text-subtle"
                  />
                  <p className="mt-3 text-sm text-muted">
                    {search
                      ? 'Nenhuma categoria encontrada com esse nome.'
                      : `Nenhuma categoria de ${type === 'despesa' ? 'despesa' : 'receita'} cadastrada ainda.`}
                  </p>
                  {search ? (
                    <Button
                      variant="ghost"
                      onClick={() => setSearch('')}
                      className="mt-3"
                    >
                      Limpar busca
                    </Button>
                  ) : (
                    <Button onClick={() => openModal()} className="mt-4">
                      Criar primeira categoria
                    </Button>
                  )}
                </div>
              ) : (
                <ul
                  aria-label="Lista de categorias"
                  className="grid grid-cols-1 gap-3 lg:grid-cols-2"
                >
                  {visibleCategories.map(
                    ({ category, amount, count, historyCount }) => (
                      <li
                        key={category.id_categoria}
                        className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <CategoryIcon
                            icon={category.icone}
                            color={category.cor}
                            type={category.tipo}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-base font-semibold text-foreground">
                              {category.nome}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted">
                              <span
                                aria-hidden="true"
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor: categoryColor(
                                    category.cor,
                                    type,
                                  ),
                                }}
                              />
                              {type === 'receita' ? 'Receita' : 'Despesa'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="break-words text-xl font-bold tabular-nums text-foreground">
                            {!usageAvailable
                              ? 'Uso indisponível'
                              : valuesVisible
                                ? formatCurrency(amount)
                                : 'R$ ••••••'}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted">
                            {!usageAvailable
                              ? 'Tente carregar novamente para consultar os indicadores.'
                              : count
                                ? `${count} ${count === 1 ? 'lançamento confirmado' : 'lançamentos confirmados'} no período`
                                : 'Sem uso neste período'}
                          </p>
                          {usageAvailable &&
                            count === 0 &&
                            historyCount > 0 && (
                              <p className="mt-1 text-xs leading-5 text-muted">
                                Possui lançamentos fora do período ou não
                                confirmados.
                              </p>
                            )}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                          <Link
                            to={categoryTransactionsLink(category, period)}
                            aria-label={`Ver transações de ${category.nome} no período selecionado`}
                            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline"
                          >
                            Ver transações
                            <ArrowUpRight size={16} aria-hidden="true" />
                          </Link>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              aria-label={`Editar categoria ${category.nome}`}
                              title={`Editar ${category.nome}`}
                              onClick={() => openModal(category)}
                              className="flex h-11 w-11 items-center justify-center rounded-xl text-accent-ink hover:bg-elevated"
                            >
                              <Pencil size={17} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Excluir categoria ${category.nome}`}
                              title={`Excluir ${category.nome}`}
                              onClick={() => {
                                setDeleteError(null);
                                setDeleting(category);
                              }}
                              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-danger/10 hover:text-danger"
                            >
                              <Trash2 size={17} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </section>
          </>
        )
      )}
      {periodOpen && (
        <CategoryPeriodModal
          period={period}
          today={today}
          onClose={() => setPeriodOpen(false)}
          onApply={(next) => {
            setPeriod(next);
            setPeriodOpen(false);
          }}
        />
      )}
      <CategoryFormModal
        open={modalOpen}
        category={editing}
        defaultTipo={type}
        inUse={
          usageAvailable &&
          Boolean(editing && usageById.get(editing.id_categoria)?.historyCount)
        }
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir categoria"
        description={
          'Excluir “' +
          (deleting?.nome ?? '') +
          '”? Categorias com transações não podem ser removidas. Esta ação não pode ser desfeita.'
        }
        saving={deletingBusy}
        error={deleteError}
        onClose={() => {
          if (!deletingBusy) setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
