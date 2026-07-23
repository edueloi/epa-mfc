import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { WorkshopsView } from './components/WorkshopsView';
import { AttendanceManager } from './components/AttendanceManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { OficineiroView } from './components/OficineiroView';
import { SurveyFormPage } from './components/SurveyFormPage';
import { ThankYouScreen } from './components/ThankYouScreen';
import { QrCodeModal } from './components/QrCodeModal';
import { InstallAppBanner } from './components/InstallAppBanner';
import { Heart } from 'lucide-react';
import { authFetch, getAuthToken, setAuthSession, clearAuthToken } from './lib/authFetch';

function AdminShell({
  isOficineiro,
  onLogout,
  children
}: {
  isOficineiro: boolean;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab =
    location.pathname === '/inscritos' ? 'participants' :
    location.pathname === '/graficos' ? 'analytics' :
    'workshops';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'participants') navigate('/inscritos');
          else if (tab === 'analytics') navigate('/graficos');
          else navigate('/oficinas');
        }}
        isLoggedIn={true}
        isOficineiro={isOficineiro}
        onLogout={onLogout}
        onOpenQrCode={() => setShowQrCodeModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
        {children}
      </main>

      <QrCodeModal isOpen={showQrCodeModal} onClose={() => setShowQrCodeModal(false)} />
      <InstallAppBanner />

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-400 fill-blue-400" />
            <span className="font-bold text-slate-200">5º EPA Pirassununga</span>
            <span className="text-slate-500">•</span>
            <span>Movimento Familiar Cristão</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Sistema de Gestão de Oficinas, Chamada e Pesquisa de Satisfação
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }

    authFetch('/api/session')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setRole(data.role);
        } else {
          clearAuthToken();
        }
      })
      .catch(() => clearAuthToken())
      .finally(() => setCheckingSession(false));
  }, []);

  const handleLoginSuccess = (token: string, _username: string, userRole: string, workshopIds: number[]) => {
    setAuthSession({ token, role: userRole, workshopIds });
    setIsLoggedIn(true);
    setRole(userRole);
    navigate('/oficinas', { replace: true });
  };

  const handleLogout = () => {
    authFetch('/api/logout', { method: 'POST' }).catch(() => {});
    clearAuthToken();
    setIsLoggedIn(false);
    setRole(null);
    navigate('/login', { replace: true });
  };

  const isOficineiro = role === 'oficineiro';

  if (checkingSession) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/oficinas" replace />
          ) : (
            <>
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
              <InstallAppBanner />
            </>
          )
        }
      />

      <Route
        path="/pesquisa-epa"
        element={<SurveyFormPage onSuccess={() => navigate('/obrigado')} />}
      />

      <Route
        path="/obrigado"
        element={
          <ThankYouScreen
            onGoHome={() => navigate(isLoggedIn ? '/oficinas' : '/login')}
          />
        }
      />

      <Route
        path="/oficinas"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : (
            <AdminShell isOficineiro={isOficineiro} onLogout={handleLogout}>
              {isOficineiro ? <OficineiroView /> : <WorkshopsView />}
            </AdminShell>
          )
        }
      />

      <Route
        path="/inscritos"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isOficineiro ? (
            <Navigate to="/oficinas" replace />
          ) : (
            <AdminShell isOficineiro={isOficineiro} onLogout={handleLogout}>
              <AttendanceManager />
            </AdminShell>
          )
        }
      />

      <Route
        path="/graficos"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isOficineiro ? (
            <Navigate to="/oficinas" replace />
          ) : (
            <AdminShell isOficineiro={isOficineiro} onLogout={handleLogout}>
              <AnalyticsDashboard />
            </AdminShell>
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/oficinas' : '/login'} replace />}
      />
    </Routes>
  );
}
