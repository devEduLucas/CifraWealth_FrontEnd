import { ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Logo } from '../components/Logo/Logo';
import { BenefitItem } from '../components/BenefitItem/BenefitItem';
import { IllustrationSection } from '../components/IllustrationSection/IllustrationSection';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm/ForgotPassword';

export function ForgotPasswordPage() {
  return (
    <Layout
      left={
        <div className="flex flex-col gap-8">
          <Logo showTagline />

          <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Recupere seu <span className="text-accent">acesso</span>.
            </h1>
            <p className="max-w-sm text-base text-muted">
              Não se preocupe, vamos ajudar você a redefinir sua senha de forma simples e segura.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <BenefitItem
              icon={<ShieldCheck size={20} className="text-accent" />}
              title="Segurança Máxima"
              description="Links criptografados com tempo limite para sua total proteção."
            />
            <BenefitItem
              icon={<TrendingUp size={20} className="text-accent" />}
              title="Sem Complicação"
              description="Redefina sua credencial em poucos cliques sem burocracia."
            />
            <BenefitItem
              icon={<Target size={20} className="text-accent" />}
              title="Seus Dados Salvos"
              description="Todo o seu histórico financeiro e metas continuam protegidos."
            />
          </div>

          <IllustrationSection />
        </div>
      }
      right={<ForgotPasswordForm />}
    />
  );
}
