import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import favicon from '../images/favicon.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'epa_install_dismissed';

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === 'true');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0">
          <img src={favicon} alt="Logo EPA" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">Instalar o app do EPA</p>
          <p className="text-[11px] text-slate-400">Acesso rápido direto da tela inicial</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white flex-shrink-0"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
