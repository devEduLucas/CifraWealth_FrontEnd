import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo/Logo';
import { useTheme } from '../hooks/useTheme';
import { session } from '../lib/session';

export function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isLogged = session.isAuthenticated();

  const themeLabel = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';

  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col font-sans selection:bg-accent/20 selection:text-foreground transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo / Brand Oficial */}
          <Link to="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
            <Logo iconSize={32} />
          </Link>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#proposta" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Proposta
            </a>
            <a href="#principios" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Princípios
            </a>
          </nav>

          {/* Botões e Alternador de Tema */}
          <div className="flex items-center gap-3">
            {/* Botão de Tema Claro / Escuro */}
            <button
              type="button"
              aria-label={themeLabel}
              title={themeLabel}
              onClick={toggleTheme}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line px-2.5 text-muted transition-colors hover:bg-elevated hover:text-foreground sm:px-3"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden text-xs font-semibold sm:inline">
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            </button>

            {/* Ações dinâmicas (se logado, permite voltar sem novo login) */}
            {isLogged ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-foreground px-3.5 py-2 rounded-lg border border-line hover:bg-elevated transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-[#062c2a] text-sm font-bold shadow-md shadow-accent/15 hover:bg-accent/90 hover:-translate-y-0.5 transition-all"
                >
                  Ir para o Painel <span aria-hidden="true">↗</span>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-secondary hover:text-accent px-4 py-2 rounded-lg transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-[#062c2a] text-sm font-bold shadow-md shadow-accent/15 hover:bg-accent/90 hover:-translate-y-0.5 transition-all"
                >
                  Cadastrar <span aria-hidden="true">↗</span>
                </Link>
              </div>
            )}

            {/* Botão Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-secondary hover:text-foreground"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-line bg-surface px-6 py-4 flex flex-col gap-4">
            <a
              href="#recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground py-1"
            >
              Recursos
            </a>
            <a
              href="#proposta"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground py-1"
            >
              Proposta
            </a>
            <a
              href="#principios"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground py-1"
            >
              Princípios
            </a>

            <div className="pt-3 border-t border-line flex flex-col gap-2">
              {isLogged ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full text-center text-sm font-semibold text-secondary py-2.5 rounded-lg border border-line flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Voltar onde estava
                  </button>
                  <Link
                    to="/dashboard"
                    className="w-full text-center text-sm font-bold text-[#062c2a] bg-accent py-2.5 rounded-full"
                  >
                    Ir para o Painel
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center text-sm font-semibold text-secondary py-2.5 rounded-lg border border-line"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center text-sm font-bold text-[#062c2a] bg-accent py-2.5 rounded-full"
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div
            className="absolute -top-24 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-10 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
            {/* Coluna de Texto */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-widest uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                SUA VIDA FINANCEIRA EM PERSPECTIVA
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] mb-6">
                Mais clareza para cuidar do seu <span className="text-accent">dinheiro.</span>
              </h1>

              <p className="text-base sm:text-lg text-secondary max-w-xl leading-relaxed mb-8">
                Registre movimentações, organize despesas e acompanhe objetivos em uma experiência pensada para deixar sua rotina financeira mais simples de entender.
              </p>

              {isLogged ? (
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent text-[#062c2a] font-extrabold text-sm shadow-xl shadow-accent/20 hover:bg-[#5eead4] hover:-translate-y-0.5 transition-all"
                  >
                    Continuar no Painel <span aria-hidden="true">↗</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-secondary hover:text-foreground font-semibold text-sm transition-colors rounded-xl border border-line hover:bg-elevated"
                  >
                    <ArrowLeft size={16} /> Voltar onde estava
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent text-[#062c2a] font-extrabold text-sm shadow-xl shadow-accent/20 hover:bg-[#5eead4] hover:-translate-y-0.5 transition-all"
                  >
                    Criar minha conta <span aria-hidden="true">↗</span>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-5 py-3.5 text-secondary hover:text-accent font-bold text-sm transition-colors"
                  >
                    Já tenho conta · Entrar <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted mt-8 pt-4 border-t border-line/60">
                <span className="w-5 h-5 rounded-full bg-positive/15 text-positive flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span>Organização, metas e análises em uma única visão.</span>
              </div>
            </div>

            {/* Coluna Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-surface border border-line p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                  <Logo iconSize={22} />
                  <span className="text-muted text-xs tracking-widest font-mono">•••</span>
                </div>

                <div className="text-xs font-bold tracking-wider text-accent uppercase mb-1">
                  VISÃO GERAL ↗
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  Sua rotina, em perspectiva
                </div>
                <div className="text-xs text-muted mb-6">
                  Uma leitura visual das movimentações registradas.
                </div>

                {/* Gráfico SVG */}
                <div className="relative w-full h-36 mb-4">
                  <svg viewBox="0 0 420 130" className="w-full h-full overflow-visible" role="img" aria-label="Gráfico de evolução">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 108 C35 100 38 82 74 90 S119 75 145 82 S183 47 220 60 S265 38 292 46 S342 18 370 28 S400 12 420 7 L420 130 L0 130 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0 108 C35 100 38 82 74 90 S119 75 145 82 S183 47 220 60 S265 38 292 46 S342 18 370 28 S400 12 420 7"
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Meses */}
                <div className="flex justify-between text-[11px] font-medium text-muted mb-6 px-1">
                  <span>JAN</span>
                  <span>MAR</span>
                  <span>MAI</span>
                  <span>JUL</span>
                  <span>SET</span>
                  <span>NOV</span>
                </div>

                {/* Legenda */}
                <div className="flex items-center gap-6 pt-4 border-t border-line text-xs font-medium text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Movimentações
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-info" /> Metas
                  </div>
                </div>
              </div>

              {/* Badges Flutuantes */}
              <div className="hidden sm:flex absolute -top-5 -right-5 bg-elevated border border-line-strong rounded-xl p-3 shadow-xl items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold text-sm">
                  ↗
                </span>
                <div>
                  <b className="text-xs text-foreground block">Mais organização</b>
                  <span className="text-[11px] text-muted block">para o dia a dia</span>
                </div>
              </div>

              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-elevated border border-line-strong rounded-xl p-3 shadow-xl items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-info/15 text-info flex items-center justify-center font-bold text-sm">
                  ◎
                </span>
                <div>
                  <b className="text-xs text-foreground block">Seus objetivos</b>
                  <span className="text-[11px] text-muted block">em visão clara</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Faixa Intermediária */}
        <section className="border-y border-line bg-surface/50 py-12 px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-accent uppercase mb-2 block">
              FINANÇAS MAIS FÁCEIS DE ENTENDER
            </span>
            <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
              Quando as informações ficam organizadas, fica mais simples enxergar padrões e planejar os próximos passos.
            </p>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-accent uppercase mb-2 block">
              RECURSOS PARA A VIDA REAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Tudo começa com uma visão mais organizada.
            </h2>
            <p className="text-secondary text-base leading-relaxed">
              Do registro de uma despesa à revisão de uma meta, cada recurso ajuda a construir uma leitura mais completa das suas finanças.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="rounded-2xl bg-surface border border-accent/40 bg-gradient-to-b from-surface to-elevated p-8 flex flex-col justify-between hover:border-accent transition-all shadow-lg shadow-black/10">
              <div>
                <span className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center text-xl mb-6 font-bold">
                  ↔
                </span>
                <span className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                  01 / ORGANIZE
                </span>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Movimentações e categorias
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Registre receitas e despesas e agrupe cada lançamento para entender como o dinheiro circula no dia a dia.
                </p>
              </div>
              <Link to={isLogged ? '/transactions' : '/register'} className="text-xs font-bold text-accent inline-flex items-center gap-1 hover:underline">
                {isLogged ? 'Acessar movimentações ↗' : 'Explorar organização ↗'}
              </Link>
            </article>

            <article className="rounded-2xl bg-surface border border-line p-8 flex flex-col justify-between hover:border-line-strong transition-all">
              <div>
                <span className="w-12 h-12 rounded-xl bg-info/15 text-info flex items-center justify-center text-xl mb-6 font-bold">
                  ◎
                </span>
                <span className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                  02 / PLANEJE
                </span>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Metas financeiras
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Defina objetivos, acompanhe o progresso e mantenha suas prioridades visíveis ao longo do caminho.
                </p>
              </div>
              <Link to={isLogged ? '/goals' : '/register'} className="text-xs font-bold text-accent inline-flex items-center gap-1 hover:underline">
                {isLogged ? 'Acessar metas ↗' : 'Conhecer metas ↗'}
              </Link>
            </article>

            <article className="rounded-2xl bg-surface border border-line p-8 flex flex-col justify-between hover:border-line-strong transition-all">
              <div>
                <span className="w-12 h-12 rounded-xl bg-positive/15 text-positive flex items-center justify-center text-xl mb-6 font-bold">
                  ⌁
                </span>
                <span className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                  03 / ACOMPANHE
                </span>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Relatórios e evolução
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Observe os dados por período, compare resultados e identifique padrões que merecem atenção.
                </p>
              </div>
              <Link to={isLogged ? '/reports' : '/register'} className="text-xs font-bold text-accent inline-flex items-center gap-1 hover:underline">
                {isLogged ? 'Ver relatórios ↗' : 'Conhecer relatórios ↗'}
              </Link>
            </article>
          </div>
        </section>

        {/* Proposta / Princípios */}
        <section id="proposta" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-line">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold tracking-widest text-accent uppercase mb-2 block">
                UMA ABORDAGEM MAIS CONSCIENTE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
                Menos ruído.<br />
                <span className="text-accent">Mais perspectiva.</span>
              </h2>
              <p className="text-secondary text-base leading-relaxed mb-6">
                A CifraWealth foi concebida para aproximar números e decisões cotidianas. A plataforma ajuda a acompanhar o que aconteceu, visualizar prioridades e planejar com mais intenção — sem prometer resultados automáticos.
              </p>
              {isLogged ? (
                <Link to="/dashboard" className="text-sm font-bold text-accent hover:underline inline-flex items-center gap-1">
                  Voltar para o Painel →
                </Link>
              ) : (
                <Link to="/register" className="text-sm font-bold text-accent hover:underline inline-flex items-center gap-1">
                  Começar agora com sua conta →
                </Link>
              )}
            </div>

            <div id="principios" className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-5 hover:border-line-strong transition-colors">
                <span className="text-lg font-mono font-bold text-accent px-3 py-1.5 rounded-lg bg-accent/10">
                  01
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Informação organizada</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Um histórico consistente facilita a leitura da sua rotina financeira.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-5 hover:border-line-strong transition-colors">
                <span className="text-lg font-mono font-bold text-info px-3 py-1.5 rounded-lg bg-info/10">
                  02
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Objetivos visíveis</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Metas ajudam a transformar intenções em prioridades acompanháveis.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-5 hover:border-line-strong transition-colors">
                <span className="text-lg font-mono font-bold text-positive px-3 py-1.5 rounded-lg bg-positive/10">
                  03
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Revisão contínua</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Olhar para os dados com frequência ajuda a perceber o que precisa mudar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chamada Final */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-surface via-elevated to-surface border border-line-strong p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold tracking-widest text-accent uppercase mb-2 block">
                O PRÓXIMO PASSO COMEÇA COM CLAREZA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                Descubra o que você pode organizar hoje.
              </h2>
              <p className="text-secondary text-base leading-relaxed mb-8">
                Crie sua conta para começar ou continue organizando suas finanças no painel.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {isLogged ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-[#062c2a] text-sm font-bold shadow-lg shadow-accent/20 hover:bg-[#5eead4] hover:-translate-y-0.5 transition-all"
                    >
                      Ir para o Painel <span aria-hidden="true">↗</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-secondary hover:text-foreground text-sm font-semibold transition-colors rounded-xl border border-line hover:bg-elevated"
                    >
                      <ArrowLeft size={16} /> Voltar onde estava
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-[#062c2a] text-sm font-bold shadow-lg shadow-accent/20 hover:bg-[#5eead4] hover:-translate-y-0.5 transition-all"
                    >
                      Cadastrar <span aria-hidden="true">↗</span>
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 px-6 py-3.5 text-secondary hover:text-accent text-sm font-semibold transition-colors"
                    >
                      Entrar na minha conta <span aria-hidden="true">→</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted">
          <Logo iconSize={26} />

          <p className="text-center md:text-left text-xs">
            © {new Date().getFullYear()} CifraWealth. Todos os direitos reservados. Projeto de organização financeira pessoal.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium">
            {isLogged ? (
              <Link to="/dashboard" className="hover:text-foreground transition-colors">
                Painel
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Entrar
                </Link>
                <span>·</span>
                <Link to="/register" className="hover:text-foreground transition-colors">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;