import { ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Logo } from '../components/Logo/Logo';
import { BenefitItem } from '../components/BenefitItem/BenefitItem';
import { IllustrationSection } from '../components/IllustrationSection/IllustrationSection';
import { LoginForm } from '../components/LoginForm/LoginForm';

export function LoginPage() {
  return (
    <Layout
      left={
        <div className="flex flex-col gap-8">
          <Logo />

          <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Bem-vindo de <span className="text-emerald-400">volta</span>.
            </h1>
            <p className="max-w-sm text-base text-slate-400">
              Continue organizando suas finanças e acompanhando seu progresso.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <BenefitItem
              icon={<ShieldCheck size={20} className="text-emerald-400" />}
              title="Segurança"
              description="Seus dados protegidos com criptografia de ponta a ponta."
            />
            <BenefitItem
              icon={<TrendingUp size={20} className="text-emerald-400" />}
              title="Crescimento"
              description="Visualize sua evolução financeira com clareza."
            />
            <BenefitItem
              icon={<Target size={20} className="text-emerald-400" />}
              title="Objetivos"
              description="Defina metas e acompanhe seu progresso em tempo real."
            />
          </div>

          <IllustrationSection />
        </div>
      }
      right={<LoginForm />}
    />
  );
}
