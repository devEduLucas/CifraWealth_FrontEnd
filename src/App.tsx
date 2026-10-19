import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { GoalsPage } from './pages/GoalsPage';
import { session } from './lib/session';
import { DemoBanner } from './components/DemoBanner/DemoBanner';
import { InformationPage } from './pages/InformationPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  return session.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  return session.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export function App() {
  return (
    <>
      <DemoBanner />
      <Routes>
        {/* Raiz: Se autenticado vai para /dashboard, caso contrário exibe a Home */}
        <Route
          path="/"
          element={session.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Home />}
        />
        <Route
          path="/home"
          element={<Home />}
        />

        {/* Rotas de Autenticação e Recuperação de Senha */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/termos-de-uso" element={<InformationPage kind="terms" />} />
        <Route path="/politica-de-privacidade" element={<InformationPage kind="privacy" />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Rotas Protegidas da Plataforma */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />

        {/* Rota de Fallback */}
        <Route
          path="*"
          element={<Navigate to={session.isAuthenticated() ? '/dashboard' : '/'} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
