import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Check,
  CircleHelp,
  Eye,
  EyeOff,
  LogOut,
  LockKeyhole,
  Paintbrush,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { Modal } from '../components/Modal/Modal';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { UserAvatar } from '../components/UserAvatar/UserAvatar';
import { GoogleAccountConfirmation } from '../components/GoogleAccountConfirmation/GoogleAccountConfirmation';
import { ProfileCoverPresets } from '../components/ProfileCoverPresets/ProfileCoverPresets';
import { api, type DeleteAccountInput } from '../lib/api';
import { session } from '../lib/session';
import { isDemoMode } from '../lib/config';
import { useSessionUser } from '../hooks/useSessionUser';
import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../lib/theme';
import { prepareProfileImage } from '../utils/profileImage';

const THEMES: {
  value: ThemePreference;
  title: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    value: 'system',
    title: 'Automático',
    description: 'Segue seu dispositivo',
    icon: Monitor,
  },
  {
    value: 'light',
    title: 'Claro',
    description: 'Visual iluminado',
    icon: Sun,
  },
  {
    value: 'dark',
    title: 'Escuro',
    description: 'Mais conforto visual',
    icon: Moon,
  },
];
type ImageKind = 'avatar' | 'cover';
type Images = Record<ImageKind, string | null>;

function ProfileImagePicker({
  kind,
  image,
  name,
  changed,
  disabled,
  error,
  onFile,
  onRemove,
  onPreset,
}: {
  kind: ImageKind;
  image: string | null;
  name: string;
  changed: boolean;
  disabled: boolean;
  error: string;
  onFile: (file?: File) => void;
  onRemove: () => void;
  onPreset: (image: string) => void;
}) {
  const label = kind === 'avatar' ? 'Foto do avatar' : 'Capa do perfil';
  const inputId = `profile-${kind}`;
  return (
    <fieldset className="min-w-0 rounded-xl border border-line p-3">
      <legend className="px-1 text-sm font-semibold text-foreground">
        {label}
      </legend>
      {kind === 'avatar' ? (
        <UserAvatar
          name={name}
          photo={image}
          className="mb-3 h-16 w-16 text-lg"
        />
      ) : (
        <div className="mb-3 h-20 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600/20 via-accent/10 to-teal-500/20">
          {image && (
            <img
              src={image}
              alt="Prévia da capa"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}
      {kind === 'cover' && (
        <ProfileCoverPresets
          image={image}
          disabled={disabled}
          onSelect={onPreset}
        />
      )}
      <label htmlFor={inputId} className="text-xs font-medium text-muted">
        Escolher {kind === 'avatar' ? 'foto' : 'capa'}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ''}`}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = '';
        }}
        className="mt-2 block w-full min-w-0 text-xs text-muted file:mr-2 file:min-h-10 file:rounded-lg file:border file:border-line file:bg-elevated file:px-2 file:text-xs file:text-foreground"
      />
      <p id={`${inputId}-help`} className="mt-2 text-xs leading-5 text-muted">
        JPG, PNG ou WebP, até 5 MB. A imagem será ajustada antes de salvar.
      </p>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-2 text-xs text-danger"
        >
          {error}
        </p>
      )}
      {changed && (
        <p role="status" className="mt-2 text-xs text-muted">
          {image ? 'Nova imagem selecionada.' : 'A imagem será removida.'} Salve
          para aplicar.
        </p>
      )}
      {image && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2"
          disabled={disabled}
          onClick={onRemove}
        >
          Remover {kind === 'avatar' ? 'foto' : 'capa'}
        </Button>
      )}
    </fieldset>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useSessionUser();
  const { preference, setPreference } = useTheme();
  const fullName =
    [user?.nome, user?.sobrenome].filter(Boolean).join(' ') || 'Usuário';
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [showEmail, setShowEmail] = useState(true);
  const [dialog, setDialog] = useState<'edit' | 'logout' | 'delete' | null>(
    null,
  );
  const [draftName, setDraftName] = useState('');
  const [images, setImages] = useState<Images>({ avatar: null, cover: null });
  const [imageChanges, setImageChanges] = useState({
    avatar: false,
    cover: false,
  });
  const [imageErrors, setImageErrors] = useState({ avatar: '', cover: '' });
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const [password, setPassword] = useState('');
  const [proof, setProof] = useState<DeleteAccountInput | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const operation = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (deleteError && !deleting) passwordRef.current?.focus();
  }, [deleteError, deleting]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    api
      .getProfile(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) session.updateUser(profile);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setLoadError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar seu perfil.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  function closeDialog() {
    if (operation.current || processing) return;
    setDialog(null);
    setPassword('');
    setProof(null);
    setDeleteError('');
  }

  function startEditing() {
    setDraftName(fullName);
    setImages({
      avatar: user?.foto_perfil ?? null,
      cover: user?.capa_perfil ?? null,
    });
    setImageChanges({ avatar: false, cover: false });
    setImageErrors({ avatar: '', cover: '' });
    setNameError('');
    setSaveError('');
    setDialog('edit');
  }

  async function chooseImage(kind: ImageKind, file?: File) {
    if (!file) return;
    setProcessing(true);
    setImageErrors((current) => ({ ...current, [kind]: '' }));
    try {
      const prepared = await prepareProfileImage(file, kind);
      setImages((current) => ({ ...current, [kind]: prepared }));
      setImageChanges((current) => ({ ...current, [kind]: true }));
    } catch (cause: unknown) {
      setImageErrors((current) => ({
        ...current,
        [kind]:
          cause instanceof Error
            ? cause.message
            : 'Não foi possível preparar a imagem.',
      }));
    } finally {
      setProcessing(false);
    }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (operation.current || processing) return;
    const cleanName = draftName.trim().replace(/\s+/g, ' ');
    const [first = '', ...rest] = cleanName.split(' ');
    if (
      cleanName.length < 3 ||
      first.length > 50 ||
      rest.join(' ').length > 50
    ) {
      setNameError(
        'Informe um nome com ao menos 3 caracteres e até 50 caracteres em cada parte.',
      );
      return;
    }
    operation.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await api.updateProfile({
        fullName: cleanName,
        ...(imageChanges.avatar ? { avatar: images.avatar } : {}),
        ...(imageChanges.cover ? { cover: images.cover } : {}),
      });
      session.updateUser(updated);
      setDialog(null);
      setNotice(
        isDemoMode
          ? 'Perfil atualizado nesta demonstração.'
          : 'Perfil atualizado com sucesso.',
      );
    } catch (cause: unknown) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar seu perfil. Tente novamente.',
      );
    } finally {
      operation.current = false;
      setSaving(false);
    }
  }

  async function deleteAccount(event?: FormEvent) {
    event?.preventDefault();
    if (operation.current || (!user?.tem_senha && !proof)) return;
    operation.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      const result = await api.deleteAccount(
        user?.tem_senha ? { password } : proof!,
      );
      session.clear(result.message);
      navigate('/login', {
        replace: true,
        state: { accountNotice: result.message },
      });
    } catch (cause: unknown) {
      setDeleteError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível excluir sua conta. Tente novamente.',
      );
      passwordRef.current?.focus();
    } finally {
      operation.current = false;
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout userName={fullName}>
      <div className="mx-auto w-full max-w-6xl">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Perfil
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sua vida financeira, do seu jeito. Acompanhe seu momento e
            personalize seu espaço.
          </p>
        </header>
        {loading && (
          <p role="status" className="mt-4 text-sm text-muted">
            Carregando perfil...
          </p>
        )}
        {loadError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-2 min-h-11 font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="mt-4 flex items-center gap-3 rounded-xl border border-positive/30 bg-positive/10 p-3 text-sm text-foreground"
          >
            <Check
              size={18}
              aria-hidden="true"
              className="shrink-0 text-positive"
            />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              aria-label="Dispensar aviso"
              onClick={() => setNotice('')}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-hover"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        <section
          aria-label="Seu perfil"
          className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
        >
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 sm:h-32">
            {user?.capa_perfil && (
              <img
                src={user.capa_perfil}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
            <Button
              size="sm"
              variant="secondary"
              icon={Paintbrush}
              disabled={loading || Boolean(loadError)}
              onClick={startEditing}
              className="absolute right-3 top-3 bg-surface text-foreground shadow-sm sm:right-5 sm:top-4"
            >
              Personalizar capa
            </Button>
          </div>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar
                name={fullName}
                photo={user?.foto_perfil}
                className="relative z-10 -mt-12 h-20 w-20 self-start border-4 border-surface text-2xl"
              />
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-ink">
                  Meu espaço financeiro
                </p>
                <h2 className="break-words text-lg font-bold text-foreground sm:text-xl">
                  {fullName}
                </h2>
                <div className="mt-1 flex min-w-0 items-center gap-1 text-sm text-muted">
                  <p className="min-w-0 break-all">
                    <span aria-hidden={!showEmail}>
                      {showEmail ? user?.email : '••••••••••••••••'}
                    </span>
                    {!showEmail && (
                      <span className="sr-only">E-mail oculto</span>
                    )}
                  </p>
                  <button
                    type="button"
                    aria-label={showEmail ? 'Ocultar e-mail' : 'Mostrar e-mail'}
                    title={showEmail ? 'Ocultar e-mail' : 'Mostrar e-mail'}
                    aria-pressed={!showEmail}
                    onClick={() => setShowEmail((value) => !value)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-foreground"
                  >
                    {showEmail ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                icon={UserRound}
                disabled={loading || Boolean(loadError)}
                onClick={startEditing}
              >
                Editar perfil
              </Button>
            </div>
          </div>
        </section>


        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section
            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="profile-data-title"
          >
            <h2
              id="profile-data-title"
              className="text-lg font-bold text-foreground"
            >
              Acesso e privacidade
            </h2>
            <dl className="mt-4 divide-y divide-line">
              <div className="py-4">
                <dt className="flex items-center gap-2 text-xs text-muted">
                  <LockKeyhole size={16} aria-hidden="true" />
                  Forma de acesso
                </dt>
                <dd className="mt-2 break-words text-sm font-semibold text-foreground">
                  {user?.tem_senha
                    ? user.acesso_google
                      ? 'E-mail e senha ou conta Google'
                      : 'E-mail e senha'
                    : user?.acesso_google
                      ? 'Conta Google'
                      : 'Carregando informações de acesso...'}
                </dd>
              </div>
              <div className="py-4">
                <dt className="flex items-center gap-2 text-xs text-muted">
                  <ShieldCheck size={16} aria-hidden="true" />
                  Informações da conta
                </dt>
                <dd className="mt-2 break-all text-sm font-semibold text-foreground">
                  Nome, avatar e capa personalizáveis
                </dd>
              </div>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Seu e-mail permanece o mesmo para entrar e recuperar o acesso. Use
              o olho ao lado dele para ocultá-lo nesta tela.
            </p>
          </section>
          <section
            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="profile-theme-title"
          >
            <h2
              id="profile-theme-title"
              className="text-lg font-bold text-foreground"
            >
              Aparência
            </h2>
            <p className="mt-2 text-sm leading-5 text-muted">
              Escolha como quer acompanhar suas finanças.
            </p>
            <div
              role="group"
              aria-label="Aparência"
              className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-3"
            >
              {THEMES.map(({ value, title, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={preference === value}
                  onClick={() => setPreference(value)}
                  className={`relative flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors min-[440px]:flex-col min-[440px]:items-start min-[440px]:gap-2 ${preference === value ? 'border-accent bg-accent/10 ring-1 ring-accent/40' : 'border-line bg-elevated hover:bg-hover'}`}
                >
                  <span
                    aria-hidden="true"
                    className="relative flex h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-line p-1.5 min-[440px]:h-16 min-[440px]:w-full"
                    style={{
                      background:
                        value === 'dark'
                          ? '#111d30'
                          : value === 'light'
                            ? '#f5f8fc'
                            : 'linear-gradient(110deg, #f5f8fc 50%, #111d30 50%)',
                    }}
                  >
                    <span className="w-1/5 rounded-sm bg-blue-500/25" />
                    <span className="ml-1.5 flex flex-1 flex-col gap-1">
                      <span className="h-1.5 w-2/3 rounded-full bg-blue-500/40" />
                      <span className="flex flex-1 gap-1">
                        <span className="flex-1 rounded bg-blue-500/15" />
                        <span className="flex-1 rounded bg-cyan-500/20" />
                      </span>
                    </span>
                    {preference === value && (
                      <span className="absolute right-1 top-1 rounded-full bg-accent p-0.5 text-on-accent">
                        <Check size={12} />
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon
                      size={16}
                      aria-hidden="true"
                      className="text-accent-ink"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {title}
                    </span>
                  </span>
                  <span className="hidden text-xs leading-5 text-muted min-[440px]:inline">
                    {description}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted">
              Salvo neste navegador. O modo automático acompanha seu
              dispositivo.
            </p>
          </section>
        </div>

        <section
          className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6"
          aria-labelledby="profile-help-title"
        >
          <h2
            id="profile-help-title"
            className="text-lg font-bold text-foreground"
          >
            Privacidade e ajuda
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink underline"
            >
              <ShieldCheck size={17} aria-hidden="true" />
              Política de privacidade{' '}
              <span className="sr-only">(abre em nova aba)</span>
            </Link>
            <Link
              to="/home#como-funciona"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink underline"
            >
              <CircleHelp size={17} aria-hidden="true" />
              Como usar a CifraWealth{' '}
              <span className="sr-only">(abre em nova aba)</span>
            </Link>
          </div>
        </section>

        <section
          className="mt-6 flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6"
          aria-labelledby="profile-account-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="profile-account-title"
                className="text-lg font-bold text-foreground"
              >
                Sua conta
              </h2>
              <p className="mt-1 text-sm text-muted">
                Saia da conta neste dispositivo quando terminar.
              </p>
            </div>
            <Button
              variant="outline"
              icon={LogOut}
              onClick={() => setDialog('logout')}
            >
              Encerrar sessão
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-danger">
                Excluir conta
              </h3>
              <p className="mt-1 max-w-lg text-xs leading-5 text-muted">
                Remove permanentemente sua conta e os dados financeiros
                associados.
              </p>
            </div>
            <Button
              variant="danger"
              icon={Trash2}
              disabled={loading || Boolean(loadError)}
              onClick={() => {
                setPassword('');
                setProof(null);
                setDeleteError('');
                setDialog('delete');
              }}
            >
              Excluir minha conta
            </Button>
          </div>
        </section>
      </div>

      <Modal
        open={dialog === 'edit'}
        title="Editar perfil"
        saving={saving || processing}
        onClose={closeDialog}
      >
        <form onSubmit={saveProfile} className="flex flex-col gap-5">
          <Input
            label="Nome completo"
            autoComplete="name"
            value={draftName}
            maxLength={101}
            required
            onChange={(event) => {
              setDraftName(event.target.value);
              setNameError('');
            }}
            error={nameError || undefined}
            disabled={saving}
          />
          {(['avatar', 'cover'] as const).map((kind) => (
            <ProfileImagePicker
              key={kind}
              kind={kind}
              name={draftName}
              image={images[kind]}
              changed={imageChanges[kind]}
              disabled={saving || processing}
              error={imageErrors[kind]}
              onFile={(file) => void chooseImage(kind, file)}
              onPreset={(image) => {
                setImages((current) => ({ ...current, cover: image }));
                setImageChanges((current) => ({ ...current, cover: true }));
                setImageErrors((current) => ({ ...current, cover: '' }));
              }}
              onRemove={() => {
                setImages((current) => ({ ...current, [kind]: null }));
                setImageChanges((current) => ({ ...current, [kind]: true }));
                setImageErrors((current) => ({ ...current, [kind]: '' }));
              }}
            />
          ))}
          {processing && (
            <p role="status" className="text-sm text-muted">
              Preparando imagem...
            </p>
          )}
          {saveError && (
            <p role="alert" className="text-sm text-danger">
              {saveError}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              disabled={saving || processing}
              onClick={closeDialog}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || processing}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={dialog === 'logout'}
        title="Encerrar sessão?"
        onClose={closeDialog}
      >
        <p className="text-sm leading-6 text-muted">
          Você precisará entrar novamente para acessar seus dados neste
          dispositivo.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={closeDialog}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              session.clear();
              navigate('/login', { replace: true });
            }}
          >
            Confirmar e sair
          </Button>
        </div>
      </Modal>
      <Modal
        open={dialog === 'delete'}
        title="Excluir sua conta?"
        saving={deleting}
        onClose={closeDialog}
      >
        <p className="text-sm leading-6 text-muted">
          Esta ação apaga sua conta, transações, categorias e metas. Ela não
          pode ser desfeita.
        </p>
        {user?.tem_senha ? (
          <form onSubmit={deleteAccount} className="mt-5 flex flex-col gap-4">
            <PasswordInput
              ref={passwordRef}
              label="Sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setDeleteError('');
              }}
              required
              disabled={deleting}
              error={deleteError || undefined}
              helperText={
                isDemoMode
                  ? 'Na demonstração, digite excluir. Apenas os dados fictícios deste navegador serão removidos.'
                  : 'Digite a senha usada para entrar na sua conta.'
              }
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                disabled={deleting}
                onClick={closeDialog}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                type="submit"
                disabled={deleting || !password}
              >
                {deleting ? 'Excluindo...' : 'Excluir conta permanentemente'}
              </Button>
            </div>
          </form>
        ) : user?.acesso_google ? (
          <div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Sua conta usa o Google. Confirme sua identidade com a mesma conta
              antes de excluir.
            </p>
            {proof ? (
              <div
                role="status"
                className="mt-4 flex flex-wrap items-center gap-2 text-sm text-positive"
              >
                <Check size={17} aria-hidden="true" />
                Identidade confirmada.
                <Button
                  variant="ghost"
                  disabled={deleting}
                  onClick={() => {
                    setProof(null);
                    setDeleteError('');
                  }}
                >
                  Confirmar novamente
                </Button>
              </div>
            ) : (
              <GoogleAccountConfirmation onVerified={setProof} />
            )}
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                disabled={deleting}
                onClick={closeDialog}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                disabled={deleting || !proof}
                onClick={() => void deleteAccount()}
              >
                {deleting ? 'Excluindo...' : 'Excluir conta permanentemente'}
              </Button>
            </div>
          </div>
        ) : (
          <p role="alert" className="mt-4 text-sm text-danger">
            Não foi possível identificar a forma de acesso desta conta. Feche
            esta janela e carregue o perfil novamente.
          </p>
        )}
      </Modal>
    </DashboardLayout>
  );
}
