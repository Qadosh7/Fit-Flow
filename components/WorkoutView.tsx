
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutPlan, Exercise, WorkoutSession, UserPreferences, ExerciseLog } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from './Button';
import { RestTimer } from './RestTimer';
import { getExerciseAlternatives } from '../services/geminiService';

interface WorkoutViewProps {
  plan: WorkoutPlan;
  userPrefs: UserPreferences;
  onUpdate: (updatedPlan: WorkoutPlan) => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onFinishWorkout: (session: WorkoutSession) => void;
  onGoToDashboard: () => void;
  onOpenLibrary: () => void;
  onDayChange?: (idx: number) => void;
  initialDayIdx?: number;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ 
    plan, userPrefs, onUpdate, onFinishWorkout, onGoToDashboard, onOpenLibrary, onDayChange, initialDayIdx = 0
}) => {
  const [activeDayIdx, setActiveDayIdx] = useState(initialDayIdx);
  const [activeTimer, setActiveTimer] = useState<{ seconds: number, exerciseId: string } | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Swipe logic
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const safeDayIdx = Math.min(activeDayIdx, plan.days.length - 1);
  const activeDay = plan.days[safeDayIdx];

  useEffect(() => {
    if (onDayChange) onDayChange(activeDayIdx);
  }, [activeDayIdx]);

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    const newPlan = { ...plan };
    newPlan.days[safeDayIdx].exercises = newPlan.days[safeDayIdx].exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    );
    onUpdate(newPlan);
  };

  const deleteExercise = (exerciseId: string) => {
    if (!confirm("Remover este exercício do seu plano?")) return;
    const newPlan = { ...plan };
    newPlan.days[safeDayIdx].exercises = newPlan.days[safeDayIdx].exercises.filter(ex => ex.id !== exerciseId);
    onUpdate(newPlan);
  };

  const handleStartReplace = async (ex: Exercise) => {
    setReplacingId(ex.id);
    setIsAiLoading(true);
    try {
      const alts = await getExerciseAlternatives(ex, userPrefs);
      setAlternatives(alts);
    } catch (err) {
      alert("Erro ao buscar alternativas via IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectAlternative = (newEx: Exercise) => {
    const newPlan = { ...plan };
    newPlan.days[safeDayIdx].exercises = newPlan.days[safeDayIdx].exercises.map(ex => 
      ex.id === replacingId ? newEx : ex
    );
    onUpdate(newPlan);
    setReplacingId(null);
    setAlternatives([]);
  };

  const handleFinish = () => {
    const totalSets = activeDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedSets = activeDay.exercises.reduce((acc, ex) => acc + ex.setDetails.filter(s => s.isCompleted).length, 0);
    
    const logs: ExerciseLog[] = activeDay.exercises.map(ex => ({
      name: ex.name,
      englishName: ex.englishName,
      maxWeight: Math.max(...ex.setDetails.map(s => parseFloat(s.weight) || 0), 0),
      volume: ex.setDetails.reduce((acc, s) => acc + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0)
    }));

    onFinishWorkout({
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      dayLabel: activeDay.label,
      dayDescription: activeDay.description,
      totalSets,
      completedSets,
      exerciseCount: activeDay.exercises.length,
      totalVolume: logs.reduce((acc, l) => acc + l.volume, 0),
      exerciseLogs: logs
    });
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeDayIdx < plan.days.length - 1) {
      setActiveDayIdx(prev => prev + 1);
    } else if (isRightSwipe && activeDayIdx > 0) {
      setActiveDayIdx(prev => prev - 1);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 pb-40 animate-view overflow-x-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <header className="sticky top-0 z-[60] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-6 flex items-center justify-between">
        <button onClick={onGoToDashboard} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-all hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center animate-view">
          <h2 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">{activeDay.label}</h2>
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1 animate-pulse">{activeDay.description}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs font-black italic shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]">
          {safeDayIdx + 1}/{plan.days.length}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-6 stagger-item stagger-1">
        {plan.days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95 ${activeDayIdx === idx ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105 active-tab-glow' : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-white/10'}`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div key={activeDayIdx} className="px-6 space-y-6 animate-view">
        {activeDay.exercises.map((ex, idx) => (
          <div key={ex.id} className={`stagger-item ${idx < 5 ? `stagger-${idx + 1}` : ''}`}>
            <ExerciseCard 
              exercise={ex} 
              onUpdate={(upd) => updateExercise(ex.id, upd)}
              onDelete={() => deleteExercise(ex.id)}
              onReplace={() => handleStartReplace(ex)}
              onStartTimer={(s) => setActiveTimer({ seconds: s, exerciseId: ex.id })}
              isReplacing={replacingId === ex.id && isAiLoading}
            />
          </div>
        ))}

        <button 
          onClick={onOpenLibrary}
          className="w-full py-10 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-orange-400 hover:border-orange-500/30 transition-all active:scale-[0.98] stagger-item stagger-5"
        >
          <span className="text-2xl font-black">+</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Adicionar da Biblioteca</span>
        </button>
      </div>

      {replacingId && !isAiLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-6 flex flex-col animate-view">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic uppercase">Alternativas IA</h3>
            <button onClick={() => setReplacingId(null)} className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
          </div>
          <div className="space-y-4 overflow-y-auto no-scrollbar pb-10">
            {alternatives.map((alt, idx) => (
              <div 
                key={alt.id} 
                onClick={() => handleSelectAlternative(alt)}
                className={`bg-slate-900 border border-white/5 p-4 rounded-3xl flex gap-4 active:scale-95 transition-all hover:bg-slate-800 stagger-item ${idx < 4 ? `stagger-${idx + 1}` : ''}`}
              >
                <img src={alt.imageUrl} className="w-20 h-20 object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all" alt={alt.name} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase truncate">{alt.name}</h4>
                  <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1">{alt.muscleGroup}</p>
                  <p className="text-[10px] text-slate-500 italic mt-2 line-clamp-2">{alt.executionTip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAiLoading && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-10 animate-view">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
          <p className="text-xs font-black text-white uppercase tracking-[0.2em] animate-pulse">IA Sincronizando Biomecânica...</p>
        </div>
      )}

      {activeTimer && (
        <RestTimer 
          initialSeconds={activeTimer.seconds} 
          onClose={() => setActiveTimer(null)} 
          onAdjustRest={(newS) => updateExercise(activeTimer.exerciseId, { rest: newS })}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 z-50 animate-view">
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full h-16 !rounded-[1.5rem] italic font-black uppercase tracking-[0.2em] text-xs bg-orange-500 shadow-2xl shadow-orange-600/30 active:scale-95 transition-all hover:brightness-110"
          onClick={handleFinish}
        >
          Finalizar Sessão 🏆
        </Button>
      </div>
    </div>
  );
};
