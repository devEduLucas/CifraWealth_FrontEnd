import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { NAV_LINKS } from './homeContent';
import { Link } from 'react-router-dom';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { Logo } from '../Logo/Logo';

export function HomeHeader({ isLogged }: {
  isLogged: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, toggleTheme } = useTheme();
  const themeLabel = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';
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
  return (<header className="home-topbar sticky z-50 border-b border-line bg-surface/90 backdrop-blur-md transition-colors">
    <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
      {/* Logo / Marca */}
      <Link to="/" className="hover:opacity-90 transition-opacity flex-shrink-0 focus-visible:ring-2 focus-visible:ring-accent rounded-lg">
        <Logo iconSize={32} />
      </Link>

      {/* Navegação Desktop com Indicador Ativo e Âncoras Suaves */}
      <nav className="hidden xl:flex items-center gap-7" aria-label="Navegação principal">
        {NAV_LINKS.map((link) => {
          const isActive = activeSection === link.id;
          return (<a key={link.id} href={`#${link.id}`} className={`relative text-sm transition-all duration-200 py-1.5 focus-visible:outline-none focus-visible:text-accent-ink ${isActive
            ? 'text-accent-ink font-semibold'
            : 'text-muted hover:text-foreground font-medium'}`}>
            <span>{link.label}</span>
            {isActive && (<span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full shadow-sm shadow-accent/30 transition-all duration-300" aria-hidden="true" />)}
          </a>);
        })}
      </nav>

      {/* Ações & Alternador de Tema */}
      <div className="flex items-center gap-3">
        {/* Alternador de Tema */}
        <button type="button" aria-label={themeLabel} title={themeLabel} onClick={toggleTheme} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-muted transition-colors hover:bg-elevated hover:text-foreground hover:border-line-strong sm:px-3 focus-visible:ring-2 focus-visible:ring-accent">
          {theme === 'dark' ? <Sun size={17} className="text-warning" /> : <Moon size={17} className="text-accent-ink" />}
          <span className="hidden text-xs font-semibold sm:inline">
            {theme === 'dark' ? 'Claro' : 'Escuro'}
          </span>
        </button>

        {/* Ações: Usuário autenticado vs Visitante */}
        {isLogged ? (<div className="hidden sm:flex items-center gap-2.5">
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-on-accent text-sm font-bold shadow-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
            Ir para o Painel <ArrowRight size={16} />
          </Link>
        </div>) : (<div className="hidden sm:flex items-center gap-2.5">
          <Link to="/login" className="text-sm font-semibold text-secondary hover:text-foreground px-4 py-2 rounded-xl transition-colors hover:bg-elevated">
            Entrar
          </Link>
          <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-on-accent text-sm font-bold shadow-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
            Criar conta <ArrowRight size={16} />
          </Link>
        </div>)}

        {/* Botão Hambúrguer Mobile */}
        <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="xl:hidden p-2 rounded-xl border border-line text-secondary hover:text-foreground hover:bg-elevated transition-colors" aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'} aria-expanded={mobileMenuOpen}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />)}
          </svg>
        </button>
      </div>
    </div>

    {/* Menu Mobile Dropdown */}
    {mobileMenuOpen && (<div className="xl:hidden border-b border-line bg-surface px-6 py-5 flex flex-col gap-2 animate-in fade-in duration-200">
      {NAV_LINKS.map((link) => {
        const isActive = activeSection === link.id;
        return (<a key={link.id} href={`#${link.id}`} onClick={() => setMobileMenuOpen(false)} className={`text-sm py-2 px-3 rounded-xl flex items-center justify-between transition-colors ${isActive
          ? 'bg-accent/10 text-accent-ink font-semibold'
          : 'text-muted hover:text-foreground font-medium hover:bg-elevated'}`}>
          <span>{link.label}</span>
          {isActive && <span className="w-2 h-2 rounded-full bg-accent shadow-sm shadow-accent/30" />}
        </a>);
      })}

      <div className="pt-4 border-t border-line flex flex-col gap-2.5">
        {isLogged ? (<>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center text-sm font-bold text-on-accent bg-accent py-2.5 rounded-xl flex items-center justify-center gap-2">
            Ir para o Painel <ArrowRight size={16} />
          </Link>
        </>) : (<>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center text-sm font-semibold text-secondary py-2.5 rounded-xl border border-line hover:bg-elevated">
            Entrar
          </Link>
          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center text-sm font-bold text-on-accent bg-accent py-2.5 rounded-xl flex items-center justify-center gap-2">
            Criar conta gratuita <ArrowRight size={16} />
          </Link>
        </>)}
      </div>
    </div>)}
  </header>);
}
