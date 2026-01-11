
import React, { useState, useEffect } from 'react';
import { LibraryExercise } from '../types';
import { Card } from './Card';
import { storageService, EXERCISE_FALLBACK_IMG } from '../services/storageService';
import { MUSCLE_GROUPS } from '../constants';

interface ExerciseLibraryViewProps {
  onBack: () => void;
  onSelectExercise?: (exercise: LibraryExercise) => void;
  activePlanName?: string;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({ 
  onBack, onSelectExercise, activePlanName, favoriteIds, onToggleFavorite 
}) => {
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('Todos');
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      const data = await storageService.getLibraryExercises();
      setExercises(data);
      setLoading(false);
    };
    fetchLibrary();
  }, []);

  const handleAdd = (ex: LibraryExercise) => {
    if (onSelectExercise) {
      onSelectExercise(ex);
      setAddedId(ex.id);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                          ex.english_name?.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = filterMuscle === 'Todos' || ex.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="flex flex-col min-h-screen pb-32 pt-12 px-6 bg-slate-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Biblioteca</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Acervo FitFlow AI</p>
        </div>
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="space-y-6 mb-8">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar exercício..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 text-sm font-medium outline-none focus:ring-2 ring-orange-500/20 transition-all text-white placeholder:text-slate-600"
          />
          <svg className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
          <button onClick={() => setFilterMuscle('Todos')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${filterMuscle === 'Todos' ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}>Todos</button>
          {MUSCLE_GROUPS.map(muscle => (
            <button key={muscle} onClick={() => setFilterMuscle(muscle)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${filterMuscle === muscle ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{muscle}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-8">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-bold text-slate-400 uppercase tracking-tighter">Nada encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExercises.map(ex => (
              <Card key={ex.id} className="!p-0 overflow-hidden bg-slate-900/40 border-white/5 shadow-2xl relative">
                <button 
                  onClick={() => onToggleFavorite(ex.id)}
                  className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md border border-white/10 active:scale-90 transition-all ${favoriteIds.includes(ex.id) ? 'bg-rose-500/20 text-rose-500' : 'bg-black/20 text-white/50'}`}
                >
                  <svg className="w-5 h-5" fill={favoriteIds.includes(ex.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <div className="flex flex-col">
                  <div className="flex h-36">
                    <div className="w-32 shrink-0 relative overflow-hidden">
                      <img 
                        src={ex.image_url} 
                        onError={(e) => { (e.target as HTMLImageElement).src = EXERCISE_FALLBACK_IMG; }}
                        className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
                        loading="lazy" 
                      />
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-black text-slate-100 text-sm uppercase leading-tight truncate">{ex.name}</h4>
                        </div>
                        <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1">{ex.muscle_group} • {ex.equipment}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 italic line-clamp-1 mt-2">"{ex.execution_tip}"</p>
                    </div>
                  </div>
                  <div className="px-5 py-4 bg-slate-950/40 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest truncate max-w-[120px]">{ex.english_name}</span>
                    <button 
                      onClick={() => handleAdd(ex)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${addedId === ex.id ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white active:scale-95 shadow-lg shadow-orange-500/20'}`}
                    >
                      {addedId === ex.id ? 'ADICIONADO! ✓' : '+ ADICIONAR'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
