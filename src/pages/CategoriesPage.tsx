import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, ApiError, type CategoryResponse } from '../lib/api';
import { session } from '../lib/session';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Button } from '../components/Button/Button';
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

  function loadCategories() {
    setLoading(true);
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

  function openModal() {
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
    api
      .createCategory(values)
      .then(() => {
        setModalOpen(false);
        loadCategories();
      })
      .catch((err: unknown) => {
        setModalError(err instanceof ApiError ? err.message : 'Erro ao criar categoria.');
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: number) {
    setPageError(null);
    api
      .deleteCategory(id)
      .then(loadCategories)
      .catch((err: unknown) => {
        setPageError(err instanceof ApiError ? err.message : 'Erro ao excluir categoria.');
      });
  }

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader
        title="Categorias"
        subtitle="Organize suas receitas e despesas."
        action={
          <Button icon={Plus} onClick={openModal}>
            Nova Categoria
          </Button>
        }
      />

      {pageError && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {pageError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Carregando categorias...</p>
      ) : sortedCategories.length === 0 ? (
        <div className="rounded-2xl border border-[#202634] bg-[#121827] p-10 text-center">
          <p className="text-sm text-slate-400">Nenhuma categoria cadastrada ainda.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {sortedCategories.map((category) => {
            const isReceita = category.tipo === 'receita';
            return (
              <li
                key={category.id_categoria}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#202634] bg-[#121827] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{category.nome}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isReceita ? 'bg-teal-500/15 text-teal-400' : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {isReceita ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Excluir categoria"
                  onClick={() => handleDelete(category.id_categoria)}
                  className="text-slate-500 transition-colors hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <CategoryFormModal
        open={modalOpen}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleCreate}
      />
    </DashboardLayout>
  );
}
