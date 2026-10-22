import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, ApiError, type CategoryResponse } from '../lib/api';
import { session } from '../lib/session';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Button } from '../components/Button/Button';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import {
  CategoryFormModal,
  type CategoryFormValues,
} from '../components/CategoryFormModal/CategoryFormModal';

export function CategoriesPage() {
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [deleting, setDeleting] = useState<CategoryResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  function loadCategories() {
    setLoading(true);
    setPageError(null);
    api
      .listCategories()
      .then(setCategories)
      .catch((err: unknown) => {
        setPageError(err instanceof ApiError ? err.message : 'Erro ao carregar categorias.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadCategories, []);

  const sortedCategories = [...categories].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  function openModal(category: CategoryResponse | null = null) {
    setEditing(category);
    setModalError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  function handleCreate(values: CategoryFormValues) {
    setSaving(true);
    setModalError(null);
    (editing ? api.updateCategory(editing.id_categoria, values) : api.createCategory(values))
      .then(() => {
        setModalOpen(false);
        loadCategories();
      })
      .catch((err: unknown) => {
        setModalError(err instanceof ApiError ? err.message : 'Erro ao criar categoria.');
      })
      .finally(() => setSaving(false));
  }

  function handleDelete() {
    if (!deleting || deletingBusy) return;
    setDeletingBusy(true);
    setDeleteError(null);
    api
      .deleteCategory(deleting.id_categoria)
      .then(() => { setDeleting(null); loadCategories(); })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : 'Erro ao excluir categoria.');
      }).finally(() => setDeletingBusy(false));
  }

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader
        title="Categorias"
        subtitle="Organize suas receitas e despesas."
        action={
          <Button icon={Plus} onClick={() => openModal()}>
            Nova Categoria
          </Button>
        }
      />

      {pageError && (
        <div role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          <p>{pageError}</p><button onClick={loadCategories} className="min-h-11 font-semibold underline">Tentar novamente</button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Carregando categorias...</p>
      ) : sortedCategories.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="text-sm text-muted">Nenhuma categoria cadastrada ainda.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {sortedCategories.map((category) => {
            const isReceita = category.tipo === 'receita';
            return (
              <li
                key={category.id_categoria}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{category.nome}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isReceita ? 'bg-positive/10 text-positive' : 'bg-danger/15 text-danger'
                    }`}
                  >
                    {isReceita ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                <button type="button" aria-label={`Editar categoria ${category.nome}`} title={`Editar ${category.nome}`} onClick={() => openModal(category)} className="flex h-11 w-11 items-center justify-center rounded-lg text-accent-ink hover:bg-hover"><Pencil size={17} /></button>
                <button
                  type="button"
                  aria-label={`Excluir categoria ${category.nome}`}
                  title={`Excluir ${category.nome}`}
                  onClick={() => { setDeleteError(null); setDeleting(category); }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CategoryFormModal
        open={modalOpen}
        category={editing}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleCreate}
      />
      <ConfirmDialog open={Boolean(deleting)} title="Excluir categoria" description={'Excluir “' + (deleting?.nome ?? '') + '”? Categorias com transações não podem ser removidas. Esta ação não pode ser desfeita.'} saving={deletingBusy} error={deleteError} onClose={() => { if (!deletingBusy) setDeleting(null); }} onConfirm={handleDelete} />
    </DashboardLayout>
  );
}
