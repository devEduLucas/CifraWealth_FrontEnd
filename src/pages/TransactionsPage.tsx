import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  CalendarDays,
  Inbox,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  api,
  ApiError,
  type CategoryResponse,
  type CategoryType,
  type TransactionResponse,
} from '../lib/api';
import { useSessionUser } from '../hooks/useSessionUser';
import { formatCurrency, formatDate } from '../utils/format';
import { localDateOnly } from '../utils/reports';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { TransactionFiltersModal } from '../components/TransactionFiltersModal/TransactionFiltersModal';
import { TransactionFeed } from '../components/TransactionFeed/TransactionFeed';
import { FinancialPrivacyButton } from '../components/FinancialPrivacyButton/FinancialPrivacyButton';
import { useFinancialPrivacy } from '../hooks/useFinancialPrivacy';
import {
  EMPTY_TRANSACTION_FILTERS,
  selectTransactions,
  summarizeTransactions,
  transactionFilterCount,
  readTransactionFilters,
  writeTransactionFilters,
  type TransactionFilters,
} from '../utils/transactions';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import {
  TransactionFormModal,
  type TransactionFormValues,
} from '../components/TransactionFormModal/TransactionFormModal';
import {
  CategoryFormModal,
  type CategoryFormValues,
} from '../components/CategoryFormModal/CategoryFormModal';

const PAGE_SIZE = 20;
const message = (err: unknown) =>
  err instanceof ApiError
    ? err.message
    : 'Não foi possível concluir. Tente novamente.';

export function TransactionsPage() {
  const { valuesVisible } = useFinancialPrivacy();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSessionUser();
  const fullName = user
    ? (user.nome + ' ' + (user.sobrenome ?? '')).trim()
    : 'Usuário';
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [notice, setNotice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionResponse | null>(null);
  const [defaultTipo, setDefaultTipo] = useState<CategoryType>('despesa');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<TransactionResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryDefaultTipo, setCategoryDefaultTipo] =
    useState<CategoryType>('despesa');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResponse | null>(null);
  const [search, setSearch] = useState('');
  const filters = useMemo(
    () => ({ ...readTransactionFilters(searchParams), search }),
    [searchParams, search],
  );
  function setFilters(
    update:
      | TransactionFilters
      | ((current: TransactionFilters) => TransactionFilters),
  ) {
    const next = typeof update === 'function' ? update(filters) : update;
    setSearch(next.search);
    const params = writeTransactionFilters(searchParams, next);
    if (params.toString() !== searchParams.toString())
      setSearchParams(params, { replace: true });
  }
  const [page, setPage] = useState(0);
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem('cifrawealth:transaction-density') !== 'detailed'; }
    catch { return true; }
  });
  function changeDensity(next: boolean) {
    setCompact(next);
    try { localStorage.setItem('cifrawealth:transaction-density', next ? 'compact' : 'detailed'); }
    catch { /* The list remains usable when storage is unavailable. */ }
  }
  const listRef = useRef<HTMLElement>(null);
  const loadVersion = useRef(0);
  const today = localDateOnly();

  function loadData() {
    const version = ++loadVersion.current;
    setLoading(true);
    setPageError(null);
    Promise.all([api.listTransactions(), api.listCategories()])
      .then(([items, cats]) => {
        if (version === loadVersion.current) {
          setTransactions(items);
          setCategories(cats);
          setHasLoaded(true);
        }
      })
      .catch((err: unknown) => {
        if (version === loadVersion.current) setPageError(message(err));
      })
      .finally(() => {
        if (version === loadVersion.current) setLoading(false);
      });
  }
  function cancelLoad() {
    loadVersion.current++;
  }
  useEffect(() => {
    loadData();
    return cancelLoad;
  }, []);
  useEffect(() => {
    if (loading || searchParams.get('new') !== '1') return;
    setDefaultTipo(
      searchParams.get('tipo') === 'receita' ? 'receita' : 'despesa',
    );
    setEditing(null);
    setModalError(null);
    setSelectedCategory(null);
    setModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    next.delete('tipo');
    setSearchParams(next, { replace: true });
  }, [loading, searchParams, setSearchParams]);

  const filtered = useMemo(
    () => selectTransactions(transactions, categories, filters, today),
    [transactions, categories, filters, today],
  );
  const summary = useMemo(
    () => summarizeTransactions(filtered, today),
    [filtered, today],
  );
  const filterCount = transactionFilterCount(filters);
  const hasFilters = filterCount > 0 || Boolean(filters.search);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  function applyFilters(next: TransactionFilters) {
    setFilters(next);
    setPage(0);
    setFiltersOpen(false);
  }
  function resetFilters() {
    setFilters(EMPTY_TRANSACTION_FILTERS);
    setPage(0);
  }
  function removeFilter(keys: (keyof TransactionFilters)[]) {
    setFilters((old) => ({
      ...old,
      ...Object.fromEntries(
        keys.map((key) => [key, EMPTY_TRANSACTION_FILTERS[key]]),
      ),
    }));
    setPage(0);
  }
  const chips = [
    ...(filters.tipo
      ? [
          {
            label: filters.tipo === 'receita' ? 'Receitas' : 'Despesas',
            keys: ['tipo'] as (keyof TransactionFilters)[],
          },
        ]
      : []),
    ...(filters.status
      ? [
          {
            label:
              filters.status === 'confirmada'
                ? 'Confirmadas'
                : filters.status === 'pendente'
                  ? 'Pendentes'
                  : 'Previstas',
            keys: ['status'] as (keyof TransactionFilters)[],
          },
        ]
      : []),
    ...(filters.category
      ? [
          {
            label:
              categories.find(
                (category) =>
                  String(category.id_categoria) === filters.category,
              )?.nome ?? 'Categoria selecionada',
            keys: ['category'] as (keyof TransactionFilters)[],
          },
        ]
      : []),
    ...(filters.start || filters.end
      ? [
          {
            label:
              filters.start && filters.end
                ? `${formatDate(filters.start)} a ${formatDate(filters.end)}`
                : filters.start
                  ? `Desde ${formatDate(filters.start)}`
                  : `Até ${formatDate(filters.end)}`,
            keys: ['start', 'end'] as (keyof TransactionFilters)[],
          },
        ]
      : []),
    ...(filters.order === 'oldest'
      ? [
          {
            label: 'Mais antigas primeiro',
            keys: ['order'] as (keyof TransactionFilters)[],
          },
        ]
      : []),
  ];
  function changePage(next: number) {
    setPage(next);
    listRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function openModal(item: TransactionResponse | null = null) {
    setPageError(null);
    setEditing(item);
    setDefaultTipo(item?.tipo ?? 'despesa');
    setModalError(null);
    setSelectedCategory(null);
    setModalOpen(true);
  }
  function closeModal() {
    if (!saving && !categoryModalOpen) setModalOpen(false);
  }
  async function handleSave(values: TransactionFormValues) {
    if (saving) return;
    setSaving(true);
    setModalError(null);
    try {
      const item = editing
        ? await api.updateTransaction(editing.id_transacao, values)
        : await api.createTransaction(values);
      setTransactions((old) =>
        editing
          ? old.map((tx) => (tx.id_transacao === item.id_transacao ? item : tx))
          : [item, ...old],
      );
      setModalOpen(false);
      setNotice(
        editing
          ? 'Transação atualizada com sucesso.'
          : 'Transação registrada com sucesso.',
      );
    } catch (err) {
      setModalError(message(err));
    } finally {
      setSaving(false);
    }
  }
  async function handleCreateCategory(values: CategoryFormValues) {
    if (categorySaving) return;
    setCategorySaving(true);
    setCategoryError(null);
    try {
      const created = await api.createCategory(values);
      setCategories((old) => [...old, created]);
      setSelectedCategory(created);
      setCategoryModalOpen(false);
    } catch (err) {
      setCategoryError(message(err));
    } finally {
      setCategorySaving(false);
    }
  }
  async function handleDelete() {
    if (!deleting || busyId !== null) return;
    setBusyId(deleting.id_transacao);
    setDeleteError(null);
    try {
      await api.deleteTransaction(deleting.id_transacao);
      setTransactions((old) =>
        old.filter((item) => item.id_transacao !== deleting.id_transacao),
      );
      setDeleting(null);
      setNotice('Transação excluída. O resumo foi atualizado.');
    } catch (err) {
      setDeleteError(message(err));
    } finally {
      setBusyId(null);
    }
  }
  async function confirmTransaction(item: TransactionResponse) {
    if (busyId !== null) return;
    setBusyId(item.id_transacao);
    setPageError(null);
    try {
      const confirmed = await api.updateTransaction(item.id_transacao, {
        status: 'confirmada',
      });
      setTransactions((old) =>
        old.map((tx) =>
          tx.id_transacao === confirmed.id_transacao ? confirmed : tx,
        ),
      );
      setNotice('Transação confirmada e incluída no saldo.');
    } catch (err) {
      setPageError(message(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader
        title="Transações"
        subtitle="Registre, encontre e acompanhe suas movimentações."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FinancialPrivacyButton />
            <Button icon={Plus} onClick={() => openModal()}>
              Nova Transação
            </Button>
          </div>
        }
      />

      {pageError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
        >
          <p>{pageError}</p>
          <button
            type="button"
            className="mt-2 min-h-11 font-semibold underline"
            onClick={loadData}
          >
            Tentar novamente
          </button>
        </div>
      )}
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

      {!loading && hasLoaded && (
        <section aria-label="Resumo das transações" className="mb-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              {
                label: 'Receitas confirmadas',
                amount: summary.income,
                icon: ArrowDownLeft,
                tone: 'text-positive',
                background: 'bg-positive/10',
              },
              {
                label: 'Despesas confirmadas',
                amount: summary.expense,
                icon: ArrowUpRight,
                tone: 'text-danger',
                background: 'bg-danger/10',
              },
              {
                label: 'Resultado confirmado',
                amount: summary.result,
                icon: ArrowRightLeft,
                tone: summary.result < 0 ? 'text-danger' : 'text-foreground',
                background: 'bg-accent/10',
              },
            ].map(({ label, amount, icon: Icon, tone, background }) => (
              <div
                key={label}
                className="min-w-0 rounded-2xl border border-line bg-surface p-2.5 sm:p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`hidden rounded-lg p-2 sm:inline-flex ${background} ${tone}`}
                  >
                    <Icon size={17} />
                  </span>
                  <p className="text-[11px] font-medium leading-4 text-muted sm:text-xs">{label}</p>
                </div>
                <p
                  className={`mt-2 max-w-full break-words text-sm font-bold tabular-nums tracking-tight sm:mt-3 sm:text-2xl ${valuesVisible ? tone : 'text-muted'}`}
                >
                  {valuesVisible ? formatCurrency(amount) : 'R$ ••••••'}
                </p>
              </div>
            ))}
          </div>
          <details className="mt-2 text-xs leading-5 text-muted">
            <summary className="min-h-8 cursor-pointer py-1 font-medium">Como os totais são calculados</summary>
            <p className="mt-1">
            Resumo de todos os resultados da busca, em todas as páginas. Somente
            confirmadas até hoje entram nos valores.
            {summary.pending > 0 || summary.scheduled > 0
              ? ` Fora do saldo: ${summary.pending} pendentes e ${summary.scheduled} previstas.`
              : ''}
            </p>
          </details>
        </section>
      )}

      <section
        aria-label="Busca e filtros"
        className="mb-5 rounded-2xl border border-line bg-surface p-3 sm:p-4"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <Input
            label="Buscar transações"
            icon={<Search size={18} />}
            placeholder="Descrição ou categoria"
            value={filters.search}
            onChange={(event) => {
              setFilters((old) => ({ ...old, search: event.target.value }));
              setPage(0);
            }}
          />
          <button
            type="button"
            aria-label="Filtrar transações"
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(true)}
            disabled={loading || !hasLoaded}
            className={`inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors disabled:opacity-40 sm:px-4 ${filterCount ? 'border-accent bg-accent/10 text-accent-ink' : 'border-line-strong text-foreground hover:bg-elevated'}`}
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>Filtros</span>
            {filterCount > 0 && (
              <span
                aria-hidden="true"
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-on-accent"
              >
                {filterCount}
              </span>
            )}
          </button>
        </div>
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filters.search && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => removeFilter(['search'])}
                className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-line bg-elevated px-3 text-xs font-medium text-foreground"
              >
                <span className="min-w-0 break-words">
                  Busca: {filters.search}
                </span>
                <X size={14} aria-hidden="true" className="shrink-0" />
              </button>
            )}
            {chips.map((chip) => (
              <button
                key={chip.keys.join('-')}
                type="button"
                aria-label={'Remover filtro ' + chip.label}
                onClick={() => removeFilter(chip.keys)}
                className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 text-xs font-medium text-accent-ink"
              >
                <span className="min-w-0 break-words">{chip.label}</span>
                <X size={14} aria-hidden="true" className="shrink-0" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-10 px-2 text-xs font-semibold text-accent-ink hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <section
        ref={listRef}
        aria-labelledby="transaction-list-title"
        className="min-w-0 scroll-mt-28"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              id="transaction-list-title"
              className="text-lg font-bold text-foreground"
            >
              Suas movimentações
            </h2>
            <p
              className="mt-1 text-xs text-muted"
              role="status"
              aria-live="polite"
            >
              {loading
                ? 'Carregando transações...'
                : hasLoaded
                  ? `${filtered.length} ${filtered.length === 1 ? 'transação encontrada' : 'transações encontradas'}${filterCount || filters.search ? ' com a seleção atual' : ' no histórico'}`
                  : 'Não foi possível carregar o histórico.'}
            </p>
          </div>
          {hasLoaded && filtered.length > 0 && <div role="group" aria-label="Densidade da lista" className="inline-flex rounded-xl border border-line bg-surface p-1">
            <button type="button" aria-pressed={compact} onClick={() => changeDensity(true)} className={'min-h-11 rounded-lg px-3 text-xs font-semibold ' + (compact ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:bg-elevated')}>Compacta</button>
            <button type="button" aria-pressed={!compact} onClick={() => changeDensity(false)} className={'min-h-11 rounded-lg px-3 text-xs font-semibold ' + (!compact ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:bg-elevated')}>Detalhada</button>
          </div>}
        </div>
        <p className="sr-only mb-3 items-center gap-1.5 text-xs text-muted sm:not-sr-only sm:inline-flex">
          <CalendarDays size={14} aria-hidden="true" />
          {filters.order === 'oldest' ? 'Mais antigas primeiro' : 'Mais recentes primeiro'}
        </p>
        {loading ? (
          <div aria-hidden="true" className="space-y-3">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="h-32 rounded-2xl border border-line bg-elevated/50"
              />
            ))}
          </div>
        ) : hasLoaded && filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-5 py-10 text-center">
            <Inbox
              size={30}
              aria-hidden="true"
              className="mx-auto text-subtle"
            />
            <h3 className="mt-4 text-base font-bold text-foreground">
              {transactions.length
                ? 'Nenhuma transação encontrada com estes filtros.'
                : 'Seu histórico começa no primeiro registro'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {transactions.length
                ? 'Experimente outra descrição, categoria ou período para encontrar o lançamento.'
                : 'Adicione uma receita ou despesa para acompanhar seu dinheiro por aqui.'}
            </p>
            <Button
              className="mt-5"
              variant={transactions.length ? 'outline' : 'primary'}
              onClick={transactions.length ? resetFilters : () => openModal()}
            >
              {transactions.length
                ? 'Ver todas as transações'
                : 'Registrar primeira transação'}
            </Button>
          </div>
        ) : (
          hasLoaded && (
            <>
              <TransactionFeed
                transactions={filtered.slice(
                  currentPage * PAGE_SIZE,
                  (currentPage + 1) * PAGE_SIZE,
                )}
                categories={categories}
                today={today}
                valuesVisible={valuesVisible}
                compact={compact}
                busyId={busyId}
                onEdit={openModal}
                onDelete={(item) => {
                  setDeleteError(null);
                  setDeleting(item);
                }}
                onConfirm={(item) => void confirmTransaction(item)}
              />
              <nav
                aria-label="Paginação das transações"
                className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted"
              >
                <span>
                  Mostrando {currentPage * PAGE_SIZE + 1}–
                  {Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} de{' '}
                  {filtered.length} · Página {currentPage + 1} de {pageCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 0}
                    onClick={() => changePage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage + 1 >= pageCount}
                    onClick={() => changePage(currentPage + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </nav>
            </>
          )
        )}
      </section>

      {filtersOpen && (
        <TransactionFiltersModal
          filters={filters}
          transactions={transactions}
          categories={categories}
          today={today}
          onClose={() => setFiltersOpen(false)}
          onApply={applyFilters}
        />
      )}
      <TransactionFormModal
        open={modalOpen}
        transaction={editing}
        defaultTipo={defaultTipo}
        categories={categories}
        selectedCategory={selectedCategory}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleSave}
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
        onClose={() => {
          if (!categorySaving) setCategoryModalOpen(false);
        }}
        onSubmit={handleCreateCategory}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir transação"
        description={
          'Excluir “' +
          (deleting?.descricao ?? '') +
          '”? Esta ação remove o lançamento e recalcula seus relatórios. Não é possível desfazer.'
        }
        saving={busyId !== null}
        error={deleteError}
        onClose={() => {
          if (busyId === null) setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
