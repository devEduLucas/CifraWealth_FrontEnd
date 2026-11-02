import { ArrowDownLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CategoryResponse, CategoryType } from '../../lib/api';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon';

export function CategoryCollections({ categories, onSelect }: { categories: CategoryResponse[]; onSelect: (type: CategoryType) => void }) {
  return <section aria-label="Escolha suas categorias" className="grid gap-4 sm:grid-cols-2">
    {([
      { type: 'despesa', title: 'Despesas', icon: ArrowUpRight, description: 'Para onde vai seu dinheiro' },
      { type: 'receita', title: 'Receitas', icon: ArrowDownLeft, description: 'De onde vem seu dinheiro' },
    ] as const).map(({ type, title, icon: Icon, description }) => {
      const items = categories.filter((category) => category.tipo === type);
      return <button key={type} type="button" data-kind={type} onClick={() => onSelect(type)} aria-label={`Ver categorias de ${type === 'despesa' ? 'despesas' : 'receitas'}`}
        className="category-collection finance-hero group flex min-w-0 flex-col items-start rounded-2xl p-5 text-left sm:p-6">
        <div className="mb-6 flex w-full items-center justify-between gap-3"><span className="hero-glass hero-ink flex h-12 w-12 items-center justify-center rounded-2xl border"><Icon size={25} aria-hidden="true" /></span><span className="hero-glass hero-ink rounded-full border px-3 py-1 text-xs font-medium">{items.length} {items.length === 1 ? 'categoria' : 'categorias'}</span></div>
        <span className="hero-ink block text-2xl font-bold">{title}</span>
        <p className="hero-muted mt-1 text-sm">{description}</p>
        <div aria-hidden="true" className="my-5 flex min-h-11 flex-wrap items-center gap-2">{items.slice(0, 3).map((category) => <span key={category.id_categoria} className="hero-glass hero-ink inline-flex max-w-full items-center gap-2 rounded-xl border px-2 py-1.5 text-xs"><CategoryIcon icon={category.icone} color={category.cor} type={type} className="hero-ink h-6 w-6 rounded-lg" /><span className="truncate">{category.nome}</span></span>)}{items.length === 0 && <span className="hero-muted text-sm">Crie sua primeira categoria</span>}</div>
        <span className="hero-divider hero-ink mt-auto flex w-full items-center justify-between border-t pt-4 text-sm font-semibold">Ver {title.toLocaleLowerCase('pt-BR')}<ArrowRight size={18} aria-hidden="true" /></span>
      </button>;
    })}
  </section>;
}
