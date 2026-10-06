import { useState } from 'react';
import type { DetailedReportResponse } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';
import { formatReportDate } from '../../utils/reports';
const PAGE_SIZE = 20;
export function ReportTransactionsTable({ items }: { items: DetailedReportResponse['transactions'] }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const normalized = search.toLocaleLowerCase('pt-BR');
  const filtered = items.filter((item) => (!type || item.tipo === type) && (item.descricao + ' ' + item.categoria).toLocaleLowerCase('pt-BR').includes(normalized));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  return <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
    <h2 className="text-base font-semibold text-white">Transações detalhadas</h2><p className="mt-1 text-xs text-slate-400">Transações confirmadas que compõem o relatório. A busca abaixo filtra somente esta tabela.</p>
    <div className="mt-4 flex flex-wrap gap-3"><input aria-label="Buscar descrição ou categoria" placeholder="Buscar descrição ou categoria" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="h-11 flex-1 rounded-xl border border-[#262F40] bg-[#161F32] px-3 text-sm text-white" /><select aria-label="Filtrar tipo na tabela" value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-3 text-sm text-white"><option value="">Todos os tipos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option></select></div>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Data</th><th className="pb-3">Descrição</th><th className="pb-3">Categoria</th><th className="pb-3">Tipo</th><th className="pb-3 text-right">Valor</th></tr></thead><tbody className="divide-y divide-[#202634]">
      {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item) => <tr key={item.id}><td className="py-3 text-slate-400">{formatReportDate(item.data)}</td><td className="py-3 text-white">{item.descricao}</td><td className="py-3 text-slate-400">{item.categoria}</td><td className="py-3 text-slate-400">{item.tipo === 'receita' ? 'Receita' : 'Despesa'}</td><td className={'py-3 text-right ' + (item.tipo === 'receita' ? 'text-teal-400' : 'text-red-400')}>{formatCurrency(item.valor)}</td></tr>)}
      {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">Nenhuma transação encontrada.</td></tr>}
    </tbody></table></div>
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400"><span>{filtered.length} transações · Página {page + 1} de {pageCount}</span><div className="flex gap-3"><button type="button" disabled={page === 0} onClick={() => setPage((old) => old - 1)} className="text-teal-400 disabled:opacity-40">Anterior</button><button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((old) => old + 1)} className="text-teal-400 disabled:opacity-40">Próxima</button></div></div>
  </div>;
}
