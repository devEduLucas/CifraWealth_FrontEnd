import { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Fingerprint,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { session } from '../lib/session';
import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../lib/theme';

type DialogType = 'privacy' | 'logout' | 'delete-account' | null;

export function ProfilePage() {
  const navigate = useNavigate();
  const { preference, setPreference } = useTheme();
  const [user, setUser] = useState(() => session.getUser());
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(() => user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : '');
  const [draftEmail, setDraftEmail] = useState(() => user?.email ?? '');
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CW';

  const [showEmail, setShowEmail] = useState(true);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [notice, setNotice] = useState('');

  function handleLogout() {
    session.clear();
    navigate('/login', { replace: true });
  }

  function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !draftName.trim() || !draftEmail.trim()) {
      setNotice('Preencha nome e e-mail para salvar as alterações.');
      return;
    }

    const nameParts = draftName.trim().split(/\\s+/);
    const updatedUser = {
      ...user,
      nome: nameParts[0],
      sobrenome: nameParts.slice(1).join(' ') || null,
      email: draftEmail.trim(),
    };
    const token = session.getToken();
    if (token) session.save(token, updatedUser);
    setUser(updatedUser);
    setIsEditing(false);
    setNotice('Perfil atualizado nesta sessão. A alteração no servidor depende de uma API de atualização de perfil.');
  }

  function handleDeleteAccountConfirmation() {
    // A API atual não expõe uma operação de exclusão de conta.
    // Não simular exclusão nem apagar apenas a sessão como se fosse a conta inteira.
    setDialog(null);
    setNotice(
      'A exclusão de conta ainda não está disponível. Nenhuma conta foi excluída; é necessário integrar esta ação ao backend.'
    );
  }

  const themeOptions: { value: ThemePreference; title: string; description: string; icon: typeof Sun }[] = [
    { value: 'system', title: 'Automático', description: 'Segue seu dispositivo', icon: Wallet },
    { value: 'light', title: 'Claro', description: 'Visual iluminado', icon: Sun },
    { value: 'dark', title: 'Escuro', description: 'Mais conforto visual', icon: Moon },
  ];

  return (
    <DashboardLayout userName={fullName}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">
              Sua conta CifraWealth
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Perfil e preferências<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Cuide das suas informações e personalize seu espaço financeiro.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-xs font-medium text-muted">
            <UserRound size={15} className="text-accent-ink" />
            Perfil da conta
          </span>
        </header>

        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="relative h-24 overflow-hidden bg-gradient-to-r from-blue-600/20 via-accent/10 to-teal-500/20 sm:h-32">
            <div aria-hidden="true" className="absolute -right-8 -top-24 h-64 w-64 rounded-full border border-accent/20" />
            <div aria-hidden="true" className="absolute -right-2 -top-16 h-48 w-48 rounded-full border border-accent/20" />
            <div className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-lg border border-line bg-surface/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-secondary sm:left-7">
              <Fingerprint size={14} className="text-accent-ink" />
              CIFRA ID <span className="text-accent">•</span> PERFIL PESSOAL
            </div>
          </div>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex min-w-0 items-center gap-4">
              <div className="-mt-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-surface bg-accent text-xl font-bold text-on-accent sm:-mt-12 sm:h-20 sm:w-20 sm:text-2xl">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words text-lg font-bold text-foreground sm:text-xl">{fullName}</h2>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent-ink">
                    Conta pessoal
                  </span>
                </div>
                <p className="mt-1 break-all text-sm text-muted">
                  {showEmail ? (user?.email ?? 'E-mail não disponível') : '••••••••••••••••'}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-subtle">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                  Perfil da sua conta
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowEmail((visible) => !visible)}
                aria-pressed={!showEmail}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-line bg-elevated px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-hover sm:self-center"
              >
                {showEmail ? <EyeOff size={16} /> : <Eye size={16} />}
                {showEmail ? 'Ocultar e-mail' : 'Mostrar e-mail'}
              </button>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => { setDraftName(fullName); setDraftEmail(user?.email ?? ''); setIsEditing(true); }}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
                >
                  <UserRound size={16} /> Editar perfil
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-ink">Informações pessoais</p>
                  <h3 className="mt-1 text-lg font-bold text-foreground">Dados da conta</h3>
                  <p className="mt-1 text-sm leading-5 text-muted">Informações associadas ao seu perfil CifraWealth.</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                  <UserRound size={18} />
                </span>
              </div>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="mt-5 flex flex-col gap-4">
                  <label className="block text-sm font-medium text-foreground">
                    Nome completo
                    <input
                      autoComplete="name"
                      required
                      maxLength={120}
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    E-mail
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={draftEmail}
                      onChange={(event) => setDraftEmail(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground"
                    />
                  </label>
                  <p className="text-xs leading-5 text-muted">As alterações são mantidas na sessão local; a sincronização com o servidor depende de uma API de atualização de perfil.</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="min-h-10 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-foreground hover:bg-elevated">Cancelar</button>
                    <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover"><Check size={16} /> Salvar alterações</button>
                  </div>
                </form>
              ) : (
              <dl className="divide-y divide-line">
                <div className="flex items-center gap-3 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                    <UserRound size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs text-muted">Nome completo</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-foreground">{fullName}</dd>
                  </div>
                  <span className="rounded-full border border-line px-2 py-1 text-[10px] font-medium text-muted">Principal</span>
                </div>
                <div className="flex items-center gap-3 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                    <Mail size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs text-muted">E-mail de acesso</dt>
                    <dd className="mt-1 break-all text-sm font-semibold text-foreground">
                      {showEmail ? (user?.email ?? 'E-mail não disponível') : '••••••••••••••••'}
                    </dd>
                  </div>
                  <span className="rounded-full border border-line px-2 py-1 text-[10px] font-medium text-muted">Login</span>
                </div>
              </dl>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-ink">Sua experiência</p>
                  <h3 className="mt-1 text-lg font-bold text-foreground">Aparência da plataforma</h3>
                  <p className="mt-1 text-sm leading-5 text-muted">Escolha o tema que funciona melhor para você.</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                  <Sun size={18} />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {themeOptions.map(({ value, title, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPreference(value)}
                    aria-pressed={preference === value}
                    className={`flex min-h-[104px] items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      preference === value
                        ? 'border-accent bg-accent/10'
                        : 'border-line bg-elevated hover:bg-hover'
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-ink">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{title}</span>
                      <span className="mt-1 block text-xs leading-4 text-muted">{description}</span>
                    </span>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      preference === value ? 'border-accent' : 'border-line-strong'
                    }`}>
                      {preference === value && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                <span>Preferência atual: <strong className="font-semibold text-foreground">{themeOptions.find((option) => option.value === preference)?.title}</strong></span>
                <span>Salva neste navegador</span>
              </div>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-6">
            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-ink">Central de controle</p>
                <h3 className="mt-1 text-lg font-bold text-foreground">Conta e suporte</h3>
                <p className="mt-1 text-sm leading-5 text-muted">Informações importantes sempre à mão.</p>
              </div>
              <button
                type="button"
                onClick={() => setDialog('privacy')}
                className="mt-5 flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors hover:border-line hover:bg-elevated"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info"><ShieldCheck size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">Privacidade e dados</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">Saiba como suas informações são tratadas</span>
                </span>
                <ChevronRight size={17} className="shrink-0 text-subtle" />
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-line hover:bg-elevated"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-positive/10 text-positive"><CircleHelp size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">Educação financeira</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">Consulte conteúdos públicos da Rico</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-subtle" />
              </a>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-elevated p-4">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-accent-ink" />
                <p className="text-xs leading-5 text-muted">
                  <strong className="text-foreground">Seus dados merecem cuidado.</strong><br />
                  Use dispositivos confiáveis e não compartilhe suas credenciais.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                <Fingerprint size={20} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">Seu espaço, suas escolhas.</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Personalizar sua conta é um passo simples para ter uma experiência financeira que combina com você.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[10px] font-bold tracking-[0.12em] text-subtle">
                <span>PRIVACIDADE EM PRIMEIRO LUGAR</span>
                <ShieldCheck size={15} />
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                  <ArrowRight size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">Encerrar sessão</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">Saia da sua conta neste dispositivo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDialog('logout')}
                  aria-label="Encerrar sessão"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated text-foreground transition-colors hover:bg-hover"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-danger/30 bg-danger/5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <Trash2 size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">Excluir conta</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    A exclusão é uma ação permanente. Você precisará confirmar antes de continuar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDialog('delete-account')}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
              >
                <Trash2 size={16} />
                Excluir minha conta
              </button>
            </section>
          </aside>
        </div>

        <footer className="mt-8 flex flex-col gap-2 border-t border-line py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CifraWealth</span>
          <span>Organização financeira com clareza e autonomia.</span>
          <button type="button" onClick={() => setDialog('privacy')} className="inline-flex w-fit items-center gap-1 font-medium text-accent-ink hover:underline">
            Privacidade <ArrowRight size={12} />
          </button>
        </footer>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <label htmlFor="theme-preference" className="text-sm font-semibold text-foreground">Aparência</label>
        <p id="theme-preference-hint" className="mt-1 text-sm text-muted">Acompanhe o tema do dispositivo ou escolha uma aparência para este navegador.</p>
        <select id="theme-preference" aria-describedby="theme-preference-hint" value={preference} onChange={(event) => setPreference(event.target.value as ThemePreference)} className="mt-4 h-11 w-full max-w-sm rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground">
          <option value="system">Usar tema do dispositivo</option>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
            aria-describedby="profile-dialog-description"
            className="relative my-auto w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setDialog(null)}
              aria-label="Fechar diálogo"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-foreground"
            >
              <X size={18} />
            </button>

            {dialog === 'privacy' ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-ink"><ShieldCheck size={23} /></span>
                <h2 id="profile-dialog-title" className="mt-4 text-xl font-bold text-foreground">Privacidade e dados</h2>
                <p id="profile-dialog-description" className="mt-2 text-sm leading-6 text-muted">
                  As informações de perfil exibidas aqui vêm da sessão atual da CifraWealth. Consulte a política de privacidade do serviço para entender como os dados são tratados.
                </p>
                <button type="button" onClick={() => setDialog(null)} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover">
                  Entendi
                </button>
              </>
            ) : dialog === 'logout' ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-ink"><ArrowRight size={22} /></span>
                <h2 id="profile-dialog-title" className="mt-4 text-xl font-bold text-foreground">Encerrar sessão?</h2>
                <p id="profile-dialog-description" className="mt-2 text-sm leading-6 text-muted">
                  Você sairá da sua conta neste dispositivo e precisará entrar novamente para acessar a plataforma.
                </p>
                <button type="button" onClick={handleLogout} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover">
                  Confirmar e sair
                </button>
                <button type="button" onClick={() => setDialog(null)} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-elevated">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger"><Trash2 size={22} /></span>
                <h2 id="profile-dialog-title" className="mt-4 text-xl font-bold text-foreground">Confirmar exclusão da conta?</h2>
                <p id="profile-dialog-description" className="mt-2 text-sm leading-6 text-muted">
                  Esta ação é permanente. Confirme somente se realmente deseja excluir sua conta. No momento, a API deste projeto não disponibiliza uma operação de exclusão; confirmar exibirá essa limitação e não apagará seus dados.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccountConfirmation}
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-danger/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                >
                  <Trash2 size={16} />
                  Confirmar solicitação
                </button>
                <button type="button" onClick={() => setDialog(null)} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-elevated">
                  Cancelar
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {notice && (
        <div role="status" className="fixed bottom-5 left-4 right-4 z-[110] mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm text-foreground shadow-xl sm:left-auto sm:right-6">
          <span className="mt-0.5 text-accent-ink"><Check size={17} /></span>
          <p className="flex-1 leading-5">{notice}</p>
          <button type="button" onClick={() => setNotice('')} aria-label="Dispensar aviso" className="text-muted hover:text-foreground"><X size={16} /></button>
        </div>
      )}
    </DashboardLayout>
  );
}
