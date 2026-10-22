import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForgotPasswordForm } from '../../hooks/useForgotPasswordForm';
import { Input } from '../Input/Input';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';

export function ForgotPasswordForm() {
  const {
    data,
    errors,
    touched,
    isValid,
    submitting,
    submitError,
    isSubmitted,
    setField,
    setFieldTouched,
    handleSubmit,
    reset,
  } = useForgotPasswordForm();

  // Tela de Sucesso após envio das instruções
  if (isSubmitted) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-positive/10 text-positive mb-5">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Verifique seu e-mail</h1>
          <p className="mt-2 text-sm text-secondary leading-relaxed">
            Se houver uma conta com senha cadastrada para{' '}
            <strong className="text-foreground font-semibold">{data.email}</strong>, você receberá as instruções de recuperação.
          </p>

          <div className="mt-4 w-full rounded-xl border border-line bg-elevated/70 p-4 text-xs text-muted text-left">
            <p className="font-semibold text-foreground mb-1">Dicas importantes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>O link de redefinição é válido por <strong>1 hora</strong>.</li>
              <li>Não esqueça de verificar a caixa de spam ou lixo eletrônico.</li>
            </ul>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={reset}
              className="w-full text-center text-sm font-semibold text-muted hover:text-foreground py-2 transition-colors"
            >
              Não recebeu? Tentar com outro e-mail
            </button>

            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-foreground hover:bg-elevated transition-colors"
            >
              <ArrowLeft size={16} /> Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tela padrão com o formulário de e-mail
  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
      <h1 className="text-[28px] font-bold text-foreground">Recuperar senha</h1>
      <p className="mt-1.5 text-sm text-muted">
        Informe seu e-mail cadastrado para receber as instruções e o link de redefinição.
      </p>

      {submitError && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit()} noValidate>
        <Input
          label="E-mail"
          type="email"
          icon={<Mail size={18} />}
          placeholder="seu@email.com"
          autoComplete="email"
          value={data.email}
          onChange={(event) => setField(event.target.value)}
          onBlur={setFieldTouched}
          error={touched.email ? errors.email : undefined}
        />

        <PrimaryButton disabled={!isValid || submitting}>
          {submitting ? 'Enviando e-mail...' : 'Enviar e-mail'}
        </PrimaryButton>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o login
        </Link>
      </div>
    </div>
  );
}
