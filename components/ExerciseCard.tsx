
import React, { useState } from 'react';
import { Exercise, SetDetail } from '../types';
import { Card } from './Card';
import { EXERCISE_FALLBACK_IMG } from '../services/storageService';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (updates: Partial<Exercise>) => void;
  onReplace: () => void;
  onDelete: () => void;
  onStartTimer: (seconds: number) => void;
  isReplacing?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, onUpdate, onDelete, onReplace, onStartTimer, isReplacing 
}) => {
  const [showTip, setShowTip] = useState(false);
  const [imgSrc, setImgSrc] = useState(exercise.imageUrl || `${EXERCISE_FALLBACK_IMG}&exercise=${encodeURIComponent(exercise.name)}`);

  const updateSet = (setId: string, updates: Partial<SetDetail>) => {
    const newSets = exercise.setDetails.map(s => 
      s.id === setId ? { ...s, ...updates } : s
    );
    
    if (updates.isCompleted && !exercise.setDetails.find(s => s.id === setId)?.isCompleted) {
      onStartTimer(exercise.rest || 60);
    }

    onUpdate({ setDetails: newSets, initialWeight: updates.weight || exercise.initialWeight });
  };

  const handleImgError = () => {
    setImgSrc(EXERCISE_FALLBACK_IMG);
  };

  return (
    <Card className={`!p-0 border-none bg-slate-900/40 transition-all duration-500 ${isReplacing ? 'opacity-50 blur-sm' : ''}`}>
      {/* Imagem com Overlay */}
      <div className="relative aspect-video rounded-t-[2rem] overflow-hidden group">
        <img 
          src={imgSrc} 
          onError={handleImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt={exercise.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[8px] font-black bg-orange-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">{exercise.muscleGroup}</span>
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none mt-1">{exercise.name}</h3>
            </div>
            <button 
              onClick={() => setShowTip(!showTip)}
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Dica do Personal IA */}
      {showTip && (
        <div className="p-5 bg-indigo-500/10 border-b border-indigo-500/20 animate-in slide-in-from-top-2">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-indigo-400" /> Dica de Execução
          </p>
          <p className="text-xs text-slate-300 italic">"{exercise.executionTip}"</p>
        </div>
      )}

      {/* Tabela de Séries */}
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-12 gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">
          <div className="col-span-2">Série</div>
          <div className="col-span-4">Carga (kg)</div>
          <div className="col-span-4">Reps</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        <div className="space-y-1">
          {exercise.setDetails.map((set, idx) => (
            <div key={set.id} className={`grid grid-cols-12 gap-2 p-2 rounded-2xl items-center transition-all duration-300 ${set.isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-950/40 border border-white/5'}`}>
              <div className="col-span-2 text-center text-xs font-black text-slate-500">{idx + 1}</div>
              
              <div className="col-span-4">
                <input 
                  type="text" 
                  value={set.weight}
                  onChange={(e) => updateSet(set.id, { weight: e.target.value })}
                  className="w-full bg-transparent text-sm font-black text-center text-white outline-none"
                />
              </div>

              <div className="col-span-4">
                <input 
                  type="text" 
                  value={set.reps}
                  onChange={(e) => updateSet(set.id, { reps: e.target.value })}
                  className="w-full bg-transparent text-sm font-black text-center text-white outline-none"
                />
              </div>

              <div className="col-span-2 flex justify-end">
                <button 
                  onClick={() => updateSet(set.id, { isCompleted: !set.isCompleted })}
                  className={`
                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 transform relative overflow-hidden
                    ${set.isCompleted 
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110 animate-pop' 
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700 active:scale-90 border border-white/5'
                    }
                  `}
                >
                  {/* Checkmark SVG animado */}
                  <svg 
                    className={`w-5 h-5 transition-all duration-500 ${set.isCompleted ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-12 opacity-0'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="4" 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  
                  {/* Efeito de brilho quando completo */}
                  {set.isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Inferiores */}
      <div className="px-6 py-4 bg-slate-950/20 flex justify-between items-center rounded-b-[2rem]">
        <div className="flex gap-4">
          <button onClick={onReplace} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors">Substituir</button>
          <button onClick={onDelete} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors">Remover</button>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Descanso:</span>
           <span className="text-xs font-black text-orange-500">{exercise.rest}s</span>
        </div>
      </div>
    </Card>
  );
};
