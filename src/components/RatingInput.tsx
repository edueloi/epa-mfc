import React from 'react';
import { motion } from 'motion/react';
import { Frown, Meh, Smile, ThumbsDown, PartyPopper } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  max?: number;
  sublabel?: string;
  comment?: string;
  onCommentChange?: (val: string) => void;
  commentPlaceholder?: string;
}

const FACES = [
  { icon: ThumbsDown, text: 'Ruim', color: 'text-rose-600', bg: 'bg-rose-500', ring: 'ring-rose-200' },
  { icon: Frown, text: 'Regular', color: 'text-orange-600', bg: 'bg-orange-500', ring: 'ring-orange-200' },
  { icon: Meh, text: 'Ok', color: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-200' },
  { icon: Smile, text: 'Bom', color: 'text-lime-600', bg: 'bg-lime-500', ring: 'ring-lime-200' },
  { icon: PartyPopper, text: 'Satisfatório', color: 'text-blue-600', bg: 'bg-blue-500', ring: 'ring-blue-200' },
];

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  label,
  max = 5,
  sublabel,
  comment,
  onCommentChange,
  commentPlaceholder = 'Quer contar mais alguma coisa? (opcional)',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 transition-all hover:border-blue-300 hover:shadow-sm space-y-4">
      {(label || sublabel) && (
        <div className="space-y-0.5">
          {label && <label className="text-sm font-bold text-slate-800 block">{label}</label>}
          {sublabel && <p className="text-xs text-slate-500 leading-relaxed">{sublabel}</p>}
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {Array.from({ length: max }, (_, idx) => {
          const val = idx + 1;
          const face = FACES[Math.min(idx, FACES.length - 1)];
          const Icon = face.icon;
          const isSelected = val === value;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 sm:py-3 rounded-xl border transition-all ${
                isSelected
                  ? `${face.bg} border-transparent text-white shadow-md scale-105 ring-4 ${face.ring}`
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId={label ? `rating-glow-${label}` : undefined}
                  className="absolute inset-0 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 relative z-10 ${isSelected ? 'fill-white/15' : ''}`} strokeWidth={2.25} />
              <span className="text-[9px] sm:text-[10px] font-extrabold relative z-10 leading-none">{val}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${
          value > 0 ? `${FACES[Math.min(value - 1, FACES.length - 1)].color} bg-slate-50` : 'text-slate-400 bg-slate-50'
        }`}>
          {value > 0 ? FACES[Math.min(value - 1, FACES.length - 1)].text : 'Toque para avaliar'}
        </span>
      </div>

      {onCommentChange && (
        <input
          type="text"
          placeholder={commentPlaceholder}
          value={comment ?? ''}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      )}
    </div>
  );
};
