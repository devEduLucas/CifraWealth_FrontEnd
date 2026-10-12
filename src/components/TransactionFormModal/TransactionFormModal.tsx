import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { parseMoney } from '../../utils/format';
import { localDateOnly } from '../../utils/reports';
import type { CategoryResponse, CategoryType } from '../../lib/api';

export interface TransactionFormValues {
  descricao: string;
  valor: number;
  tipo: CategoryType;
  id_categoria: number;
  data_transacao: string;
}

interface TransactionFormModalProps {
  open: boolean;
  categories: CategoryResponse[];
  selectedCategory: CategoryResponse | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => void;
  onNewCategory: () => void;
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
}: TransactionFormModalProps) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<CategoryType>('despesa');
  const [idCategoria, setIdCategoria] = useState<number | ''>('');
  const [data, setData] = useState(() => localDateOnly());
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDescricao('');
    setValor('');
    setTipo('despesa');
    setIdCategoria('');
    setData(localDateOnly());
    setLocalError(null);
  }, [open]);

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
    if (!descricao.trim() || !idCategoria || !data || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setLocalError('Preencha descrição, valor, categoria e data.');
      return;
    }

    setLocalError(null);
    onSubmit({
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      id_categoria: idCategoria,
      data_transacao: data,
    });
  }

  return (
    <Modal open={open} title="Nova Transação" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Descrição"
          placeholder="Ex: Supermercado"
          maxLength={255}
          autoFocus
          disabled={saving}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Valor"
            placeholder="0,00"
            inputMode="decimal"
            disabled={saving}
            value={valor}
            onChange={(event) => setValor(event.target.value)}
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
              onClick={onNewCategory}
              disabled={saving}
              className="text-xs font-medium text-teal-400 hover:underline"
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
          onChange={(event) => setData(event.target.value)}
        />

        {(localError || error) && <p className="text-xs text-red-400">{localError ?? error}</p>}

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
