import { useState } from 'react';
import type { DetailedReportResponse } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';
import { formatReportDate } from '../../utils/reports';
const PAGE_SIZE = 20;
export function ReportTransactionsTable({ items }: { items: DetailedReportResponse['transactions'] }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const normalize = (text: string) => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalized = normalize(search);
  const filtered = items.filter((item) => (!type || item.tipo === type) && normalize(item.descricao + ' ' + item.categoria).includes(normalized));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  return <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 className="text-base font-semibold text-foreground">Transações detalhadas</h2><p className="mt-1 text-xs text-muted">Transações confirmadas que compõem o relatório. A busca abaixo filtra somente esta tabela.</p>
    <div className="mt-4 flex flex-wrap gap-3"><input aria-label="Buscar descrição ou categoria" placeholder="Buscar descrição ou categoria" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="h-11 flex-1 rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground" /><select aria-label="Filtrar tipo na tabela" value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} className="h-11 rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground"><option value="">Todos os tipos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select></div>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs text-subtle"><tr><th className="pb-3">Data</th><th className="pb-3">Descrição</th><th className="pb-3">Categoria</th><th className="pb-3">Tipo</th><th className="pb-3 text-right">Valor</th></tr></thead><tbody className="divide-y divide-line">
      {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item) => <tr key={item.id}><td className="py-3 text-muted">{formatReportDate(item.data)}</td><td className="py-3 text-foreground">{item.descricao}</td><td className="py-3 text-muted">{item.categoria}</td><td className="py-3 text-muted">{item.tipo === 'receita' ? 'Receita' : 'Despesa'}</td><td className={'py-3 text-right ' + (item.tipo === 'receita' ? 'text-positive' : 'text-danger')}>{formatCurrency(item.valor)}</td></tr>)}
      {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-subtle">Nenhuma transação encontrada.</td></tr>}
    </tbody></table></div>
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted"><span>{filtered.length} transações · Página {page + 1} de {pageCount}</span><div className="flex gap-3"><button type="button" disabled={page === 0} onClick={() => setPage((old) => old - 1)} className="text-accent-ink disabled:opacity-40">Anterior</button><button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((old) => old + 1)} className="text-accent-ink disabled:opacity-40">Próxima</button></div></div>
  </div>;
}
