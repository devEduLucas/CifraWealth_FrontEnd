import { useModalFocus } from '../../hooks/useModalFocus';
import { useState, type FormEvent } from 'react';
import { PiggyBank, X, PlusCircle } from 'lucide-react';
import { Button } from '../Button/Button';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { formatCurrency } from '../../utils/validation';
import { getGoalProgress, getGoalProgressColorClassName } from '../../utils/goals';
import type { GoalViewModel } from '../../types/goals.types';

interface ContributeGoalModalProps {
  open: boolean;
  goal: GoalViewModel | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (valor: number) => void;
}

export function ContributeGoalModal({
  open,
  goal,
  saving,
  error,
  onClose,
  onSubmit,
}: ContributeGoalModalProps) {
  const dialogRef = useModalFocus(open, saving, onClose);
  const [valor, setValor] = useState('');

  if (!open || !goal) return null;

  const progress = getGoalProgress(goal);
  const progressColor = getGoalProgressColorClassName(goal.status);
  const faltam = Math.max(goal.valorObjetivo - goal.valorAtual, 0);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const valorNumerico = Number(valor.replace(',', '.'));
    if (saving || !Number.isFinite(valorNumerico) || valorNumerico <= 0) return;
    onSubmit(valorNumerico);

  }

  function handleQuickAdd(amount: number) {
    setValor(String(amount));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contribution-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#202634] bg-[#121827] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
              <PiggyBank size={18} />
            </span>
            <h2 id="contribution-title" className="text-base font-semibold text-white">Registrar valor guardado</h2>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#1c2333] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#202634] bg-[#161F32] p-4">
          <p className="text-sm font-semibold text-white">{goal.titulo}</p>
          <div className="mt-2 flex items-baseline justify-between text-xs text-slate-400">
            <span>
              Atual: <strong className="text-teal-400">{formatCurrency(goal.valorAtual)}</strong> de{' '}
              {formatCurrency(goal.valorObjetivo)}
            </span>
            <span className="font-semibold text-teal-400">{progress}%</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={progress} colorClassName={progressColor} />
          </div>
          {faltam > 0 && (
            <p className="mt-2 text-right text-xs text-slate-400">
              Faltam <span className="font-medium text-amber-400">{formatCurrency(faltam)}</span> para atingir o objetivo
            </p>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-400">Este registro acompanha o dinheiro que você guardou na sua conta, investimento ou reserva. Ele não transfere dinheiro nem cria uma despesa.</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contribution-value" className="text-sm font-medium text-slate-300">Quanto você já reservou para esta meta?</label>
            <div className="field-shell">
              <span className="pointer-events-none absolute left-4 text-sm font-semibold text-teal-400">R$</span>
              <input
                id="contribution-value"
                required
                disabled={saving}
                max="99999999.99"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="pl-12 pr-4 text-base font-medium text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickAdd(50)}
              className="rounded-lg border border-[#262F40] bg-[#161F32] px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-400"
            >
              + R$ 50
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickAdd(100)}
              className="rounded-lg border border-[#262F40] bg-[#161F32] px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-400"
            >
              + R$ 100
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickAdd(500)}
              className="rounded-lg border border-[#262F40] bg-[#161F32] px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-400"
            >
              + R$ 500
            </button>
            {faltam > 0 && (
              <button
                type="button"
                disabled={saving}
              onClick={() => handleQuickAdd(faltam)}
                className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-400 transition-colors hover:bg-teal-500/20"
              >
                Completar meta ({formatCurrency(faltam)})
              </button>
            )}
          </div>

          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              icon={PlusCircle}
              disabled={saving || !valor || !Number.isFinite(Number(valor)) || Number(valor) <= 0}
            >
              {saving ? 'Registrando...' : 'Registrar valor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
