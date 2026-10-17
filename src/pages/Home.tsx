import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Target,
  BarChart3,
  ShieldCheck,
  Wallet,
  PieChart,
  Layers,
  Lock,
  ChevronDown,
  CheckCircle2,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  KeyRound,
  Smartphone,
  CreditCard,
  FileText,
  Compass,
} from 'lucide-react';
import { Logo } from '../components/Logo/Logo';
import { useTheme } from '../hooks/useTheme';
import { session } from '../lib/session';

const NAV_LINKS = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'como-funciona', label: 'Como Funciona' },
  { id: 'principios', label: 'Princípios' },
  { id: 'duvidas', label: 'Dúvidas' },
  { id: 'seguranca', label: 'Segurança' },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'O CifraWealth precisa de acesso direto à minha conta bancária?',
    answer:
      'Não. O CifraWealth foi concebido como uma plataforma de planejamento e controle financeiro pessoal consciente. Você tem total autonomia para registrar e gerenciar seus lançamentos sem precisar compartilhar senhas bancárias ou expor credenciais de instituições financeiras.',
  },
  {
    question: 'Meus dados e histórico financeiro estão realmente seguros?',
    answer:
      'Sim, a segurança é nossa prioridade central. Todas as conexões são protegidas por criptografia HTTPS/TLS de ponta a ponta, senhas armazenadas com hash criptográfico seguro e sessões controladas por tokens JWT protegidos. Seus dados nunca são vendidos ou repassados a terceiros.',
  },
  {
    question: 'O uso da plataforma é gratuito?',
    answer:
      'Sim. Você pode criar sua conta gratuitamente hoje mesmo e ter acesso imediato à organização de categorias, registro de transações, criação de metas financeiras e relatórios analíticos completos, sem taxas ocultas.',
  },
  {
    question: 'Posso utilizar o CifraWealth no meu celular?',
    answer:
      'Com certeza. Toda a aplicação foi desenvolvida com design totalmente responsivo, garantindo excelente experiência tanto em smartphones e tablets quanto em notebooks e desktops com telas amplas.',
  },
  {
    question: 'Como funciona a recuperação de conta caso eu esqueça minha senha?',
    answer:
      'Basta clicar em "Esqueceu a senha?" na tela de login e digitar seu e-mail cadastrado. O sistema gerará um link exclusivo e temporário de redefinição para que você defina uma nova credencial com total segurança.',
  },
];

export function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isLogged = session.isAuthenticated();

  const themeLabel = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      const sectionIds = ['recursos', 'como-funciona', 'principios', 'duvidas', 'seguranca'];

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection('');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col font-sans selection:bg-accent/20 selection:text-foreground transition-colors duration-200">
      {/* =========================================================================
          1. HEADER / TOP BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo / Marca */}
          <Link
            to="/"
            className="hover:opacity-90 transition-opacity flex-shrink-0 focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <Logo iconSize={32} />
          </Link>

          {/* Navegação Desktop com Indicador Ativo e Âncoras Suaves */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`relative text-sm transition-all duration-200 py-1.5 focus-visible:outline-none focus-visible:text-accent ${
                    isActive
                      ? 'text-accent font-semibold'
                      : 'text-muted hover:text-foreground font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-all duration-300"
                      aria-hidden="true"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Ações & Alternador de Tema */}
          <div className="flex items-center gap-3">
            {/* Alternador de Tema */}
            <button
              type="button"
              aria-label={themeLabel}
              title={themeLabel}
              onClick={toggleTheme}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-muted transition-colors hover:bg-elevated hover:text-foreground hover:border-line-strong sm:px-3 focus-visible:ring-2 focus-visible:ring-accent"
            >
              {theme === 'dark' ? <Sun size={17} className="text-warning" /> : <Moon size={17} className="text-accent" />}
              <span className="hidden text-xs font-semibold sm:inline">
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            </button>

            {/* Ações: Usuário autenticado vs Visitante */}
            {isLogged ? (
              <div className="hidden sm:flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground px-3.5 py-2 rounded-xl border border-line hover:bg-elevated hover:border-line-strong transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-[#042f2e] text-sm font-bold shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                >
                  Ir para o Painel <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-secondary hover:text-foreground px-4 py-2 rounded-xl transition-colors hover:bg-elevated"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-[#042f2e] text-sm font-bold shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                >
                  Criar conta <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* Botão Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-line text-secondary hover:text-foreground hover:bg-elevated transition-colors"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-line bg-surface px-6 py-5 flex flex-col gap-2 animate-in fade-in duration-200">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm py-2 px-3 rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-accent/15 text-accent font-semibold'
                      : 'text-muted hover:text-foreground font-medium hover:bg-elevated'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_rgba(45,212,191,0.8)]" />}
                </a>
              );
            })}

            <div className="pt-4 border-t border-line flex flex-col gap-2.5">
              {isLogged ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(-1);
                    }}
                    className="w-full text-center text-sm font-semibold text-secondary py-2.5 rounded-xl border border-line flex items-center justify-center gap-2 hover:bg-elevated"
                  >
                    <ArrowLeft size={16} /> Voltar onde estava
                  </button>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-sm font-bold text-[#042f2e] bg-accent py-2.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    Ir para o Painel <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-sm font-semibold text-secondary py-2.5 rounded-xl border border-line hover:bg-elevated"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-sm font-bold text-[#042f2e] bg-accent py-2.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    Criar conta gratuita <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. MAIN CONTENT
          ========================================================================= */}
      <main className="flex-1">
        {/* -----------------------------------------------------------------------
            SEÇÃO HERO
            ----------------------------------------------------------------------- */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Luzes de ambientação sutis */}
          <div
            className="absolute -top-24 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 -right-24 w-96 h-96 bg-info/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
            {/* Coluna de Texto & Chamada Principal */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Badge Kicker */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold tracking-wide mb-6">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>Gestão Financeira Pessoal & Patrimonial</span>
              </div>

              {/* Título Principal de Impacto */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                Mais clareza para cuidar do seu{' '}
                <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-8">
                  dinheiro
                </span>
                .
              </h1>

              {/* Descrição Concisa */}
              <p className="text-base sm:text-lg text-secondary max-w-xl leading-relaxed mb-8">
                Centralize suas movimentações, classifique entradas e saídas com categorias personalizadas e acompanhe suas metas em uma interface intuitiva, segura e focada em resultados.
              </p>

              {/* Ações Primárias / Secundárias */}
              {isLogged ? (
                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#042f2e] font-bold text-sm shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                  >
                    Acessar Painel Principal <ArrowRight size={18} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-secondary hover:text-foreground font-semibold text-sm transition-colors rounded-xl border border-line hover:bg-elevated hover:border-line-strong"
                  >
                    <ArrowLeft size={16} /> Voltar onde estava
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-[#042f2e] font-bold text-sm shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                  >
                    Começar Gratuitamente <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-secondary hover:text-foreground font-semibold text-sm transition-colors rounded-xl border border-line hover:bg-elevated hover:border-line-strong"
                  >
                    Já tenho conta <ArrowUpRight size={16} className="text-muted" />
                  </Link>
                </div>
              )}

              {/* Marcadores de Confiança */}
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-muted mt-8 pt-6 border-t border-line/80 w-full">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-positive" />
                  <span>Criptografia de ponta a ponta</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-positive" />
                  <span>Sem dados compartilhados</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-positive" />
                  <span>Acesso instantâneo</span>
                </div>
              </div>
            </div>

            {/* Coluna Visual: Mockup do Painel */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-surface border border-line-strong/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                {/* Cabeçalho da Janela Mockup */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-line">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-danger/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-warning/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-positive/80 inline-block" />
                    <span className="ml-2 text-xs font-mono text-muted tracking-tight">cifrawealth.app/overview</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-positive/10 text-positive text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                    <span>Sincronizado</span>
                  </div>
                </div>

                {/* Resumo do Saldo Consolidado */}
                <div className="bg-elevated/70 rounded-xl p-4 border border-line mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted">Patrimônio Consolidado</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-positive bg-positive/10 px-2 py-0.5 rounded-md">
                      <TrendingUp size={12} /> +12,4% no mês
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                    R$ 48.320,00
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-line/60">
                    <div>
                      <span className="text-[11px] text-muted block mb-0.5">Receitas</span>
                      <span className="text-sm font-bold text-positive tabular-nums flex items-center gap-1">
                        <ArrowUpRight size={14} /> R$ 9.450,00
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted block mb-0.5">Despesas</span>
                      <span className="text-sm font-bold text-danger tabular-nums flex items-center gap-1">
                        <ArrowDownRight size={14} /> R$ 4.210,00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gráfico SVG de Fluxo */}
                <div className="relative w-full h-32 mb-4 bg-elevated/40 rounded-xl p-3 border border-line">
                  <div className="flex items-center justify-between text-[11px] text-muted font-medium mb-1">
                    <span>Fluxo dos últimos 6 meses</span>
                    <span className="text-accent font-semibold">Balanço Positivo</span>
                  </div>
                  <svg viewBox="0 0 420 90" className="w-full h-20 overflow-visible" role="img" aria-label="Gráfico de evolução financeira">
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 70 C40 65 70 50 110 55 S180 35 220 42 S290 20 330 25 S380 12 420 8 L420 90 L0 90 Z"
                      fill="url(#heroGradient)"
                    />
                    <path
                      d="M0 70 C40 65 70 50 110 55 S180 35 220 42 S290 20 330 25 S380 12 420 8"
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] font-mono text-muted px-1">
                    <span>MAI</span>
                    <span>JUN</span>
                    <span>JUL</span>
                    <span>AGO</span>
                    <span>SET</span>
                    <span>OUT</span>
                  </div>
                </div>

                {/* Micro-lista de Lançamentos Recentes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted px-1">
                    <span>Últimas movimentações</span>
                    <Link to="/transactions" className="text-accent hover:underline">Ver todas</Link>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-elevated/50 border border-line text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
                        <Wallet size={14} />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block">Salário e Dividendos</span>
                        <span className="text-[10px] text-muted block">Hoje · Renda Fixa</span>
                      </div>
                    </div>
                    <span className="font-bold text-positive tabular-nums">+ R$ 7.500,00</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-elevated/50 border border-line text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-danger/15 text-danger flex items-center justify-center font-bold">
                        <PieChart size={14} />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block">Mercado & Mantimentos</span>
                        <span className="text-[10px] text-muted block">Ontem · Alimentação</span>
                      </div>
                    </div>
                    <span className="font-bold text-secondary tabular-nums">- R$ 420,00</span>
                  </div>
                </div>
              </div>

              {/* Widget Flutuante Superior */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-surface/95 border border-line-strong rounded-xl p-3.5 shadow-xl items-center gap-3 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                  <Target size={18} />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-foreground">Reserva de Emergência</span>
                    <span className="text-xs font-mono font-bold text-accent">78%</span>
                  </div>
                  <div className="w-32 h-1.5 bg-line rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              {/* Widget Flutuante Inferior */}
              <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-surface/95 border border-line-strong rounded-xl p-3 shadow-xl items-center gap-2.5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-info/15 text-info flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <b className="text-xs text-foreground block">Privacidade Ativa</b>
                  <span className="text-[10px] text-muted block">Apenas você tem acesso</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SEÇÃO 1: RECURSOS (#recursos) - Layout Bento Dinâmico
            ----------------------------------------------------------------------- */}
        <section id="recursos" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-line">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-3">
              <Layers size={14} />
              <span>ECOSSISTEMA INTEGRADO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Recursos pensados para o seu controle real.
            </h2>
            <p className="text-secondary text-base leading-relaxed">
              Diga adeus a anotações soltas e planilhas complexas. Conheça as ferramentas que transformam dados brutos em decisões claras.
            </p>
          </div>

          {/* Grid Estilo Bento com 4 cards distintos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Categorização Customizada (Ocupa 2 colunas em telas grandes) */}
            <article className="lg:col-span-2 rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <PieChart size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
                    MÓDULO 01
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Categorias Flexíveis e Centros de Custo
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xl">
                  Agrupe despesas por segmentos que façam sentido para o seu cotidiano. Veja instantaneamente a distribuição de gastos fixos, variáveis e investimentos mensais.
                </p>

                {/* Exibição Visual de Badges e Distribuição */}
                <div className="bg-elevated/80 rounded-xl p-4 border border-line mb-6">
                  <div className="flex items-center justify-between text-xs text-muted mb-3">
                    <span className="font-semibold text-foreground">Exemplo de Distribuição por Categoria</span>
                    <span className="font-mono text-accent">Total: R$ 4.210,00</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                      <span className="text-foreground">Moradia & Contas</span>
                      <span className="text-muted font-mono font-semibold">42%</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                      <span className="text-foreground">Alimentação & Feira</span>
                      <span className="text-muted font-mono font-semibold">24%</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-info" />
                      <span className="text-foreground">Transporte</span>
                      <span className="text-muted font-mono font-semibold">16%</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple" />
                      <span className="text-foreground">Aportes & Lazer</span>
                      <span className="text-muted font-mono font-semibold">18%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={isLogged ? '/categories' : '/register'}
                className="text-xs font-bold text-accent inline-flex items-center gap-1.5 hover:underline"
              >
                {isLogged ? 'Gerenciar minhas categorias' : 'Explorar organização de categorias'}{' '}
                <ArrowRight size={14} />
              </Link>
            </article>

            {/* Card 2: Metas Financeiras */}
            <article className="rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-info/15 text-info flex items-center justify-center">
                    <Target size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
                    MÓDULO 02
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  Metas com Progresso em Tempo Real
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Defina metas para curto, médio e longo prazo. Monitore a porcentagem de conclusão com valores estipulados e prazos realistas.
                </p>

                {/* Exibição Visual de Metas */}
                <div className="bg-elevated/80 rounded-xl p-4 border border-line mb-6 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-foreground font-semibold">Reserva de Emergência</span>
                      <span className="text-positive font-mono font-bold">78%</span>
                    </div>
                    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-positive rounded-full" style={{ width: '78%' }} />
                    </div>
                    <span className="text-[10px] text-muted block mt-1">R$ 15.600 de R$ 20.000</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-foreground font-semibold">Viagem de Férias</span>
                      <span className="text-info font-mono font-bold">60%</span>
                    </div>
                    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-info rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-[10px] text-muted block mt-1">R$ 6.000 de R$ 10.000</span>
                  </div>
                </div>
              </div>

              <Link
                to={isLogged ? '/goals' : '/register'}
                className="text-xs font-bold text-info inline-flex items-center gap-1.5 hover:underline"
              >
                {isLogged ? 'Acessar minhas metas' : 'Definir objetivos'}{' '}
                <ArrowRight size={14} />
              </Link>
            </article>

            {/* Card 3: Registro de Transações */}
            <article className="rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-positive/15 text-positive flex items-center justify-center">
                    <Wallet size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
                    MÓDULO 03
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  Lançamentos Ágeis e Extrato
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6">
                  Registre despesas e receitas instantaneamente no computador ou celular. Pesquise lançamentos por data, valor ou descrição.
                </p>

                {/* Micro-preview de Lançamento */}
                <div className="bg-elevated/80 rounded-xl p-3.5 border border-line mb-6 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface border border-line">
                    <span className="font-semibold text-foreground">Aporte Previdência</span>
                    <span className="font-bold text-positive tabular-nums">+ R$ 1.200,00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface border border-line">
                    <span className="font-semibold text-foreground">Internet Fibra</span>
                    <span className="font-bold text-danger tabular-nums">- R$ 149,90</span>
                  </div>
                </div>
              </div>

              <Link
                to={isLogged ? '/transactions' : '/register'}
                className="text-xs font-bold text-positive inline-flex items-center gap-1.5 hover:underline"
              >
                {isLogged ? 'Ver todas as movimentações' : 'Conhecer extrato inteligente'}{' '}
                <ArrowRight size={14} />
              </Link>
            </article>

            {/* Card 4: Relatórios Analíticos (Ocupa 2 colunas em telas grandes) */}
            <article className="lg:col-span-2 rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple/15 text-purple flex items-center justify-center">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
                    MÓDULO 04
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Relatórios e Balanço Mensal
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xl">
                  Compare o saldo de meses anteriores com gráficos de barras verticais e fluxo de caixa consolidado. Enxergue a evolução da sua poupança de forma nítida.
                </p>

                {/* Exibição Visual de Gráfico de Barras */}
                <div className="bg-elevated/80 rounded-xl p-4 border border-line mb-6">
                  <div className="flex items-center justify-between text-xs text-muted mb-3">
                    <span className="font-semibold text-foreground">Fluxo de Caixa Mensal (Receitas vs Despesas)</span>
                    <span className="text-positive font-bold font-mono">Saldo Positivo</span>
                  </div>
                  <div className="flex items-end gap-3 h-16 pt-2 border-t border-line/60">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-accent/40 rounded-t h-[50%]" />
                      <span className="text-[10px] font-mono text-muted">Jul</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-accent/50 rounded-t h-[65%]" />
                      <span className="text-[10px] font-mono text-muted">Ago</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-accent/70 rounded-t h-[78%]" />
                      <span className="text-[10px] font-mono text-muted">Set</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-accent rounded-t h-[92%]" />
                      <span className="text-[10px] font-mono text-accent font-bold">Out</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={isLogged ? '/reports' : '/register'}
                className="text-xs font-bold text-purple inline-flex items-center gap-1.5 hover:underline"
              >
                {isLogged ? 'Acessar relatórios completos' : 'Ver demonstração de relatórios'}{' '}
                <ArrowRight size={14} />
              </Link>
            </article>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SEÇÃO 2: COMO FUNCIONA (#como-funciona) - Esteira de Etapas Conectadas
            ----------------------------------------------------------------------- */}
        <section id="como-funciona" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-line">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-info/10 text-info text-xs font-bold uppercase tracking-wider mb-3">
              <Compass size={14} />
              <span>PASSO A PASSO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Como funciona o CifraWealth na prática.
            </h2>
            <p className="text-secondary text-base leading-relaxed">
              Sem burocracia ou integrações invasivas. Uma metodologia direta em três passos para você ter total domínio financeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Linha conectora em telas médias/grandes */}
            <div
              className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-line-strong -translate-y-8 z-0 pointer-events-none"
              aria-hidden="true"
            />

            {/* Passo 01 */}
            <div className="relative z-10 rounded-2xl bg-surface border border-line p-7 flex flex-col hover:border-line-strong transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="w-12 h-12 rounded-2xl bg-accent text-[#042f2e] flex items-center justify-center font-extrabold text-lg shadow-md">
                  1
                </span>
                <span className="text-xs font-semibold text-muted bg-elevated px-2.5 py-1 rounded-md border border-line">
                  Etapa Inicial
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Crie sua conta</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4">
                Cadastre seu e-mail e defina suas categorias personalizadas (ou aproveite nossa estrutura pré-configurada).
              </p>
              <div className="mt-auto pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-2">
                <CheckCircle2 size={14} className="text-accent" />
                <span>Leva menos de 1 minuto</span>
              </div>
            </div>

            {/* Passo 02 */}
            <div className="relative z-10 rounded-2xl bg-surface border border-line p-7 flex flex-col hover:border-line-strong transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="w-12 h-12 rounded-2xl bg-info text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  2
                </span>
                <span className="text-xs font-semibold text-muted bg-elevated px-2.5 py-1 rounded-md border border-line">
                  Rotina
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Lance suas movimentações</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4">
                Registre entradas de salário, vendas e investimentos, além de despesas do dia a dia com data e categoria.
              </p>
              <div className="mt-auto pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-2">
                <CheckCircle2 size={14} className="text-info" />
                <span>Acesso instantâneo mobile e desktop</span>
              </div>
            </div>

            {/* Passo 03 */}
            <div className="relative z-10 rounded-2xl bg-surface border border-line p-7 flex flex-col hover:border-line-strong transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="w-12 h-12 rounded-2xl bg-positive text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  3
                </span>
                <span className="text-xs font-semibold text-muted bg-elevated px-2.5 py-1 rounded-md border border-line">
                  Evolução
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Acompanhe metas e relatórios</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4">
                Veja o percentual das suas metas crescendo e analise onde você pode economizar mais a cada mês.
              </p>
              <div className="mt-auto pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-2">
                <CheckCircle2 size={14} className="text-positive" />
                <span>Decisões embasadas em números reais</span>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SEÇÃO 3: PRINCÍPIOS (#principios) - Layout Editorial de Filosofia
            ----------------------------------------------------------------------- */}
        <section id="principios" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-line">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Bloco de Apresentação da Filosofia */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple/10 text-purple text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={14} />
                <span>FILOSOFIA CIFRAWEALTH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-5">
                Clareza sem fórmulas mágicas.
              </h2>
              <p className="text-secondary text-base leading-relaxed mb-6">
                Acreditamos que tranquilidade financeira não nasce de promessas de ganhos rápidos, mas sim da consciência honesta de para onde cada centavo está indo.
              </p>
              <div className="p-4 rounded-xl bg-elevated border border-line">
                <p className="text-xs text-muted leading-relaxed italic">
                  "Quando você tem visibilidade das suas prioridades, suas decisões deixam de ser motivadas pela ansiedade e passam a ser guiadas por intenção."
                </p>
              </div>
            </div>

            {/* Cards Conceituais */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-4 hover:border-line-strong transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
                  01
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Previsibilidade sobre ansiedade
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Saber exatamente o quanto você gasta por mês elimina surpresas no final do período e permite planejar aportes com segurança.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-4 hover:border-line-strong transition-all">
                <div className="w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
                  02
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Metas realizáveis e mensuráveis
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Sonhos financeiros viram realidade quando são divididos em metas claras com acompanhamento contínuo de progresso.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-4 hover:border-line-strong transition-all">
                <div className="w-10 h-10 rounded-xl bg-positive/15 text-positive flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
                  03
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Soberania e privacidade dos seus dados
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Você é o único proprietário das suas informações financeiras. Não alimentamos algoritmos de publicidade com seus registros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SEÇÃO 4: PRINCIPAIS DÚVIDAS (#duvidas) - FAQ Interativo em Acordeão
            ----------------------------------------------------------------------- */}
        <section id="duvidas" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-line">
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
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-accent/40 bg-surface shadow-sm' : 'border-line bg-surface/70 hover:border-line-strong'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-foreground text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-accent/15 text-accent' : 'bg-elevated text-muted'
                      }`}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-secondary leading-relaxed border-t border-line/50 animate-in fade-in duration-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SEÇÃO 5: SEGURANÇA (#seguranca) - Security Vault & Confiabilidade
            ----------------------------------------------------------------------- */}
        <section id="seguranca" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-line">
          <div className="rounded-3xl bg-surface border border-line-strong p-8 sm:p-12 lg:p-16 shadow-lg relative overflow-hidden">
            {/* Ambient Shield Glow */}
            <div
              className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-positive/10 text-positive text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck size={16} />
                <span>SEGURANÇA EM PRIMEIRO LUGAR</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Construído com padrões modernos de proteção cibernética.
              </h2>
              <p className="text-secondary text-base leading-relaxed mb-8">
                Adotamos uma postura rigorosa de privacidade e integridade. Suas informações são transmitidas por canais blindados e mantidas sob controle absoluto da sua conta.
              </p>

              {/* 3 Pilares Técnicos de Segurança */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-line">
                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Sessões Blindadas</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Tokens JWT assinados com tempo de expiração curto para evitar acessos não autorizados.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-xl bg-info/15 text-info flex items-center justify-center">
                    <Lock size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Criptografia Forte</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Senhas tratadas com salt e algoritmos de hash robustos que nunca são expostas em texto plano.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-xl bg-positive/15 text-positive flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Proteção de Identidade</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Compatibilidade com autenticação segura via Google OAuth 2.0 e recuperação restrita por e-mail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            CHAMADA FINAL / BANNER DE CONVERSÃO
            ----------------------------------------------------------------------- */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-surface via-elevated to-surface border border-line-strong p-8 sm:p-12 md:p-16 text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold tracking-widest text-accent uppercase mb-3 block">
                COMECE HOJE MESMO
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Pronto para transformar sua organização financeira?
              </h2>
              <p className="text-secondary text-base leading-relaxed mb-8">
                Crie sua conta em menos de 1 minuto ou acerte seu planejamento acessando diretamente o painel.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5">
                {isLogged ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-[#042f2e] text-sm font-bold shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                    >
                      Ir para o Painel <ArrowRight size={18} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-secondary hover:text-foreground text-sm font-semibold transition-colors rounded-xl border border-line hover:bg-elevated hover:border-line-strong"
                    >
                      <ArrowLeft size={16} /> Voltar onde estava
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-[#042f2e] text-sm font-bold shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                    >
                      Criar conta gratuita <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-secondary hover:text-foreground text-sm font-semibold transition-colors rounded-xl border border-line hover:bg-elevated hover:border-line-strong"
                    >
                      Acessar conta existente <ArrowUpRight size={16} className="text-muted" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          3. FOOTER
          ========================================================================= */}
      <footer className="border-t border-line bg-surface/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Logo iconSize={26} />
            <span className="hidden sm:inline text-line-strong">|</span>
            <p className="text-xs">
              © {new Date().getFullYear()} CifraWealth. Gestão financeira pessoal inteligente.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <a href="#recursos" className="hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#principios" className="hover:text-foreground transition-colors">
              Princípios
            </a>
            <a href="#duvidas" className="hover:text-foreground transition-colors">
              Dúvidas
            </a>
            <a href="#seguranca" className="hover:text-foreground transition-colors">
              Segurança
            </a>
            {isLogged ? (
              <Link to="/dashboard" className="text-accent font-semibold hover:underline">
                Painel
              </Link>
            ) : (
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Home;
