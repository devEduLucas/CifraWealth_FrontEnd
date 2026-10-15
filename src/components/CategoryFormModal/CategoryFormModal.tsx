import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import type { CategoryType } from '../../lib/api';

export interface CategoryFormValues {
  nome: string;
  tipo: CategoryType;
}

interface CategoryFormModalProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  defaultTipo?: CategoryType;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}

export function CategoryFormModal({
  open,
  saving,
  error,
  defaultTipo = 'despesa',
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<CategoryType>(defaultTipo);

  useEffect(() => {
    if (!open) return;
    setNome('');
    setTipo(defaultTipo);
  }, [open, defaultTipo]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving || !nome.trim()) return;
    onSubmit({ nome: nome.trim(), tipo });
  }

  return (
    <Modal open={open} title="Nova Categoria" saving={saving} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome da categoria"
          placeholder="Ex: Alimentação"
          maxLength={50}
          disabled={saving}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />

        <Select
          label="Tipo"
          disabled={saving}
          value={tipo}
          onChange={(event) => setTipo(event.target.value as CategoryType)}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </Select>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="mt-1 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !nome.trim()}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
