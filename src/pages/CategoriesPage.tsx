import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { FinancialPrivacyButton } from '../components/FinancialPrivacyButton/FinancialPrivacyButton';
import {
  CategoryFormModal,
  type CategoryFormValues,
} from '../components/CategoryFormModal/CategoryFormModal';
import { CategoryPeriodModal } from '../components/CategoryPeriodModal/CategoryPeriodModal';
import { CategoryToolbar } from '../components/CategoryToolbar/CategoryToolbar';
import { CategoryCollections } from '../components/CategoryCollections/CategoryCollections';
import { CategoryManager } from '../components/CategoryManager/CategoryManager';
import { CategoryAnalysis } from '../components/CategoryAnalysis/CategoryAnalysis';
import {
  buildCategoryUsage,
  orderCategoryUsage,
  type CategoryPeriod,
  type CategoryOrder,
  type CategoryMetric,
} from '../utils/categoryUsage';
import { formatDate } from '../utils/format';
import { localDateOnly } from '../utils/reports';
import { transactionDateRange } from '../utils/transactions';

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'usage' ? 'usage' : 'manage';
  const selectedType = searchParams.get('tipo') === 'receita' ? 'receita' : searchParams.get('tipo') === 'despesa' ? 'despesa' : null;
  const type: CategoryType = selectedType ?? 'despesa';
  function changeView(next: 'usage' | 'manage') {
    const updated = new URLSearchParams(searchParams);
    updated.set('view', next);
    updated.delete('tipo');
    setSearch('');
    setSearchParams(updated);
  }
  function changeType(next: CategoryType | null) {
    const updated = new URLSearchParams(searchParams);
    if (next) updated.set('tipo', next);
    else updated.delete('tipo');
    setSearch('');
    setSearchParams(updated);
  }
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
  const visibleCategories = useMemo(
    () =>
      orderCategoryUsage(usage, type, 'name', search).sort((a, b) => usageAvailable && order === 'count' ? b.historyCount - a.historyCount || a.category.nome.localeCompare(b.category.nome, 'pt-BR') : 0),
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
      const updated = new URLSearchParams(searchParams);
      updated.set('view', 'manage');
      updated.set('tipo', result.tipo);
      setSearchParams(updated);
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
      <CategoryToolbar
        view={view}
        type={selectedType}
        periodLabel={periodLabel}
        currentMonth={period.start === today.slice(0, 7) + '-01' && period.end === today}
        periodOpen={periodOpen}
        disabled={loading || !categoriesAvailable}
        onViewChange={changeView}
        onTypeChange={changeType}
        onPeriodOpen={() => setPeriodOpen(true)}
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
      {loading ? <p role="status" className="text-sm text-muted">Carregando categorias...</p> : categoriesAvailable && <>
        {view === 'manage' ? selectedType ? <CategoryManager
          type={selectedType} items={visibleCategories} search={search} order={order} usageAvailable={usageAvailable}
          onSearch={setSearch} onOrder={setOrder} onBack={() => changeType(null)}
          onEdit={openModal} onDelete={(category) => { setDeleteError(null); setDeleting(category); }}
        /> : <CategoryCollections categories={categories} onSelect={changeType} /> : usageError ? <div role="alert" className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground"><p>{usageError}</p><button type="button" onClick={loadData} className="mt-2 min-h-11 font-semibold text-accent-ink underline">Tentar novamente</button></div> : <CategoryAnalysis items={usage} type={selectedType} metric={metric} period={period} periodLabel={periodLabel} valuesVisible={valuesVisible} onMetricChange={setMetric} />}
      </>}
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
