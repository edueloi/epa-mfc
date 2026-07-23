import React, { useState } from 'react';
import { Lock, LogIn, KeyRound, User, Eye, EyeOff } from 'lucide-react';
import { EpaLoading } from './EpaLoading';
import logoEpa from '../images/logo-epa.png';
import logoMfc from '../images/mfc.jpg';

interface LoginScreenProps {
  onLoginSuccess: (token: string, username: string, role: string, workshopId: number | null) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Usuário ou senha incorretos.');
        return;
      }

      onLoginSuccess(data.token, data.username, data.role, data.workshop_id ?? null);
    } catch (err) {
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col overflow-y-auto">

      {/* Decorative glow blobs */}
      <div className="fixed -top-24 -right-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -left-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative z-10">

        {/* Brand Header */}
        <div className="w-full max-w-sm flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl p-2.5 flex items-center justify-center">
              <img src={logoEpa} alt="Logo 5º EPA Pirassununga" className="w-full h-full object-contain" />
            </div>
            <img
              src={logoMfc}
              alt="Logo Movimento Familiar Cristão"
              className="w-20 h-20 rounded-2xl object-cover shadow-xl border border-white/10"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            5º EPA Pirassununga
          </h1>
          <p className="text-xs sm:text-sm text-indigo-300 font-bold mt-1">
            Encontro Paulista do MFC
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">

          <div className="space-y-1">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Área Restrita</h2>
            <p className="text-xs text-slate-500">
              Acesso para a Comissão Organizadora e Oficineiros.
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
                  autoComplete="username"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Senha de Acesso</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <EpaLoading label="Entrando..." size="sm" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-blue-400" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-slate-400 font-medium text-center mt-8">
          Movimento Familiar Cristão • Pirassununga / SP
        </p>
      </div>
    </div>
  );
};
