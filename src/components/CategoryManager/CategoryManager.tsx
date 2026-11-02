import { ArrowLeft, ArrowUpRight, Pencil, Search, Tag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategoryResponse, CategoryType } from '../../lib/api';
import type { CategoryOrder, CategoryUsage } from '../../utils/categoryUsage';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon';

interface Props {
  type: CategoryType;
  items: CategoryUsage[];
  search: string;
  order: CategoryOrder;
  usageAvailable: boolean;
  onSearch: (value: string) => void;
  onOrder: (value: CategoryOrder) => void;
  onBack: () => void;
  onEdit: (category: CategoryResponse | null) => void;
  onDelete: (category: CategoryResponse) => void;
}

export function CategoryManager({ type, items, search, order, usageAvailable, onSearch, onOrder, onBack, onEdit, onDelete }: Props) {
  return <section aria-labelledby="category-list-title">
    <button type="button" onClick={onBack} className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent-ink hover:underline"><ArrowLeft size={16} aria-hidden="true" />Todas as categorias</button>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="category-list-title" className="text-xl font-bold text-foreground">Categorias de {type === 'despesa' ? 'despesa' : 'receita'}</h2><span role="status" className="text-sm text-muted">{items.length} {items.length === 1 ? 'categoria' : 'categorias'}</span></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <Input label="Buscar categorias" icon={<Search size={18} />} placeholder="Nome da categoria" value={search} onChange={(event) => onSearch(event.target.value)} />
      <Select label="Ordenar categorias" value={usageAvailable ? order : 'name'} onChange={(event) => onOrder(event.target.value as CategoryOrder)}><option value="name">Nome: A–Z</option><option value="count" disabled={!usageAvailable}>Mais utilizadas</option></Select>
    </div>
    {items.length === 0 ? <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center"><Tag size={28} aria-hidden="true" className="mx-auto text-subtle" /><p className="mt-3 text-sm text-muted">{search ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria por aqui ainda.'}</p><Button onClick={() => search ? onSearch('') : onEdit(null)} className="mt-4">{search ? 'Limpar busca' : 'Criar primeira categoria'}</Button></div> :
      <ul aria-label="Lista de categorias" className="grid gap-3 lg:grid-cols-2">
        {items.map(({ category, historyCount }) => <li key={category.id_categoria} className="flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface p-3 sm:p-4">
          <CategoryIcon icon={category.icone} color={category.cor} type={category.tipo} />
          <div className="min-w-0 flex-1"><h3 className="break-words text-sm font-semibold text-foreground sm:text-base">{category.nome}</h3><Link to={'/transactions?' + new URLSearchParams({ categoria: String(category.id_categoria), tipo: category.tipo })} aria-label={`Ver transações de ${category.nome}`} className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-accent-ink hover:underline">{usageAvailable ? `${historyCount} ${historyCount === 1 ? 'lançamento' : 'lançamentos'}` : 'Ver transações'}<ArrowUpRight size={13} aria-hidden="true" /></Link></div>
          <div className="flex shrink-0 gap-1"><button type="button" aria-label={`Editar categoria ${category.nome}`} title={`Editar ${category.nome}`} onClick={() => onEdit(category)} className="flex h-11 w-11 items-center justify-center rounded-xl text-accent-ink hover:bg-elevated"><Pencil size={17} aria-hidden="true" /></button><button type="button" aria-label={`Excluir categoria ${category.nome}`} title={`Excluir ${category.nome}`} onClick={() => onDelete(category)} className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-danger/10 hover:text-danger"><Trash2 size={17} aria-hidden="true" /></button></div>
        </li>)}
      </ul>}
  </section>;
}
