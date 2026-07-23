import React from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  max?: number;
  sublabel?: string;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  label,
  max = 5,
  sublabel,
}) => {
  const getRatingText = (val: number) => {
    switch (val) {
      case 1: return 'Péssimo';
      case 2: return 'Ruim';
      case 3: return 'Regular';
      case 4: return 'Bom';
      case 5: return 'Excelente';
      default: return 'Selecione';
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:border-emerald-300">
      {label && (
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-sm font-semibold text-slate-800">{label}</label>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {value > 0 ? `${value}/${max} - ${getRatingText(value)}` : 'Não avaliado'}
          </span>
        </div>
      )}
      {sublabel && <p className="text-xs text-slate-500 mb-3">{sublabel}</p>}

      <div className="flex items-center gap-2">
        {Array.from({ length: max }, (_, idx) => {
          const starVal = idx + 1;
          const isSelected = starVal <= value;
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => onChange(starVal)}
              className={`flex-1 py-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-sm scale-[1.02]'
                  : 'bg-white border border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500'
              }`}
            >
              <Star className={`w-5 h-5 ${isSelected ? 'fill-slate-950 stroke-slate-950' : ''}`} />
              <span className="text-[10px] font-bold mt-0.5">{starVal}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
