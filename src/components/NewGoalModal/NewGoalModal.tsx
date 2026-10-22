import { useModalFocus } from '../../hooks/useModalFocus';
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
import { MoneyInput } from '../MoneyInput/MoneyInput';
import { formatMoneyInput, parseMoney } from '../../utils/format';
import type { GoalFormValues, GoalViewModel } from '../../types/goals.types';

interface NewGoalModalProps {
  open: boolean;
  goal: GoalViewModel | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void;
}

const EMPTY_VALUES: GoalFormValues = { titulo: '', descricao: '', valorObjetivo: '', dataFim: '' };

export function NewGoalModal({ open, goal, saving, error, onClose, onSubmit }: NewGoalModalProps) {
  const dialogRef = useModalFocus(open, saving, onClose);
  const [values, setValues] = useState<GoalFormValues>(EMPTY_VALUES);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const titleError = validationAttempted && !values.titulo.trim() ? 'Informe o nome da meta.' : undefined;
  const amountInvalid = validationAttempted && (!Number.isFinite(parseMoney(values.valorObjetivo)) || parseMoney(values.valorObjetivo) <= 0);
  const amountError = amountInvalid ? 'Informe um valor entre R$ 0,01 e R$ 99.999.999,99, com até duas casas decimais.' : undefined;

  useEffect(() => {
    if (!open) return;
    setValidationAttempted(false);
    setValues(
      goal
        ? {
            titulo: goal.titulo,
            descricao: goal.descricao ?? '',
            valorObjetivo: formatMoneyInput(goal.valorObjetivo),
            dataFim: goal.dataFim ?? '',
          }
        : EMPTY_VALUES
    );
  }, [open, goal]);

  if (!open) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationAttempted(true);
    if (saving || !values.titulo.trim() || !Number.isFinite(parseMoney(values.valorObjetivo)) || parseMoney(values.valorObjetivo) <= 0) return;
    onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="goal-modal-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 id="goal-modal-title" className="text-base font-semibold text-foreground">{goal ? 'Editar Meta' : 'Nova Meta'}</h2>
          <button type="button" aria-label="Fechar" disabled={saving} onClick={onClose} className="text-muted hover:text-foreground">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-title" className="text-sm font-medium text-muted">Nome da meta</label>
            <input
              required
              maxLength={100}
              id="goal-title"
              disabled={saving}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "goal-title-error" : undefined}
              value={values.titulo}
              onChange={(event) => setValues((prev) => ({ ...prev, titulo: event.target.value }))}
              placeholder="Ex: Reserva de Emergência"
              className={`h-11 rounded-xl border ${titleError ? 'border-danger/60' : 'border-field-border'} bg-elevated px-4 text-sm text-foreground outline-none focus:border-accent`}
            />
            {titleError && <p id="goal-title-error" role="alert" className="text-xs text-danger">{titleError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-description" className="text-sm font-medium text-muted">Descrição (opcional)</label>
            <input
              maxLength={255}
              id="goal-description"
              disabled={saving}
              value={values.descricao}
              onChange={(event) => setValues((prev) => ({ ...prev, descricao: event.target.value }))}
              placeholder="Ex: Meta para imprevistos e segurança"
              className="h-11 rounded-xl border border-field-border bg-elevated px-4 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <MoneyInput id="goal-target-amount" label="Valor objetivo" required disabled={saving} value={values.valorObjetivo} error={amountError} onValueChange={(value) => setValues((prev) => ({ ...prev, valorObjetivo: value }))} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-deadline" className="text-sm font-medium text-muted">Prazo (opcional)</label>
            <input
              type="date"
              id="goal-deadline"
              disabled={saving}
              value={values.dataFim}
              onChange={(event) => setValues((prev) => ({ ...prev, dataFim: event.target.value }))}
              className="h-11 rounded-xl border border-field-border bg-elevated px-4 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}

          <div className="mt-1 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
