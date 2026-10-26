import { ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Logo } from '../components/Logo/Logo';
import { BenefitItem } from '../components/BenefitItem/BenefitItem';
import { AuthFinancialIllustration } from '../components/IllustrationSection/AuthFinancialIllustration';
import { LoginForm } from '../components/LoginForm/LoginForm';

export function LoginPage() {
  return (
    <Layout
      left={
        <div className="flex flex-col items-center gap-6 lg:items-start">
          <Logo showTagline />

          <div className="hidden max-w-lg flex-col gap-4 lg:flex">
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground lg:text-5xl xl:text-[52px]">
              Bem-vindo de <span className="text-accent-ink">volta</span>.
            </h1>
            <p className="max-w-sm text-base text-muted">
              Continue organizando suas finanças e acompanhando seu progresso.
            </p>
          </div>

          <div className="hidden flex-col gap-5 lg:flex">
            <BenefitItem
              icon={<ShieldCheck size={20} className="text-accent-ink" />}
              title="Segurança"
              description="Acesso autenticado para acompanhar seus registros com privacidade."
            />
            <BenefitItem
              icon={<TrendingUp size={20} className="text-accent-ink" />}
              title="Crescimento"
              description="Visualize sua evolução financeira com clareza."
            />
            <BenefitItem
              icon={<Target size={20} className="text-accent-ink" />}
              title="Objetivos"
              description="Defina metas e acompanhe seu progresso em tempo real."
            />
          </div>

          <div className="auth-illustration" aria-hidden="true">
            <AuthFinancialIllustration variant="login" />
          </div>
        </div>
      }
      right={<LoginForm />}
    />
  );
}
