import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { GoalsPage } from './pages/GoalsPage';
import { session } from './lib/session';
import { DemoBanner } from './components/DemoBanner/DemoBanner';

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
        {/* Raiz: Se o usuário estiver autenticado, vai para a /dashboard. Se for primeiro acesso, vê a Home */}
        <Route
          path="/"
          element={session.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Home />}
        />
        <Route
          path="/home"
          element={session.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Home />}
        />

        {/* Rotas de Autenticação */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
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

        {/* Rotas Protegidas do Sistema */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={session.isAuthenticated() ? '/dashboard' : '/'} replace />} />
      </Routes>
    </>
  );
}

export default App;