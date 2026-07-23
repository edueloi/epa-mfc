import React from 'react';
import logoEpa from '../images/logo-epa.png';

interface EpaLoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16'
};

const paddingMap = {
  sm: 'p-0.5',
  md: 'p-1',
  lg: 'p-1.5'
};

export const EpaLoading: React.FC<EpaLoadingProps> = ({ label, size = 'md' }) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`${sizeMap[size]} ${paddingMap[size]} animate-epa-loading rounded-xl bg-white shadow-md flex items-center justify-center`}>
        <img
          src={logoEpa}
          alt="Carregando..."
          className="w-full h-full object-contain"
        />
      </div>
      {label && <span className="font-bold text-current">{label}</span>}
    </div>
  );
};
