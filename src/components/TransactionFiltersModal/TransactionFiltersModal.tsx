import { useId, useState, type FormEvent } from 'react';
import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import type { CategoryResponse, TransactionResponse } from '../../lib/api';
import {
  EMPTY_TRANSACTION_FILTERS,
  selectTransactions,
  transactionDateRange,
  validateTransactionDates,
  type TransactionFilters,
  type TransactionDatePreset,
} from '../../utils/transactions';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';

export function TransactionFiltersModal({
  filters,
  transactions,
  categories,
  today,
  onClose,
  onApply,
}: {
  filters: TransactionFilters;
  transactions: TransactionResponse[];
  categories: CategoryResponse[];
  today: string;
  onClose: () => void;
  onApply: (filters: TransactionFilters) => void;
}) {
  const formId = useId();
  const [draft, setDraft] = useState({ ...filters });
  const [error, setError] = useState<string | null>(null);
  const availableCategories = categories.filter(
    (category) => !draft.tipo || category.tipo === draft.tipo,
  );
  const invalidRange = validateTransactionDates(draft.start, draft.end);
  const count = invalidRange
    ? null
    : selectTransactions(transactions, categories, draft, today).length;

  function change<K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K],
  ) {
    setDraft((old) => ({ ...old, [key]: value }));
    setError(null);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (invalidRange) {
      setError(invalidRange);
      event.currentTarget.querySelector<HTMLInputElement>('input[type="date"]')?.focus();
      return;
    }
    onApply(draft);
  }

  return (
    <Modal
      open
      title="Filtrar transações"
      onClose={onClose}
      stickyHeader
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" className="px-2" onClick={() => {
            setDraft({ ...EMPTY_TRANSACTION_FILTERS, search: filters.search });
            setError(null);
          }}>Limpar seleção</Button>
          <div className="flex gap-2">
            <Button variant="outline" className="px-3" onClick={onClose}>Cancelar</Button>
            <Button type="submit" form={formId} className="px-3">Aplicar filtros</Button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-5">
        <p className="-mt-2 text-sm leading-6 text-muted">
          Combine os filtros para encontrar o que precisa. A lista muda quando
          você aplicar.
        </p>
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays size={17} aria-hidden="true" />
            Período
          </legend>
          <div
            role="group"
            aria-label="Períodos rápidos"
            className="mb-4 flex flex-wrap gap-2"
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
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={
                    draft.start === range.start && draft.end === range.end
                  }
                  onClick={() => {
                    setDraft((old) => ({
                      ...old,
                      ...transactionDateRange(
                        value as TransactionDatePreset,
                        today,
                      ),
                    }));
                    setError(null);
                  }}
                  className={`min-h-10 rounded-xl border px-3 text-xs font-semibold transition-colors ${draft.start === range.start && draft.end === range.end ? 'border-accent bg-accent/10 text-accent-ink' : 'border-line text-muted hover:bg-elevated'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
            <Input
              label="Data inicial"
              type="date"
              value={draft.start}
              onChange={(event) => change('start', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'transaction-filter-date-error' : undefined
              }
            />
            <Input
              label="Data final"
              type="date"
              value={draft.end}
              onChange={(event) => change('end', event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'transaction-filter-date-error' : undefined
              }
            />
          </div>
          {error && (
            <p
              id="transaction-filter-date-error"
              role="alert"
              className="mt-3 text-sm text-danger"
            >
              {error}
            </p>
          )}
        </fieldset>
        <div className="border-t border-line pt-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal size={17} aria-hidden="true" />
            Movimentações
          </p>
          <div className="grid gap-4 min-[600px]:grid-cols-2">
            <Select
              label="Filtrar tipo"
              value={draft.tipo}
              onChange={(event) => {
                const tipo = event.target.value as TransactionFilters['tipo'];
                setDraft((old) => ({
                  ...old,
                  tipo,
                  category:
                    !tipo ||
                    categories.find(
                      (category) =>
                        String(category.id_categoria) === old.category,
                    )?.tipo === tipo
                      ? old.category
                      : '',
                }));
              }}
            >
              <option value="">Receitas e despesas</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </Select>
            <Select
              label="Filtrar situação"
              value={draft.status}
              onChange={(event) =>
                change(
                  'status',
                  event.target.value as TransactionFilters['status'],
                )
              }
            >
              <option value="">Todas as situações</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendente">Pendentes</option>
              <option value="prevista">Previstas — data futura</option>
            </Select>
            <Select
              label="Filtrar categoria"
              value={draft.category}
              onChange={(event) => change('category', event.target.value)}
            >
              <option value="">Todas as categorias</option>
              {availableCategories.map((category) => (
                <option
                  key={category.id_categoria}
                  value={category.id_categoria}
                >
                  {category.nome}
                  {!draft.tipo
                    ? ` · ${category.tipo === 'receita' ? 'Receita' : 'Despesa'}`
                    : ''}
                </option>
              ))}
            </Select>
            <Select
              label="Ordenar transações"
              value={draft.order}
              onChange={(event) =>
                change(
                  'order',
                  event.target.value as TransactionFilters['order'],
                )
              }
            >
              <option value="newest">Mais recentes primeiro</option>
              <option value="oldest">Mais antigas primeiro</option>
            </Select>
          </div>
        </div>
        <div
          className="rounded-xl bg-elevated p-3 text-xs leading-5 text-muted"
          role="status"
          aria-live="polite"
        >
          {count === null
            ? 'Revise as datas para consultar os resultados.'
            : `${count} ${count === 1 ? 'transação corresponde' : 'transações correspondem'} à seleção${draft.search ? ' e à busca atual' : ''}.`}
        </div>
      </form>
    </Modal>
  );
}
