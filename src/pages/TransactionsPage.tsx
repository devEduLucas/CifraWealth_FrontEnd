import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  ApiError,
  type CategoryResponse,
  type CategoryType,
  type TransactionResponse,
} from '../lib/api';
import { Input } from '../components/Input/Input';
import { PrimaryButton } from '../components/PrimaryButton/PrimaryButton';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<CategoryType>('despesa');
  const [idCategoria, setIdCategoria] = useState<number | ''>('');
  const [dataTransacao, setDataTransacao] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([api.listTransactions(), api.listCategories()])
      .then(([transactionsResult, categoriesResult]) => {
        setTransactions(transactionsResult);
        setCategories(categoriesResult);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) setError(err.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  const categoriasFiltradas = categories.filter((category) => category.tipo === tipo);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const valorNumerico = Number(valor.replace(',', '.'));
    if (!descricao.trim() || !idCategoria || !valorNumerico || valorNumerico <= 0) return;

    setSaving(true);
    setError(null);
    api
      .createTransaction({
        descricao,
        valor: valorNumerico,
        tipo,
        id_categoria: idCategoria,
        data_transacao: dataTransacao,
      })
      .then(() => {
        setDescricao('');
        setValor('');
        setIdCategoria('');
        loadData();
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao criar transação.');
      })
      .finally(() => setSaving(false));
  }

  function handleDelete(id: number) {
    api
      .deleteTransaction(id)
      .then(loadData)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao excluir transação.');
      });
  }

  return (
    <div className="min-h-screen bg-[#0B1020] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
          <Link to="/dashboard" className="text-sm text-teal-400 hover:underline">
            Voltar ao dashboard
          </Link>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-[#202634] bg-[#121827] p-6 sm:grid-cols-2"
        >
          <Input
            label="Descrição"
            icon={<span />}
            placeholder="Ex: Supermercado"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
          />

          <Input
            label="Valor"
            icon={<span />}
            placeholder="0,00"
            inputMode="decimal"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">Tipo</label>
            <select
              value={tipo}
              onChange={(event) => {
                setTipo(event.target.value as CategoryType);
                setIdCategoria('');
              }}
              className="h-[52px] rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none"
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-400">Categoria</label>
              <Link to="/categories" className="text-xs font-medium text-teal-400 hover:underline">
                + Nova categoria
              </Link>
            </div>
            <select
              value={idCategoria}
              onChange={(event) => setIdCategoria(Number(event.target.value) || '')}
              className="h-[52px] rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none"
            >
              <option value="">Selecione</option>
              {categoriasFiltradas.map((category) => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nome}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Data"
            icon={<span />}
            type="date"
            value={dataTransacao}
            onChange={(event) => setDataTransacao(event.target.value)}
          />

          <div className="flex items-end">
            <PrimaryButton disabled={saving} className="w-full">
              {saving ? 'Salvando...' : 'Adicionar transação'}
            </PrimaryButton>
          </div>
        </form>

        {categoriasFiltradas.length === 0 && !loading && (
          <p className="mb-4 text-sm text-slate-400">
            Nenhuma categoria de {tipo === 'receita' ? 'receita' : 'despesa'} cadastrada ainda.{' '}
            <Link to="/categories" className="text-teal-400 hover:underline">
              Cadastrar categoria
            </Link>
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-slate-400">Carregando transações...</p>
        ) : transactions.length === 0 ? (
          <p className="text-slate-400">Nenhuma transação registrada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((transaction) => (
              <li
                key={transaction.id_transacao}
                className="flex items-center justify-between rounded-xl border border-[#202634] bg-[#121827] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{transaction.descricao}</p>
                  <p className="text-xs text-slate-400">{transaction.data_transacao}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      transaction.tipo === 'receita' ? 'text-teal-400' : 'text-red-400'
                    }
                  >
                    {transaction.tipo === 'receita' ? '+' : '-'}R$ {transaction.valor.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDelete(transaction.id_transacao)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
