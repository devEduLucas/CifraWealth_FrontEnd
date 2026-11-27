import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { session } from './lib/session';
import { DemoBanner } from './components/DemoBanner/DemoBanner';
import { AccessibilityButton, AccessibilityProvider } from './components/AccessibilityTools/AccessibilityTools';
import { useSessionUser } from './hooks/useSessionUser';
import { OnboardingProvider } from './components/Onboarding/OnboardingProvider';
import { RouteErrorBoundary } from './components/RouteErrorBoundary/RouteErrorBoundary';

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const InformationPage = lazy(() => import('./pages/InformationPage').then((m) => ({ default: m.InformationPage })));

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
    const titles: Record<string, string> = { '/': 'Início', '/home': 'Início', '/login': 'Entrar', '/register': 'Criar conta', '/forgot-password': 'Recuperar senha', '/reset-password': 'Redefinir senha', '/verify-email': 'Confirmar e-mail', '/dashboard': 'Visão geral', '/transactions': 'Transações', '/categories': 'Categorias', '/goals': 'Metas', '/reports': 'Relatórios', '/profile': 'Perfil', '/help': 'Ajuda', '/termos-de-uso': 'Termos de uso', '/politica-de-privacidade': 'Privacidade' };
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
  const hasAppHeader = pathname.startsWith('/goals/') || ['/dashboard', '/transactions', '/categories', '/goals', '/reports', '/profile', '/help'].includes(pathname.replace(/\/+$/, ''));
  return (
    <>
      <a href="#conteudo-principal" className="skip-link">Pular para o conteúdo principal</a>
      {!hasAppHeader && <AccessibilityButton floating />}
      <RouteChangeAnnouncer />
      <DemoBanner />
      <RouteErrorBoundary key={pathname}>
      <Suspense fallback={<main id="conteudo-principal" tabIndex={-1} className="min-h-screen bg-canvas p-6 pt-24 text-foreground"><p role="status">Carregando página...</p></main>}>
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
        <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
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
      </Suspense>
      </RouteErrorBoundary>
    </>
  );
}

export function App() {
  return <AccessibilityProvider><OnboardingProvider><AppRoutes /></OnboardingProvider></AccessibilityProvider>;
}

export default App;
