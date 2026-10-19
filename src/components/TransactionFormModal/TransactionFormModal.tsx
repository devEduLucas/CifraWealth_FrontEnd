import { useEffect, useState, type FormEvent } from 'react';
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
  const [localError, setLocalError] = useState<string | null>(null);
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
    setLocalError(null);
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

    const valorNumerico = parseMoney(valor);
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setLocalError('Informe um valor entre R$ 0,01 e R$ 99.999.999,99, com até duas casas decimais.');
      return;
    }
    if (!descricao.trim() || !idCategoria || !data) {
      setLocalError('Preencha descrição, categoria e data.');
      return;
    }

    setLocalError(null);
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Descrição"
          placeholder="Ex: Supermercado"
          maxLength={200}
          disabled={saving}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MoneyInput
            label="Valor"
            placeholder="0,00"
            inputMode="decimal"
            disabled={saving}
            value={valor}
            onValueChange={setValor}
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
          label="Categoria"
          disabled={saving}
          value={idCategoria}
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

        <Input
          label="Data"
          type="date"
          disabled={saving}
          value={data}
          onChange={(event) => { setData(event.target.value); if (event.target.value > today) setStatus('pendente'); }}
        />

        <Select label="Situação" disabled={saving || data > today} value={data > today ? 'pendente' : status}
          onChange={(event) => setStatus(event.target.value as TransactionStatus)}>
          <option value="confirmada">Confirmada — já recebida ou paga</option>
          <option value="pendente">Pendente — ainda não recebida ou paga</option>
        </Select>
        {data > today && <p className="text-xs text-muted">Lançamentos futuros ficam previstos. Confirme após receber ou pagar para incluí-los no saldo.</p>}

        {(localError || error) && <p role="alert" className="text-xs text-danger">{localError ?? error}</p>}

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
