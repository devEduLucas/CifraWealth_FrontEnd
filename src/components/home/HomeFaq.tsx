import { useState } from 'react';
import { FAQ_ITEMS } from './homeContent';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function HomeFaq() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const toggleFaq = (index: number) => setOpenFaqIndex(previous => previous === index ? null : index);
  return (<section id="duvidas" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-line">
    <div className="text-center mb-14">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider mb-3">
        <HelpCircle size={14} />
        <span>PERGUNTAS FREQUENTES</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
        Tudo o que você precisa saber.
      </h2>
      <p className="text-secondary text-base leading-relaxed max-w-xl mx-auto">
        Respondemos às principais dúvidas para que você comece sua organização com total segurança e tranquilidade.
      </p>
    </div>

    {/* Acordeão Interativo */}
    <div className="space-y-3.5">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openFaqIndex === index;
        return (<div key={index} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-accent/40 bg-surface shadow-sm' : 'border-line bg-surface/70 hover:border-line-strong'}`}>
          <button type="button" onClick={() => toggleFaq(index)} className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-semibold text-foreground text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-expanded={isOpen}>
            <span>{item.question}</span>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-accent/10 text-accent-ink' : 'bg-elevated text-muted'}`}>
              <ChevronDown size={16} />
            </span>
          </button>

          {isOpen && (<div className="px-6 pb-5 pt-1 text-sm text-secondary leading-relaxed border-t border-line/50 animate-in fade-in duration-200">
            {item.answer}
          </div>)}
        </div>);
      })}
    </div>
  </section>);
}
