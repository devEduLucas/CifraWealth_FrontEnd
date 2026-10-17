import { Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Logo } from '../components/Logo/Logo';
import { BenefitItem } from '../components/BenefitItem/BenefitItem';
import { IllustrationSection } from '../components/IllustrationSection/IllustrationSection';
import { ResetPasswordForm } from '../components/ResetPasswordForm/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <Layout
      left={
        <div className="flex flex-col gap-8">
          <Logo showTagline />

          <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Defina sua nova <span className="text-accent">senha</span>.
            </h1>
            <p className="max-w-sm text-base text-muted">
              Crie uma senha forte para proteger seu patrimônio e continuar sua jornada financeira.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <BenefitItem
              icon={<Lock size={20} className="text-accent" />}
              title="Proteção de Acesso"
              description="Senhas fortes garantem que apenas você tenha acesso às suas informações."
            />
            <BenefitItem
              icon={<ShieldCheck size={20} className="text-accent" />}
              title="Criptografia Segura"
              description="Sua nova senha é armazenada com algoritmos criptográficos robustos."
            />
            <BenefitItem
              icon={<Sparkles size={20} className="text-accent" />}
              title="Acesso Imediato"
              description="Após salvar, você já poderá entrar no seu painel financeiro."
            />
          </div>

          <IllustrationSection />
        </div>
      }
      right={<ResetPasswordForm />}
    />
  );
}
