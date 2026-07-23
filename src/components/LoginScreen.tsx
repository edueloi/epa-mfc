import React, { useState } from 'react';
import { 
  Lock, LogIn, Heart, Shield, KeyRound, User, QrCode, 
  MessageSquareHeart, ArrowRight, Sparkles, CheckCircle2, Smartphone 
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGoToPublicSurvey: () => void;
  onOpenQrCode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  onGoToPublicSurvey,
  onOpenQrCode 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (
      (cleanUser === 'admin' && (cleanPass === 'epa2026' || cleanPass === 'mfc2026')) ||
      (cleanUser === 'oficineiro' && cleanPass === 'epa2026') ||
      cleanPass === 'epa2026' || cleanPass === 'mfc2026'
    ) {
      onLoginSuccess();
    } else {
      setError('Usuário ou senha incorretos. Tente "admin" e "epa2026".');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Welcome Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>5º EPA Pirassununga - MFC</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Encontro Pan-Americano do MFC
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Portal oficial de avaliação de oficinas, lista de presença de participantes e relatórios do evento.
              </p>
            </div>

            {/* Public Action Cards */}
            <div className="space-y-3 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Acesso para Participantes & Visitantes:
              </p>

              <button
                onClick={onGoToPublicSurvey}
                className="w-full p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-950/20 rounded-xl">
                    <MessageSquareHeart className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">Responder Pesquisa EPA</span>
                    <span className="text-[10px] font-medium text-slate-900 opacity-90">Anônimo e sem necessidade de login</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenQrCode}
                className="w-full p-3.5 bg-slate-800/80 hover:bg-slate-800 text-teal-300 border border-teal-500/30 rounded-2xl font-bold text-xs transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-teal-400" />
                  <span>Gerar QR Code / Link para WhatsApp</span>
                </div>
                <Smartphone className="w-4 h-4 text-teal-400" />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 font-medium relative z-10">
            Movimento Familiar Cristão • Pirassununga / SP
          </div>
        </div>

        {/* Right Login Box */}
        <div className="md:col-span-6 bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 flex flex-col justify-center space-y-6">
          
          <div className="space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Área Restrita</h2>
            <p className="text-xs text-slate-500">
              Acesso para a Comissão Organizadora e Oficineiros.
            </p>
          </div>

          {/* Preset Helper */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Credenciais da Organização:</span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              Usuário: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-300">admin</code> ou <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-300">oficineiro</code>
            </p>
            <p className="text-emerald-800 text-[11px]">
              Senha: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-300">epa2026</code>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin ou oficineiro"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Senha de Acesso</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="epa2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Entrar no Sistema</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
