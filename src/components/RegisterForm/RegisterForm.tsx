import { Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import type { RegisterFormData } from '../../types/form.types';
import { GoogleIcon } from '../icons/GoogleIcon';
import { Input } from '../Input/Input';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import { Checkbox } from '../Checkbox/Checkbox';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';
import { SocialButton } from '../SocialButton/SocialButton';

// Estrutura preparada para futura integração com o backend (Node.js + TypeScript).
// Nenhuma chamada de API, autenticação ou regra de negócio é feita aqui.
function handleValidSubmit(data: RegisterFormData): void {
  console.log('Formulário válido, pronto para integração com a API:', data);
}

function handleGoogleSignUp(): void {
  console.log('Cadastro com Google: integração a ser conectada futuramente.');
}

export function RegisterForm() {
  const { data, errors, touched, setField, setFieldTouched, handleSubmit, isValid } =
    useRegisterForm();
  const strength = usePasswordStrength(data.password);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#202634] bg-[#121827] p-8">
      <h1 className="text-[28px] font-bold text-white">Criar conta</h1>
      <p className="mt-1.5 text-sm text-slate-400">
        <span className="text-slate-300">Comece gratuitamente.</span> Sem cartão de crédito.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(handleValidSubmit)} noValidate>
        <Input
          label="Nome completo"
          icon={<User size={18} />}
          placeholder="Seu nome completo"
          autoComplete="name"
          value={data.fullName}
          onChange={(event) => setField('fullName', event.target.value)}
          onBlur={() => setFieldTouched('fullName')}
          error={touched.fullName ? errors.fullName : undefined}
        />

        <Input
          label="E-mail"
          type="email"
          icon={<Mail size={18} />}
          placeholder="seu@email.com"
          autoComplete="email"
          value={data.email}
          onChange={(event) => setField('email', event.target.value)}
          onBlur={() => setFieldTouched('email')}
          error={touched.email ? errors.email : undefined}
        />

        <div>
          <PasswordInput
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={data.password}
            onChange={(event) => setField('password', event.target.value)}
            onBlur={() => setFieldTouched('password')}
            error={touched.password ? errors.password : undefined}
          />
          <PasswordStrengthIndicator strength={strength} visible={data.password.length > 0} />
        </div>

        <PasswordInput
          label="Confirmar senha"
          placeholder="Repita sua senha"
          autoComplete="new-password"
          value={data.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          onBlur={() => setFieldTouched('confirmPassword')}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        />

        <Checkbox
          id="accept-terms"
          checked={data.acceptTerms}
          onChange={(event) => setField('acceptTerms', event.target.checked)}
          onBlur={() => setFieldTouched('acceptTerms')}
          error={touched.acceptTerms ? errors.acceptTerms : undefined}
          label={
            <>
              Aceito os{' '}
              <a href="/termos-de-uso" className="text-emerald-400 hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/politica-de-privacidade" className="text-emerald-400 hover:underline">
                Política de Privacidade
              </a>
            </>
          }
        />

        <PrimaryButton disabled={!isValid}>Criar conta</PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[#202634]" />
        <span className="text-xs text-slate-500">ou</span>
        <span className="h-px flex-1 bg-[#202634]" />
      </div>

      <SocialButton icon={<GoogleIcon />} onClick={handleGoogleSignUp}>
        Cadastrar com Google
      </SocialButton>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já possui conta?{' '}
        <Link to="/login" className="font-medium text-emerald-400 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
