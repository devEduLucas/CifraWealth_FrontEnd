import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { session } from '../lib/session';
import { api, ApiError, type DashboardResponse } from '../lib/api';
import { PrimaryButton } from '../components/PrimaryButton/PrimaryButton';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = session.getUser();
  const [summary, setSummary] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then(setSummary)
      .catch((err: unknown) => {
        if (err instanceof ApiError) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    session.clear();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0B1020] px-6 text-white">
      <p className="text-lg text-slate-300">
        Olá, <span className="font-semibold text-emerald-400">{user?.nome ?? 'usuário'}</span>.
      </p>

      {loading && <p className="text-slate-400">Carregando resumo financeiro...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {summary && (
        <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#202634] bg-[#121827] p-4 text-center">
            <p className="text-xs text-slate-400">Saldo</p>
            <p className="text-lg font-bold text-emerald-400">R$ {summary.saldo.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-[#202634] bg-[#121827] p-4 text-center">
            <p className="text-xs text-slate-400">Receitas</p>
            <p className="text-lg font-bold text-white">R$ {summary.total_receitas.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-[#202634] bg-[#121827] p-4 text-center">
            <p className="text-xs text-slate-400">Despesas</p>
            <p className="text-lg font-bold text-white">R$ {summary.total_despesas.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link to="/categories" className="text-sm text-emerald-400 hover:underline">
          Categorias
        </Link>
        <Link to="/transactions" className="text-sm text-emerald-400 hover:underline">
          Transações
        </Link>
      </div>

      <div className="w-full max-w-xs">
        <PrimaryButton onClick={handleLogout} type="button">
          Sair
        </PrimaryButton>
      </div>
    </div>
  );
}
