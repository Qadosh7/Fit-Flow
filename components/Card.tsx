
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        relative overflow-hidden rounded-[2rem] p-5 transition-all duration-300
        ${active 
          ? 'bg-orange-500 border-orange-500 ring-4 ring-orange-500/10 z-10' 
          : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'
        }
        ${onClick ? 'cursor-pointer active:scale-[0.97]' : ''}
        ${className}
      `}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
