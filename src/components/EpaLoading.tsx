import React from 'react';
import logoEpa from '../images/logo-epa.png';

interface EpaLoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-7 h-7',
  md: 'w-12 h-12',
  lg: 'w-20 h-20'
};

const paddingMap = {
  sm: 'p-0.5',
  md: 'p-1.5',
  lg: 'p-2.5'
};

const ringMap = {
  sm: 'w-9 h-9 border-2',
  md: 'w-[3.75rem] h-[3.75rem] border-[3px]',
  lg: 'w-24 h-24 border-4'
};

export const EpaLoading: React.FC<EpaLoadingProps> = ({ label, size = 'md' }) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative flex items-center justify-center flex-shrink-0">
        {/* Soft glow behind everything */}
        <div className={`absolute ${ringMap[size]} rounded-full bg-blue-400/30 blur-md epa-loading-glow`} />

        {/* Spinning progress ring */}
        <div
          className={`absolute ${ringMap[size]} rounded-full border-transparent border-t-blue-600 border-r-blue-400 epa-loading-ring`}
        />

        {/* Logo, gently pulsing */}
        <div className={`relative ${sizeMap[size]} ${paddingMap[size]} animate-epa-loading rounded-full bg-white shadow-md flex items-center justify-center`}>
          <img
            src={logoEpa}
            alt="Carregando..."
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      {label && <span className="font-bold text-current">{label}</span>}
    </div>
  );
};
