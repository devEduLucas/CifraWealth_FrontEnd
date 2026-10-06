import { useModalFocus } from '../../hooks/useModalFocus';
import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
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

  useEffect(() => {
    if (!open) return;
    setValues(
      goal
        ? {
            titulo: goal.titulo,
            descricao: goal.descricao ?? '',
            valorObjetivo: String(goal.valorObjetivo),
            dataFim: goal.dataFim ?? '',
          }
        : EMPTY_VALUES
    );
  }, [open, goal]);

  if (!open) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving || !values.titulo.trim() || Number(values.valorObjetivo) <= 0) return;
    onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="goal-modal-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#202634] bg-[#121827] p-6">
        <div className="flex items-center justify-between">
          <h2 id="goal-modal-title" className="text-base font-semibold text-white">{goal ? 'Editar Meta' : 'Nova Meta'}</h2>
          <button type="button" aria-label="Fechar" disabled={saving} onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-title" className="text-sm font-medium text-slate-400">Nome da meta</label>
            <input
              required
              maxLength={100}
              id="goal-title"
              disabled={saving}
              value={values.titulo}
              onChange={(event) => setValues((prev) => ({ ...prev, titulo: event.target.value }))}
              placeholder="Ex: Reserva de Emergência"
              className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none focus:border-teal-400/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-description" className="text-sm font-medium text-slate-400">Descrição (opcional)</label>
            <input
              maxLength={255}
              id="goal-description"
              disabled={saving}
              value={values.descricao}
              onChange={(event) => setValues((prev) => ({ ...prev, descricao: event.target.value }))}
              placeholder="Ex: Meta para imprevistos e segurança"
              className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none focus:border-teal-400/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-target" className="text-sm font-medium text-slate-400">Valor objetivo</label>
            <input
              type="number"
              min="0.01"
              max="99999999.99"
              required
              step="0.01"
              id="goal-target"
              disabled={saving}
              value={values.valorObjetivo}
              onChange={(event) => setValues((prev) => ({ ...prev, valorObjetivo: event.target.value }))}
              placeholder="0,00"
              className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none focus:border-teal-400/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-deadline" className="text-sm font-medium text-slate-400">Prazo (opcional)</label>
            <input
              type="date"
              id="goal-deadline"
              disabled={saving}
              value={values.dataFim}
              onChange={(event) => setValues((prev) => ({ ...prev, dataFim: event.target.value }))}
              className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none focus:border-teal-400/60"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="mt-1 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !values.titulo.trim() || !values.valorObjetivo}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
