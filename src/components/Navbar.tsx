import React from 'react';
import { BookOpen, Users, BarChart3, Heart, LogOut, QrCode, Lock, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  activeTab: 'workshops' | 'participants' | 'analytics' | 'survey' | 'login';
  setActiveTab: (tab: 'workshops' | 'participants' | 'analytics' | 'survey' | 'login') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOpenQrCode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isLoggedIn, 
  onLogout,
  onOpenQrCode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => setActiveTab(isLoggedIn ? 'workshops' : 'login')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg text-white tracking-tight block">5º EPA Pirassununga</span>
              <span className="text-[10px] text-teal-400 font-bold block">Movimento Familiar Cristão</span>
            </div>
          </div>

          {/* Navigation Items */}
          {isLoggedIn ? (
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab('workshops')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  activeTab === 'workshops'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Oficinas & Chamada</span>
              </button>

              <button
                onClick={() => setActiveTab('participants')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  activeTab === 'participants'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Inscritos</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Pesquisa & Gráficos</span>
              </button>

              <button
                onClick={onOpenQrCode}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 rounded-xl text-xs font-bold transition-all flex-shrink-0"
              >
                <QrCode className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">QR Code / Link</span>
              </button>

              <button
                onClick={onLogout}
                title="Sair do sistema"
                className="ml-1 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('survey')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md hover:bg-emerald-400"
              >
                <span>Pesquisa Pública</span>
              </button>

              <button
                onClick={onOpenQrCode}
                className="p-2 bg-slate-800 text-teal-300 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
                title="QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
