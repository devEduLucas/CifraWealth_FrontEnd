import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import { AccessibilityButton, AccessibilityProvider } from './components/AccessibilityTools/AccessibilityTools';
import { useSessionUser } from './hooks/useSessionUser';

function ProtectedRoute({ children }: { children: ReactNode }) {
  return session.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace state={{ accountNotice: session.getEndNotice() }} />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  return session.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function RouteChangeAnnouncer() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Início', '/home': 'Início', '/login': 'Entrar', '/register': 'Criar conta', '/forgot-password': 'Recuperar senha', '/reset-password': 'Redefinir senha', '/verify-email': 'Confirmar e-mail', '/dashboard': 'Dashboard', '/transactions': 'Transações', '/categories': 'Categorias', '/goals': 'Metas', '/reports': 'Relatórios', '/profile': 'Perfil', '/termos-de-uso': 'Termos de uso', '/politica-de-privacidade': 'Privacidade' };
    const title = pathname.startsWith('/goals/') ? 'Detalhes da meta' : titles[pathname.replace(/\/+$/, '') || '/'] ?? 'CifraWealth';
    document.title = `${title} | CifraWealth`;
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setAnnouncement(`Página carregada: ${title}`);
  }, [pathname]);

  return <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>;
}

function AppRoutes() {
  const { pathname } = useLocation();
  useSessionUser();
  const hasAppHeader = pathname.startsWith('/goals/') || ['/dashboard', '/transactions', '/categories', '/goals', '/reports', '/profile'].includes(pathname.replace(/\/+$/, ''));
  return (
    <>
      <a href="#conteudo-principal" className="skip-link">Pular para o conteúdo principal</a>
      {!hasAppHeader && <AccessibilityButton floating />}
      <RouteChangeAnnouncer />
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
        <Route path="/goals/:goalId" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
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

export function App() {
  return <AccessibilityProvider><AppRoutes /></AccessibilityProvider>;
}

export default App;
