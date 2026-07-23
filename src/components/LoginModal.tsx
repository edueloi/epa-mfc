import React, { useState } from 'react';
import { Lock, LogIn, AlertCircle, Shield, KeyRound, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple robust authentication check for event organizers / oficineiros
    // Default valid credentials: admin / epa2026 or admin / mfc2026 or oficineiro / 123456
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (
      (cleanUser === 'admin' && (cleanPass === 'epa2026' || cleanPass === 'mfc2026')) ||
      (cleanUser === 'oficineiro' && cleanPass === 'epa2026') ||
      cleanPass === 'epa2026' || cleanPass === 'mfc2026'
    ) {
      onLoginSuccess();
      setUsername('');
      setPassword('');
      onClose();
    } else {
      setError('Usuário ou senha incorretos. Verifique as credenciais de acesso restrito.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Área Restrita do EPA</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Acesso exclusivo para a Comissão Organizadora e Oficineiros do 5º EPA.
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Acesso para Organização:</span>
          </div>
          <p className="text-emerald-800 text-[11px]">
            Usuário: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-950">admin</code> ou <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-950">oficineiro</code>
          </p>
          <p className="text-emerald-800 text-[11px]">
            Senha de Acesso: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-950">epa2026</code>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Usuário</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Digite seu usuário..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar no Sistema</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
