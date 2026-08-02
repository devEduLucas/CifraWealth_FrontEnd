import { ArrowUp, Check, Sprout, Wifi } from 'lucide-react';

export function IllustrationSection() {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[380px] lg:mx-0">
      {/* Cartão do telefone */}
      <div className="absolute left-1/2 top-0 h-[290px] w-[250px] -translate-x-1/2 rounded-[28px] border border-[#262F40] bg-[#121827] p-5 shadow-2xl shadow-black/40">
        <p className="text-center text-xs text-slate-500">Saldo total</p>
        <p className="mt-1 text-center text-2xl font-bold text-white">R$ 48.320,00</p>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-lg bg-emerald-500/10 px-2 py-1.5 text-center">
            <p className="text-[10px] text-slate-400">Receitas</p>
            <p className="text-sm font-semibold text-emerald-400">+12%</p>
          </div>
          <div className="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-center">
            <p className="text-[10px] text-slate-400">Despesas</p>
            <p className="text-sm font-semibold text-red-400">-4%</p>
          </div>
        </div>

        <svg viewBox="0 0 210 60" className="mt-4 w-full" aria-hidden="true">
          <polyline
            points="0,48 35,40 70,44 105,20 140,26 210,6"
            fill="none"
            stroke="#34D399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-slate-600">
          <span>Mar</span>
          <span>Abr</span>
          <span>Mai</span>
        </div>
      </div>

      {/* Cartão flutuante: Patrimônio */}
      <div className="absolute left-0 top-8 flex items-center gap-2 rounded-xl border border-[#262F40] bg-[#121827] px-3 py-2 shadow-xl shadow-black/40">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
          <ArrowUp size={12} className="text-emerald-400" />
        </span>
        <div>
          <p className="text-[10px] text-slate-500">Patrimônio</p>
          <p className="text-xs font-semibold text-emerald-400">+23,4%</p>
        </div>
      </div>

      {/* Cartão flutuante: Meta atingida */}
      <div className="absolute right-0 top-[185px] flex items-center gap-2 rounded-xl border border-[#262F40] bg-[#121827] px-3 py-2 shadow-xl shadow-black/40">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <Check size={12} className="text-slate-950" />
        </span>
        <div>
          <p className="text-xs font-semibold text-white">Meta atingida</p>
          <p className="text-[10px] text-slate-500">R$ 10.000 poupados</p>
        </div>
      </div>

      {/* Cartão de crédito */}
      <div className="absolute bottom-0 left-1/2 h-[105px] w-[210px] translate-x-[-40%] rounded-2xl border border-[#262F40] bg-[#1E2B45] p-4 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <span className="h-5 w-7 rounded bg-slate-500/40" />
          <Wifi size={16} className="rotate-90 text-slate-400" />
        </div>
        <p className="mt-4 text-sm tracking-widest text-slate-300">•••• •••• •••• 4821</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-300">ALEX MENDES</span>
          <span className="text-xs font-bold italic text-white">VISA</span>
        </div>
      </div>

      {/* Ícone de poupança/crescimento */}
      <div className="absolute bottom-6 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
        <Sprout size={18} className="text-emerald-400" />
      </div>
    </div>
  );
}
