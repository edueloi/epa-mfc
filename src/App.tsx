import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { WorkshopsView } from './components/WorkshopsView';
import { AttendanceManager } from './components/AttendanceManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SurveyFormPage } from './components/SurveyFormPage';
import { ThankYouScreen } from './components/ThankYouScreen';
import { QrCodeModal } from './components/QrCodeModal';
import { Heart } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('epa_admin_logged') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'workshops' | 'participants' | 'analytics' | 'survey' | 'login' | 'thankyou'>('login');
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);

  // Auto-detect direct survey access e.g. via QR code ?tab=survey
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'survey') {
        setActiveTab('survey');
      } else if (isLoggedIn) {
        setActiveTab('workshops');
      } else {
        setActiveTab('login');
      }
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('epa_admin_logged', 'true');
    setActiveTab('workshops');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('epa_admin_logged');
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab === 'thankyou' ? 'survey' : (activeTab as any)}
        setActiveTab={(tab) => {
          if ((tab === 'workshops' || tab === 'participants' || tab === 'analytics') && !isLoggedIn) {
            setActiveTab('login');
          } else {
            setActiveTab(tab);
          }
        }}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onOpenQrCode={() => setShowQrCodeModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Landing & Login Screen */}
        {activeTab === 'login' && !isLoggedIn && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToPublicSurvey={() => setActiveTab('survey')}
            onOpenQrCode={() => setShowQrCodeModal(true)}
          />
        )}

        {/* Public Survey Form (Accessible by anyone / QR Code) */}
        {activeTab === 'survey' && (
          <SurveyFormPage
            onSuccess={() => setActiveTab('thankyou')}
          />
        )}

        {/* Thank You Page after Survey Submission */}
        {activeTab === 'thankyou' && (
          <ThankYouScreen
            onGoToAnalytics={() => {
              if (isLoggedIn) setActiveTab('analytics');
              else setActiveTab('login');
            }}
            onGoHome={() => {
              if (isLoggedIn) setActiveTab('workshops');
              else setActiveTab('login');
            }}
          />
        )}

        {/* Logged in views */}
        {isLoggedIn && activeTab === 'workshops' && (
          <WorkshopsView />
        )}

        {isLoggedIn && activeTab === 'participants' && (
          <AttendanceManager />
        )}

        {isLoggedIn && activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

      </main>

      {/* QR Code Sharing Modal */}
      <QrCodeModal
        isOpen={showQrCodeModal}
        onClose={() => setShowQrCodeModal(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
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
