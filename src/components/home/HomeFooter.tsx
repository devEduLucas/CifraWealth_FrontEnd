import { Link } from 'react-router-dom';
import { Logo } from '../Logo/Logo';

export function HomeFooter({ isLogged }: {
  isLogged: boolean;
}) {
  return (<footer className="border-t border-line bg-surface/80 py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted">
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
        <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">Termos de uso</Link>
        <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
        {isLogged ? (<Link to="/dashboard" className="text-accent-ink font-semibold hover:underline">
          Painel
        </Link>) : (<Link to="/login" className="text-accent-ink font-semibold hover:underline">
          Entrar
        </Link>)}
      </div>
    </div>
  </footer>);
}
