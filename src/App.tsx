import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { usePlan } from './hooks/usePlan';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import PlanGatekeeper from './components/PlanGatekeeper';
import LandingView from './views/LandingView';
import DashboardView from './views/DashboardView';
import RecordsView from './views/RecordsView';
import SettingsView from './views/SettingsView';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScanPage from './pages/ScanPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SecurityPage from './pages/SecurityPage';
import KazaLoader from './components/KazaLoader';

type AppView = 'dashboard' | 'records' | 'settings';

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = usePlan();

  const activeView: AppView =
    location.pathname.startsWith('/records') ? 'records' :
    location.pathname.startsWith('/settings') ? 'settings' :
    'dashboard';

  if (plan.isLockedOut) return <PlanGatekeeper plan={plan} />;

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <Topbar
        onLogoClick={() => navigate('/')}
        onSettings={() => navigate('/settings')}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={v => navigate(`/${v}`)} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="records" element={<RecordsView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <KazaLoader label="Loading..." />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <KazaLoader />;

  return (
    <Routes>
      <Route path="/" element={
        session ? <Navigate to="/dashboard" replace /> : <LandingView onEnterApp={() => navigate('/login')} />
      } />
      <Route path="/login" element={
        session ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        session ? <Navigate to="/dashboard" replace /> : <RegisterPage />
      } />
      <Route path="/scan/:token" element={<ScanPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
