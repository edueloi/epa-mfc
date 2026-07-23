import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, BarChart3, LogOut, QrCode } from 'lucide-react';
import favicon from '../images/favicon.png';

type Tab = 'workshops' | 'participants' | 'analytics';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isLoggedIn: boolean;
  isOficineiro?: boolean;
  onLogout: () => void;
  onOpenQrCode: () => void;
}

const NAV_ITEMS: { tab: Tab; label: string; shortLabel: string; icon: typeof BookOpen }[] = [
  { tab: 'workshops', label: 'Oficinas & Chamada', shortLabel: 'Oficinas', icon: BookOpen },
  { tab: 'participants', label: 'Inscritos', shortLabel: 'Inscritos', icon: Users },
  { tab: 'analytics', label: 'Pesquisa & Gráficos', shortLabel: 'Gráficos', icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isLoggedIn,
  onLogout,
  onOpenQrCode
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Top bar: brand + (desktop) full nav, or (mobile) brand + quick actions only */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

            {/* Brand */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0 min-w-0"
              onClick={() => navigate(isLoggedIn ? '/oficinas' : '/login')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
                <img src={favicon} alt="Logo 5º EPA" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm sm:text-lg text-white tracking-tight block truncate">5º EPA Pirassununga</span>
                <span className="text-[9px] sm:text-[10px] text-indigo-400 font-bold block truncate">Movimento Familiar Cristão</span>
              </div>
            </div>

            {/* Desktop Navigation Items */}
            {isLoggedIn ? (
              <nav className="hidden md:flex items-center gap-1 sm:gap-2">
                {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}

                <button
                  onClick={onOpenQrCode}
                  className="flex items-center gap-1.5 px-2.5 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                >
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span className="hidden lg:inline">QR Code / Link</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sair do sistema"
                  className="ml-1 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sair</span>
                </button>
              </nav>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate('/pesquisa-epa')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-blue-600 text-white font-extrabold rounded-xl text-[11px] sm:text-xs transition-all shadow-md hover:bg-blue-400"
                >
                  <span>Pesquisa Pública</span>
                </button>

                <button
                  onClick={onOpenQrCode}
                  className="p-2 bg-slate-800 text-indigo-300 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors flex-shrink-0"
                  title="QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile: QR + Logout quick actions (nav itself moves to bottom bar) */}
            {isLoggedIn && (
              <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={onOpenQrCode}
                  className="p-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl"
                  title="QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Bottom Tab Bar: mobile/tablet app-style navigation, logged-in only */}
      {isLoggedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-md border-t border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-3 h-16">
            {NAV_ITEMS.map(({ tab, shortLabel, icon: Icon }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className={`text-[10px] font-bold ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                    {shortLabel}
                  </span>
                  {isActive && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
