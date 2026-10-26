import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, BarChart3, Target } from 'lucide-react';

const tasks = [
  { title: 'Registre entradas e saídas', description: 'Adicione valor, data e categoria. Encontre suas movimentações usando busca e filtros.', icon: Wallet, path: '/transactions', loggedLabel: 'Ver minhas movimentações', guestLabel: 'Criar conta para registrar', example: 'Salário + R$ 4.000,00 · Mercado − R$ 350,00' },
  { title: 'Entenda seus gastos', description: 'Compare categorias e períodos nos gráficos. Consulte seus resultados e baixe relatórios em PDF.', icon: BarChart3, path: '/reports', loggedLabel: 'Consultar meus relatórios', guestLabel: 'Criar conta para analisar', example: 'Alimentação, moradia, transporte: cada gasto no seu lugar.' },
  { title: 'Planeje seus objetivos', description: 'Defina uma meta e acompanhe os valores que você já reservou. O registro não transfere dinheiro.', icon: Target, path: '/goals', loggedLabel: 'Acompanhar minhas metas', guestLabel: 'Criar conta para planejar', example: 'Viagem: R$ 600 reservados de uma meta de R$ 2.000.' },
];

export function HomeFeatures({ isLogged }: { isLogged: boolean }) {
  return (
    <section id="recursos" className="w-full border-t border-line px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div data-reveal="up" className="mb-7 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">O que você pode fazer aqui</h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">Do primeiro registro ao planejamento de um objetivo, comece pelo que precisa hoje.</p>
        </div>
        <div data-reveal-stagger className="grid gap-4 md:grid-cols-3">
          {tasks.map(({ title, description, icon: Icon, path, loggedLabel, guestLabel, example }) => (
            <article key={path} data-reveal="up" className="flex flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-ink"><Icon size={21} aria-hidden="true" /></span>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{description}</p>
              <p className="mb-4 mt-4 rounded-lg bg-elevated p-3 text-xs leading-relaxed text-muted"><span className="font-semibold">Exemplo: </span>{example}</p>
              <Link to={isLogged ? path : '/register'} className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">{isLogged ? loggedLabel : guestLabel}<ArrowRight size={15} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
