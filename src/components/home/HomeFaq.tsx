import { useState } from 'react';
import { FAQ_ITEMS } from './homeContent';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function HomeFaq() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const toggleFaq = (index: number) => setOpenFaqIndex(previous => previous === index ? null : index);
  return (<section id="duvidas" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto border-t border-line">
    <div data-reveal-stagger className="text-center mb-7">
      <div data-reveal="up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider mb-3">
        <HelpCircle size={14} />
        <span>PERGUNTAS FREQUENTES</span>
      </div>
      <h2 data-reveal="up" className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
        Antes de começar, tire suas dúvidas
      </h2>
      <p data-reveal="up" className="text-secondary text-base leading-relaxed max-w-xl mx-auto">
        Entenda o funcionamento, o acesso e o que está incluído.
      </p>
    </div>

    {/* Acordeão Interativo */}
    <div data-reveal-stagger className="space-y-3.5">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openFaqIndex === index;
        return (<div key={index} data-reveal="up" className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-accent/40 bg-surface shadow-sm' : 'border-line bg-surface/70 hover:border-line-strong'}`}>
          <button id={`home-faq-question-${index}`} aria-controls={`home-faq-answer-${index}`} type="button" onClick={() => toggleFaq(index)} className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-foreground text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-expanded={isOpen}>
            <span>{item.question}</span>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-accent/10 text-accent-ink' : 'bg-elevated text-muted'}`}>
              <ChevronDown size={16} />
            </span>
          </button>

          <div id={`home-faq-answer-${index}`} role="region" aria-labelledby={`home-faq-question-${index}`} hidden={!isOpen} className="px-5 pb-5 pt-3 text-sm text-secondary leading-relaxed border-t border-line/50">
            {item.answer}
          </div>
        </div>);
      })}
    </div>
  </section>);
}
