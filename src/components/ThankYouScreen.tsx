import React from 'react';
import { motion } from 'motion/react';
import { Heart, Home, ShieldCheck, Sparkles } from 'lucide-react';
import logoEpa from '../images/logo-epa.png';

interface ThankYouScreenProps {
  onGoHome: () => void;
}

// Fixed confetti burst — deterministic positions/colors/delays so the animation
// looks the same every time without relying on Math.random().
const CONFETTI = [
  { x: '8%', color: '#2563eb', delay: 0.1, size: 10 },
  { x: '18%', color: '#f59e0b', delay: 0.35, size: 8 },
  { x: '28%', color: '#4f46e5', delay: 0.05, size: 9 },
  { x: '38%', color: '#ec4899', delay: 0.5, size: 7 },
  { x: '48%', color: '#10b981', delay: 0.2, size: 10 },
  { x: '58%', color: '#2563eb', delay: 0.4, size: 8 },
  { x: '68%', color: '#f59e0b', delay: 0.15, size: 9 },
  { x: '78%', color: '#4f46e5', delay: 0.3, size: 7 },
  { x: '88%', color: '#ec4899', delay: 0.0, size: 10 },
  { x: '95%', color: '#10b981', delay: 0.45, size: 8 },
  { x: '13%', color: '#ec4899', delay: 0.6, size: 8 },
  { x: '63%', color: '#10b981', delay: 0.55, size: 9 },
];

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4 py-10 overflow-hidden relative">

      {/* Falling confetti */}
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-sm pointer-events-none"
          style={{ left: c.x, width: c.size, height: c.size, backgroundColor: c.color }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 3.2, delay: c.delay, ease: 'easeIn' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
          animate={{ scale: [0.4, 1.12, 1], opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut', times: [0, 0.7, 1] }}
          className="relative w-24 h-24 mx-auto"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-blue-400 blur-xl"
          />
          <div className="relative w-24 h-24 rounded-3xl bg-white shadow-lg border border-slate-100 p-3 flex items-center justify-center">
            <img src={logoEpa} alt="Logo 5º EPA Pirassununga" className="w-full h-full object-contain" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resposta Gravada com Sucesso</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2 flex-wrap">
            <span>Muito Obrigado!</span>
            <Sparkles className="w-7 h-7 text-amber-500" />
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Sua colaboração foi gravada de forma <strong className="text-slate-900 font-semibold">100% anônima</strong> e
            é muito importante para fortalecermos a missão do Movimento Familiar Cristão.
          </p>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium pt-2">
            Que Deus abençoe você e sua família! 🙏
            <br />
            Até o próximo EPA!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs font-medium text-slate-600"
        >
          <Heart className="w-4 h-4 text-blue-500 fill-blue-500" />
          <span>Equipe Organizadora do 5º EPA • Pirassununga</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          className="pt-2"
        >
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
