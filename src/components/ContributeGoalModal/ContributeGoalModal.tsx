import { useModalFocus } from '../../hooks/useModalFocus';
import { useState, type FormEvent } from 'react';
import { PiggyBank, X, PlusCircle } from 'lucide-react';
import { Button } from '../Button/Button';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { MoneyInput } from '../MoneyInput/MoneyInput';
import { formatMoneyInput, parseMoney } from '../../utils/format';
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
    const valorNumerico = parseMoney(valor);
    if (saving || !Number.isFinite(valorNumerico) || valorNumerico <= 0) return;
    onSubmit(valorNumerico);

  }

  function handleQuickAdd(amount: number) {
    setValor(formatMoneyInput(amount));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contribution-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-progress/10 text-progress">
              <PiggyBank size={18} />
            </span>
            <h2 id="contribution-title" className="text-base font-semibold text-foreground">Adicionar valor guardado</h2>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-hover hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-elevated p-4">
          <p className="text-sm font-semibold text-foreground">{goal.titulo}</p>
          <div className="mt-2 flex items-baseline justify-between text-xs text-muted">
            <span>
              Atual: <strong className="text-progress">{formatCurrency(goal.valorAtual)}</strong> de{' '}
              {formatCurrency(goal.valorObjetivo)}
            </span>
            <span className="font-semibold text-progress">{progress}%</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={progress} colorClassName={progressColor} />
          </div>
          {faltam > 0 && (
            <p className="mt-2 text-right text-xs text-muted">
              Faltam <span className="font-medium text-warning">{formatCurrency(faltam)}</span> para atingir o objetivo
            </p>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">Este registro acompanha o dinheiro que você guardou na sua conta, investimento ou reserva. Ele não transfere dinheiro nem cria uma despesa.</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <MoneyInput label="Valor deste aporte" required disabled={saving} value={valor} onValueChange={setValor} />
          <p className="text-xs text-muted">Informe somente o novo valor reservado, que será somado ao total atual.</p>
          {Number.isFinite(parseMoney(valor)) && parseMoney(valor) > 0 && <p role="status" className="rounded-lg bg-elevated p-3 text-sm text-foreground">Após registrar: {formatCurrency(goal.valorAtual)} + {formatCurrency(parseMoney(valor))} = <strong>{formatCurrency((Math.round(goal.valorAtual * 100) + Math.round(parseMoney(valor) * 100)) / 100)}</strong></p>}
          {valor && (!Number.isFinite(parseMoney(valor)) || parseMoney(valor) <= 0) && <p role="alert" className="text-xs text-danger">Informe um valor positivo, com até duas casas decimais.</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickAdd(50)}
              className="rounded-lg border border-line-strong bg-elevated px-2.5 py-1 text-xs font-semibold text-secondary transition-colors hover:border-accent hover:text-accent-ink"
            >
              R$ 50
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickAdd(100)}
              className="rounded-lg border border-line-strong bg-elevated px-2.5 py-1 text-xs font-semibold text-secondary transition-colors hover:border-accent hover:text-accent-ink"
            >
              R$ 100
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickAdd(500)}
              className="rounded-lg border border-line-strong bg-elevated px-2.5 py-1 text-xs font-semibold text-secondary transition-colors hover:border-accent hover:text-accent-ink"
            >
              R$ 500
            </button>
            {faltam > 0 && (
              <button
                type="button"
                disabled={saving}
              onClick={() => handleQuickAdd(faltam)}
                className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent/20"
              >
                Completar meta ({formatCurrency(faltam)})
              </button>
            )}
          </div>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              icon={PlusCircle}
              disabled={saving || !valor || !Number.isFinite(parseMoney(valor)) || parseMoney(valor) <= 0}
            >
              {saving ? 'Registrando...' : 'Registrar valor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
