import { useId, useState } from 'react';
import type { DetailedReportResponse } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';
import { formatReportDate } from '../../utils/reports';
const PAGE_SIZE = 20;
export function ReportTransactionsTable({ items }: { items: DetailedReportResponse['transactions'] }) {
  const tableTitleId = useId();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const normalize = (text: string) => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalized = normalize(search);
  const filtered = items.filter((item) => (!type || item.tipo === type) && normalize(item.descricao + ' ' + item.categoria).includes(normalized));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  return <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 id={tableTitleId} className="text-base font-semibold text-foreground">Transações detalhadas</h2><p id={`${tableTitleId}-description`} className="mt-1 text-xs text-muted">Transações confirmadas que compõem o relatório. A busca abaixo filtra somente esta tabela.</p>
    <div className="mt-4 flex flex-wrap gap-3"><div className="flex min-w-0 flex-1 flex-col gap-1"><label htmlFor="report-transactions-search" className="text-xs font-medium text-muted">Buscar descrição ou categoria</label><input id="report-transactions-search" placeholder="Buscar descrição ou categoria" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="h-11 w-full rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground" /></div><div className="flex flex-col gap-1"><label htmlFor="report-transactions-type" className="text-xs font-medium text-muted">Filtrar tipo</label><select id="report-transactions-type" value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} className="h-11 rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground"><option value="">Todos os tipos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select></div></div>
    <div className="mt-4 overflow-x-auto"><table aria-labelledby={tableTitleId} aria-describedby={`${tableTitleId}-description`} className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs text-subtle"><tr><th scope="col" className="pb-3">Data</th><th scope="col" className="pb-3">Descrição</th><th scope="col" className="pb-3">Categoria</th><th scope="col" className="pb-3">Tipo</th><th scope="col" className="pb-3 text-right">Valor</th></tr></thead><tbody className="divide-y divide-line">
      {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item) => <tr key={item.id}><td className="py-3 text-muted">{formatReportDate(item.data)}</td><td className="py-3 text-foreground">{item.descricao}</td><td className="py-3 text-muted">{item.categoria}</td><td className="py-3 text-muted">{item.tipo === 'receita' ? 'Receita' : 'Despesa'}</td><td className={'py-3 text-right ' + (item.tipo === 'receita' ? 'text-positive' : 'text-danger')}>{formatCurrency(item.valor)}</td></tr>)}
      {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-subtle">Nenhuma transação encontrada.</td></tr>}
    </tbody></table></div>
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted"><span>{filtered.length} transações · Página {page + 1} de {pageCount}</span><div className="flex gap-3"><button type="button" disabled={page === 0} onClick={() => setPage((old) => old - 1)} className="text-accent-ink disabled:opacity-40">Anterior</button><button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((old) => old + 1)} className="text-accent-ink disabled:opacity-40">Próxima</button></div></div>
  </div>;
}
