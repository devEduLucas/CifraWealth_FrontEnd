import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, CheckCheck, Clock3, Moon, Sun, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useTheme } from '../../hooks/useTheme';
import { buildNotifications, type AppNotification } from '../../utils/notifications';
import { localDateOnly } from '../../utils/reports';
import { AccessibilityButton } from '../AccessibilityTools/AccessibilityTools';
import { UserAvatar } from '../UserAvatar/UserAvatar';
import { useSessionUser } from '../../hooks/useSessionUser';

const SECTION_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard', '/transactions': 'Transações', '/categories': 'Categorias',
  '/goals': 'Metas', '/reports': 'Relatórios', '/profile': 'Perfil',
};
const TONES = { danger: 'bg-danger/10 text-danger', warning: 'bg-warning/10 text-warning', info: 'bg-info/10 text-info' };

interface AppHeaderProps {
  userName: string;
}

export function AppHeader({ userName }: AppHeaderProps) {
  const user = useSessionUser();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const themeLabel = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    closeRef.current?.focus();
    Promise.all([api.listGoals(), api.listTransactions({ status: 'pendente' })])
      .then(([goals, transactions]) => { if (active) setNotifications(buildNotifications(goals, transactions, localDateOnly())); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar os lembretes. Tente novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, retry]);

  useEffect(() => {
    if (!open) return;
    const clickAway = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); bellRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', clickAway);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', clickAway); document.removeEventListener('keydown', escape); };
  }, [open]);

  return (
    <header ref={headerRef} aria-label="Cabeçalho principal" className="app-topbar fixed inset-x-0 z-40 h-20 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-subtle sm:text-[11px]">Meu espaço <span aria-hidden="true" className="mx-1">/</span> {SECTION_NAMES[pathname] ?? 'CifraWealth'}</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground sm:text-base">{userName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <AccessibilityButton />
          <button type="button" aria-label={themeLabel} title={themeLabel} onClick={() => { setOpen(false); toggleTheme(); }} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line px-2.5 text-muted transition-colors hover:bg-elevated hover:text-foreground sm:px-3">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden text-xs font-semibold sm:inline">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>
          <button ref={bellRef} type="button" aria-label="Notificações" aria-expanded={open} aria-controls={open ? 'app-notifications' : undefined} title="Notificações" onClick={() => setOpen((value) => !value)} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-elevated hover:text-foreground">
            <Bell size={18} />
            {!error && notifications.length > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-on-accent">{notifications.length > 9 ? '9+' : notifications.length}</span>}
          </button>
          <span aria-hidden="true" className="mx-1 h-7 w-px bg-line" />
          <Link to="/profile" onClick={() => setOpen(false)} aria-label="Abrir meu perfil" title="Meu perfil" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-accent/10 transition-shadow hover:ring-accent/25"><UserAvatar name={userName} photo={user?.foto_perfil} className="h-full w-full text-xs" /></Link>
        </div>
      </div>
      {open && (
        <section id="app-notifications" aria-labelledby="notifications-title" className="app-notifications absolute right-4 max-h-[calc(100dvh-180px)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-surface shadow-xl shadow-black/10 sm:right-6 lg:right-10">
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <div><h2 id="notifications-title" className="text-sm font-semibold text-foreground">Notificações</h2><p className="mt-1 text-xs text-muted">Metas e pendências para acompanhar.</p></div>
            <button ref={closeRef} type="button" aria-label="Fechar notificações" onClick={() => { setOpen(false); bellRef.current?.focus(); }} className="rounded-lg p-1 text-muted hover:bg-hover"><X size={17} /></button>
          </div>
          {loading ? <p role="status" className="px-5 py-8 text-sm text-muted">Carregando lembretes...</p> : error ? (
            <div className="p-5"><p role="alert" className="text-sm text-danger">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 text-sm font-semibold text-accent-ink">Tentar novamente</button></div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-8 text-center"><CheckCheck size={28} className="mx-auto text-positive" /><p className="mt-3 text-sm font-semibold text-foreground">Tudo em dia</p><p className="mt-1 text-xs leading-5 text-muted">Sem metas próximas do prazo ou transações pendentes no momento.</p></div>
          ) : (
            <ul className="divide-y divide-line">{notifications.map((notification) => <li key={notification.id}>
              <Link to={notification.to} onClick={() => setOpen(false)} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-elevated">
                <span className={'mt-0.5 rounded-xl p-2 ' + TONES[notification.tone]}><Clock3 size={16} /></span>
                <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-foreground">{notification.title}</p><p className="mt-1 text-xs leading-5 text-muted">{notification.description}</p></div>
                <ArrowUpRight size={15} className="mt-1 shrink-0 text-subtle" />
              </Link>
            </li>)}</ul>
          )}
        </section>
      )}
    </header>
  );
}
