import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import type { CategoryType, CategoryResponse } from '../../lib/api';
import { Check } from 'lucide-react';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  categoryColor,
  categoryIconKey,
} from '../../utils/categoryAppearance';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon';

export interface CategoryFormValues {
  nome: string;
  tipo: CategoryType;
  cor: string;
  icone: string;
}

interface CategoryFormModalProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  defaultTipo?: CategoryType;
  category?: CategoryResponse | null;
  inUse?: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}

export function CategoryFormModal({
  open,
  saving,
  error,
  defaultTipo = 'despesa',
  category = null,
  inUse = false,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<CategoryType>(defaultTipo);
  const [color, setColor] = useState('#2563eb');
  const [icon, setIcon] = useState('tag');

  useEffect(() => {
    if (!open) return;
    setNome(category?.nome ?? '');
    setTipo(category?.tipo ?? defaultTipo);
    setColor(categoryColor(category?.cor, category?.tipo ?? defaultTipo));
    setIcon(categoryIconKey(category?.icone));
  }, [open, defaultTipo, category]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving || !nome.trim()) return;
    onSubmit({ nome: nome.trim(), tipo, cor: color, icone: icon });
  }

  return (
    <Modal
      open={open}
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      saving={saving}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 min-[600px]:grid-cols-2">
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
            disabled={saving || (Boolean(category) && inUse)}
            value={tipo}
            onChange={(event) => setTipo(event.target.value as CategoryType)}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </Select>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-elevated p-3">
          <CategoryIcon icon={icon} color={color} type={tipo} />
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-foreground">
              {nome.trim() || 'Sua categoria'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {tipo === 'receita' ? 'Receita' : 'Despesa'} · prévia
            </p>
          </div>
        </div>
        <fieldset disabled={saving}>
          <legend className="mb-3 text-sm font-medium text-muted">Ícone</legend>
          <div className="grid grid-cols-4 gap-2 min-[440px]:grid-cols-6">
            {CATEGORY_ICONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                title={label}
                aria-label={`Ícone ${label}`}
                aria-pressed={icon === value}
                onClick={() => setIcon(value)}
                className={`flex min-h-11 items-center justify-center rounded-xl border p-2 text-foreground disabled:opacity-40 ${icon === value ? 'border-accent bg-accent/10 ring-1 ring-accent/30' : 'border-line bg-elevated hover:bg-hover'}`}
              >
                <Icon size={20} aria-hidden="true" />
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={saving}>
          <legend className="mb-3 text-sm font-medium text-muted">
            Cor da categoria
          </legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-label={`Cor ${label}`}
                title={label}
                aria-pressed={color === value}
                onClick={() => setColor(value)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${color === value ? 'border-accent ring-1 ring-accent' : 'border-line hover:bg-elevated'}`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: value }}
                >
                  {color === value && (
                    <span className="rounded-full bg-surface p-0.5 text-foreground">
                      <Check size={13} />
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {category && (
          <p className="text-xs leading-5 text-muted">
            O nome será atualizado nos lançamentos vinculados.{' '}
            {inUse
              ? 'Esta categoria possui transações e conserva seu tipo.'
              : 'Categorias em uso conservam seu tipo.'}
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
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
