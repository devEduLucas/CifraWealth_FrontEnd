import { AccountAccessLayout } from '../components/Layout/AccountAccessLayout';
import { ResetPasswordForm } from '../components/ResetPasswordForm/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <AccountAccessLayout
      title="Um novo acesso, a mesma conta."
      description="Escolha uma nova senha. Depois de salvar, você poderá entrar e continuar de onde parou."
    >
      <ResetPasswordForm />
    </AccountAccessLayout>
  );
}
