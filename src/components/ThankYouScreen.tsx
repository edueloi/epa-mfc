import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Heart, BarChart3, Home, ShieldCheck } from 'lucide-react';

interface ThankYouScreenProps {
  onGoToAnalytics: () => void;
  onGoHome: () => void;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ onGoToAnalytics, onGoHome }) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resposta Gravada com Sucesso</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Muito Obrigado!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Sua colaboração foi gravada de forma <strong className="text-slate-900 font-semibold">100% anônima</strong> no sistema. Ela é de extrema relevância para fortalecer a missão do Movimento Familiar Cristão e aprimorar nossas formações em Pirassununga e região.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
          <Heart className="w-4 h-4 text-blue-500 fill-blue-500" />
          <span>Equipe Organizadora do 5º EPA • Pirassununga</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onGoToAnalytics}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-400 text-white font-extrabold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ver Gráficos do Encontro</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar à Página Principal</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
