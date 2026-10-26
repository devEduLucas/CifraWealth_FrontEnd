const steps = [
  ['Crie e confirme sua conta', 'Cadastre seu e-mail, escolha uma senha e siga a mensagem de confirmação.'],
  ['Registre uma movimentação', 'Escolha receita ou despesa e use uma das categorias já disponíveis. Não precisa configurar tudo antes.'],
  ['Confira seu resumo', 'Os registros confirmados atualizam seu saldo e as análises. Crie metas quando quiser planejar um objetivo.'],
];

export function HomeHowItWorks() {
  return (
    <section id="como-funciona" className="w-full border-t border-line px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 data-reveal="up" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Como começar</h2>
        <ol data-reveal-stagger className="mt-7 grid gap-6 md:grid-cols-3">
          {steps.map(([title, description], index) => <li key={title} data-reveal="up" className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent-ink" aria-hidden="true">{index + 1}</span>
            <div><h3 className="text-base font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{description}</p></div>
          </li>)}
        </ol>
      </div>
    </section>
  );
}
