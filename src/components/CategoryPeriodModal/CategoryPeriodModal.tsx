import { useState, type FormEvent } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import {
  transactionDateRange,
  validateTransactionDates,
} from '../../utils/transactions';
import type { CategoryPeriod } from '../../utils/categoryUsage';

export function CategoryPeriodModal({
  period,
  today,
  onClose,
  onApply,
}: {
  period: CategoryPeriod;
  today: string;
  onClose: () => void;
  onApply: (period: CategoryPeriod) => void;
}) {
  const [draft, setDraft] = useState({ ...period });
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const message = validateTransactionDates(draft.start, draft.end);
    if (message) {
      setError(message);
      return;
    }
    onApply(draft);
  }
  return (
    <Modal open title="Período das categorias" onClose={onClose} stickyHeader>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <p className="text-sm leading-6 text-muted">
          O período é aplicado ao gráfico e ao uso de cada categoria.
          Consideramos somente transações confirmadas até hoje.
        </p>
        <div
          role="group"
          aria-label="Períodos rápidos"
          className="flex flex-wrap gap-2"
        >
          {(
            [
              { value: 'month', label: 'Este mês' },
              { value: '30days', label: 'Últimos 30 dias' },
              { value: 'year', label: 'Este ano' },
              { value: 'all', label: 'Todo o período' },
            ] as const
          ).map(({ value, label }) => {
            const range = transactionDateRange(value, today);
            const selected =
              draft.start === range.start && draft.end === range.end;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setDraft(range);
                  setError(null);
                }}
                className={`min-h-11 rounded-xl border px-3 text-xs font-semibold ${selected ? 'border-accent bg-accent/10 text-accent-ink' : 'border-line text-muted hover:bg-elevated'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <Input
          label="Data inicial"
          type="date"
          value={draft.start}
          onChange={(event) => {
            setDraft((old) => ({ ...old, start: event.target.value }));
            setError(null);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'category-period-error' : undefined}
        />
        <Input
          label="Data final"
          type="date"
          value={draft.end}
          onChange={(event) => {
            setDraft((old) => ({ ...old, end: event.target.value }));
            setError(null);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'category-period-error' : undefined}
        />
        {error && (
          <p
            id="category-period-error"
            role="alert"
            className="text-sm text-danger"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Aplicar período</Button>
        </div>
      </form>
    </Modal>
  );
}
