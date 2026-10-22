import { useEffect, useId, useState, type FormEvent } from 'react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { MoneyInput } from '../MoneyInput/MoneyInput';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { formatMoneyInput, parseMoney } from '../../utils/format';
import { localDateOnly } from '../../utils/reports';
import type { CategoryResponse, CategoryType, TransactionResponse, TransactionStatus } from '../../lib/api';

export interface TransactionFormValues {
  descricao: string;
  valor: number;
  tipo: CategoryType;
  id_categoria: number;
  data_transacao: string;
  status: TransactionStatus;
}

interface TransactionFormModalProps {
  open: boolean;
  categories: CategoryResponse[];
  selectedCategory: CategoryResponse | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => void;
  onNewCategory: (tipo: CategoryType) => void;
  defaultTipo?: CategoryType;
  transaction?: TransactionResponse | null;
}

export function TransactionFormModal({
  open,
  categories,
  selectedCategory,
  saving,
  error,
  onClose,
  onSubmit,
  onNewCategory,
  defaultTipo = 'despesa',
  transaction = null,
}: TransactionFormModalProps) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<CategoryType>('despesa');
  const [idCategoria, setIdCategoria] = useState<number | ''>('');
  const [data, setData] = useState(() => localDateOnly());
  const [validationAttempted, setValidationAttempted] = useState(false);
  const fieldIds = useId();
  const descriptionId = `${fieldIds}-description`;
  const amountId = `${fieldIds}-amount`;
  const categoryId = `${fieldIds}-category`;
  const dateId = `${fieldIds}-date`;
  const amountInvalid = validationAttempted && (!Number.isFinite(parseMoney(valor)) || parseMoney(valor) <= 0);
  const descriptionError = validationAttempted && !descricao.trim() ? 'Informe a descrição.' : undefined;
  const categoryError = validationAttempted && !idCategoria ? 'Selecione uma categoria.' : undefined;
  const dateError = validationAttempted && !data ? 'Informe a data.' : undefined;
  const amountError = amountInvalid ? 'Informe um valor entre R$ 0,01 e R$ 99.999.999,99, com até duas casas decimais.' : undefined;
  const [status, setStatus] = useState<TransactionStatus>('confirmada');
  const today = localDateOnly();

  useEffect(() => {
    if (!open) return;
    setDescricao(transaction?.descricao ?? '');
    setValor(transaction ? formatMoneyInput(transaction.valor) : '');
    setTipo(transaction?.tipo ?? defaultTipo);
    setIdCategoria(transaction?.id_categoria ?? '');
    setData(transaction?.data_transacao ?? localDateOnly());
    setStatus(transaction?.status ?? 'confirmada');
    setValidationAttempted(false);
  }, [open, defaultTipo, transaction]);

  useEffect(() => {
    if (!selectedCategory) return;
    setTipo(selectedCategory.tipo);
    setIdCategoria(selectedCategory.id_categoria);
  }, [selectedCategory]);

  const filteredCategories = categories.filter((category) => category.tipo === tipo);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;

    setValidationAttempted(true);
    const valorNumerico = parseMoney(valor);
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0 || !descricao.trim() || !idCategoria || !data) return;
    onSubmit({
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      id_categoria: idCategoria,
      data_transacao: data,
      status: data > today ? 'pendente' : status,
    });
  }

  return (
    <Modal open={open} title={transaction ? 'Editar Transação' : 'Nova Transação'} saving={saving} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id={descriptionId}
          label="Descrição"
          placeholder="Ex: Supermercado"
          maxLength={200}
          disabled={saving}
          required
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          error={descriptionError}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MoneyInput
            id={amountId}
            label="Valor"
            placeholder="0,00"
            inputMode="decimal"
            required
            disabled={saving}
            value={valor}
            onValueChange={setValor}
            error={amountError}
          />

          <Select
            label="Tipo"
            disabled={saving}
            value={tipo}
            onChange={(event) => {
              setTipo(event.target.value as CategoryType);
              setIdCategoria('');
            }}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </Select>
        </div>

        <Select
          id={categoryId}
          label="Categoria"
          required
          disabled={saving}
          value={idCategoria}
          className={categoryError ? 'border-danger/60' : undefined}
          aria-invalid={Boolean(categoryError)}
          aria-describedby={categoryError ? `${categoryId}-error` : undefined}
          onChange={(event) => setIdCategoria(Number(event.target.value) || '')}
          labelAction={
            <button
              type="button"
              onClick={() => onNewCategory(tipo)}
              disabled={saving}
              className="text-xs font-medium text-accent-ink hover:underline"
            >
              + Nova categoria
            </button>
          }
        >
          <option value="">Selecione</option>
          {filteredCategories.map((category) => (
            <option key={category.id_categoria} value={category.id_categoria}>
              {category.nome}
            </option>
          ))}
        </Select>
        {categoryError && <p id={`${categoryId}-error`} role="alert" className="text-xs text-danger">{categoryError}</p>}

        <Input
          id={dateId}
          label="Data"
          type="date"
          required
          disabled={saving}
          value={data}
          onChange={(event) => { setData(event.target.value); if (event.target.value > today) setStatus('pendente'); }}
          error={dateError}
          helperText={data > today ? 'Lançamentos futuros ficam previstos. Confirme após receber ou pagar para incluí-los no saldo.' : undefined}
        />

        <Select label="Situação" disabled={saving || data > today} value={data > today ? 'pendente' : status}
          onChange={(event) => setStatus(event.target.value as TransactionStatus)}>
          <option value="confirmada">Confirmada — já recebida ou paga</option>
          <option value="pendente">Pendente — ainda não recebida ou paga</option>
        </Select>

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
    </Modal>
  );
}
