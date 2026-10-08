import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, type CategoryResponse, type CategoryType } from '../lib/api';
import { Input } from '../components/Input/Input';
import { PrimaryButton } from '../components/PrimaryButton/PrimaryButton';

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<CategoryType>('despesa');
  const [saving, setSaving] = useState(false);

  function loadCategories() {
    setLoading(true);
    api
      .listCategories()
      .then(setCategories)
      .catch((err: unknown) => {
        if (err instanceof ApiError) setError(err.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadCategories, []);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    setError(null);
    api
      .createCategory({ nome, tipo })
      .then(() => {
        setNome('');
        loadCategories();
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao criar categoria.');
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: number) {
    setError(null);
    api
      .deleteCategory(id)
      .then(loadCategories)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao excluir categoria.');
      });
  }

  return (
    <div className="min-h-screen bg-[#0B1020] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <Link to="/dashboard" className="text-sm text-teal-400 hover:underline">
            Voltar ao dashboard
          </Link>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#202634] bg-[#121827] p-6 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Input
              label="Nome da categoria"
              placeholder="Ex: Alimentação"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">Tipo</label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as CategoryType)}
              className="h-[52px] rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none"
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </div>

          <PrimaryButton disabled={saving || !nome.trim()} className="sm:w-40">
            {saving ? 'Salvando...' : 'Adicionar'}
          </PrimaryButton>
        </form>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate-400">Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p className="text-slate-400">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li
                key={category.id_categoria}
                className="flex items-center justify-between rounded-xl border border-[#202634] bg-[#121827] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{category.nome}</p>
                  <p className="text-xs text-slate-400">
                    {category.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(category.id_categoria)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
