import { AccountAccessLayout } from '../components/Layout/AccountAccessLayout';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm/ForgotPassword';

export function ForgotPasswordPage() {
  return (
    <AccountAccessLayout
      title="Volte aos seus registros."
      description="Vamos enviar um link para você escolher uma nova senha e retomar sua organização financeira."
    >
      <ForgotPasswordForm />
    </AccountAccessLayout>
  );
}
