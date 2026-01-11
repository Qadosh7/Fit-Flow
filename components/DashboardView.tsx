
import React, { useState } from 'react';
import { UserProfile, WorkoutSession, WorkoutPlan, BodyMetrics, LibraryExercise } from '../types';
import { Card } from './Card';
import { EXERCISE_FALLBACK_IMG } from '../services/storageService';

interface DashboardViewProps {
  user: UserProfile;
  sessions: WorkoutSession[];
  plan: WorkoutPlan | null; 
  allPlans: WorkoutPlan[]; 
  favoriteExercises: LibraryExercise[];
  onUpdateMetrics: (metrics: Partial<BodyMetrics>) => void;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onStartWorkout: () => void;
  onOpenHistory: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  onSelectPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onCreateEmptyPlan: () => void;
  onAddFavoriteExercise: (ex: LibraryExercise) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  user, sessions, plan, allPlans, favoriteExercises, onStartWorkout, onOpenHistory, onOpenLibrary, onOpenSettings, onSignOut, onSelectPlan, onDeletePlan, onCreateEmptyPlan, onAddFavoriteExercise
}) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [isEditMode, setIsEditMode] = useState(false);
  
  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = -1; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({ day: d.getDate(), label: labels[d.getDay()], full: d });
    }
    return days;
  };

  const days = getWeekDays();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-32">
      <header className="px-6 pt-12 pb-8 flex justify-between items-center stagger-item stagger-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-xl font-black shadow-lg shadow-orange-500/20 active:scale-90 transition-transform cursor-pointer">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none italic text-white">
              Olá, {user.name.split(' ')[0]}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Nível {user.level} • {user.xp} XP</p>
          </div>
        </div>
        <button onClick={onOpenSettings} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 active:scale-90 transition-all hover:bg-slate-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </button>
      </header>

      <div className="px-6 mb-8 overflow-x-auto no-scrollbar flex gap-3 stagger-item stagger-2">
        {days.map((d) => (
          <button key={d.day} onClick={() => setSelectedDay(d.day)} className={`flex flex-col items-center justify-center min-w-[56px] h-20 rounded-[1.5rem] border transition-all duration-300 active:scale-95 ${selectedDay === d.day ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/30 scale-105' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'}`}>
            <span className={`text-xs font-black uppercase tracking-tighter ${selectedDay === d.day ? 'text-white' : ''}`}>{d.label}</span>
            <span className={`text-lg font-black mt-1 ${selectedDay === d.day ? 'text-white' : 'text-slate-300'}`}>{d.day}</span>
          </button>
        ))}
      </div>

      <div className="px-6 space-y-10">
        <section className="stagger-item stagger-3">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1">Treino do Dia</h2>
          {plan ? (
            <Card onClick={onStartWorkout} className="!p-0 border-none bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden group active:scale-[0.98] transition-transform">
              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg uppercase tracking-widest border border-orange-500/20">Ativo</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none pt-2 truncate pr-4">{plan.name}</h3>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform">{plan.isAI ? '✨' : '🏋️'}</div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.days.length} DIAS DE ROTINA</p>
                    <div className="flex gap-1">
                      {plan.days.map((_, i) => <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${i === 0 ? 'bg-orange-500 w-12 shadow-[0_0_8px_#f97316]' : 'bg-slate-800'}`} />)}
                    </div>
                  </div>
                  <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/30 group-hover:translate-x-2 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all" />
            </Card>
          ) : (
            <button onClick={onOpenSettings} className="w-full p-10 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-500 hover:border-orange-500/50 hover:text-orange-400 transition-all active:scale-[0.98]">
               <span className="text-4xl opacity-50 animate-bounce">🤖</span>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toque para Gerar Treino IA</p>
            </button>
          )}
        </section>

        {/* LISTA PERSONALIZADA (FAVORITOS) */}
        <section className="stagger-item stagger-4">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Meus Exercícios</h2>
            <button onClick={onOpenLibrary} className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Biblioteca →</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
            {favoriteExercises.length === 0 ? (
              <div className="w-full py-8 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Favorite exercícios para acesso rápido</p>
              </div>
            ) : favoriteExercises.map((ex, idx) => (
              <div key={ex.id} className="min-w-[140px] max-w-[140px] group relative active:scale-95 transition-all">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 relative">
                  <img 
                    src={ex.image_url} 
                    onError={(e) => { (e.target as HTMLImageElement).src = EXERCISE_FALLBACK_IMG; }}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                    alt={ex.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-black text-white uppercase italic leading-tight truncate">{ex.name}</p>
                    <p className="text-[7px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1">{ex.muscle_group}</p>
                  </div>
                  <button 
                    onClick={() => onAddFavoriteExercise(ex)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 stagger-item stagger-4">
          <div className="bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] space-y-1 hover:bg-slate-800/50 transition-colors">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sessões</span>
            <p className="text-2xl font-black text-white italic">{sessions.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] space-y-1 hover:bg-slate-800/50 transition-colors">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Séries OK</span>
            <p className="text-2xl font-black text-white italic">{sessions.reduce((acc, s) => acc + s.completedSets, 0)}</p>
          </div>
        </section>

        <section className="space-y-4 stagger-item stagger-5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Minhas Rotinas</h2>
            <div className="flex gap-4">
              <button onClick={() => setIsEditMode(!isEditMode)} className={`text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all ${isEditMode ? 'text-orange-500' : 'text-slate-600 hover:text-slate-400'}`}>{isEditMode ? 'CONCLUIR' : 'GERENCIAR'}</button>
              <button onClick={onCreateEmptyPlan} className="text-orange-500 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:text-orange-400">+ Nova</button>
            </div>
          </div>
          <div className="space-y-3">
            {allPlans.map((p, idx) => {
              const isActive = plan?.id === p.id;
              return (
                <div key={p.id} onClick={() => !isEditMode && onSelectPlan(p.id)} className={`flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden active:scale-[0.98] stagger-item ${idx < 4 ? `stagger-${idx + 1}` : ''} ${isActive ? 'bg-slate-900 border-orange-500/50' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{p.isAI ? 'AI' : 'MN'}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-200 truncate pr-2">{p.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.days.length} Dias</p>
                  </div>
                  {isEditMode ? (
                    <button onClick={(e) => { e.stopPropagation(); if(confirm("Excluir?")) onDeletePlan(p.id); }} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-90 transition-all hover:bg-rose-500/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  ) : isActive && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse" />}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 z-50 flex justify-between items-center stagger-item stagger-5">
        <button onClick={onStartWorkout} className="p-4 text-orange-500 flex flex-col items-center gap-1 active:scale-90 transition-all hover:opacity-80 active-tab-glow">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 13h6a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1zm0 8h6a1 1 0 001-1v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm10 0h6a1 1 0 001-1v-8a1 1 0 00-1-1h-6a1 1 0 00-1 1v8a1 1 0 001 1zM13 4v4a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1z"/></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Treinos</span>
        </button>
        <button onClick={onOpenLibrary} className="p-4 text-slate-500 hover:text-white transition-all flex flex-col items-center gap-1 active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Explorar</span>
        </button>
        <button onClick={onOpenHistory} className="p-4 text-slate-500 hover:text-white transition-all flex flex-col items-center gap-1 active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Histórico</span>
        </button>
        <button onClick={onSignOut} className="p-4 text-slate-500 hover:text-rose-500 transition-all flex flex-col items-center gap-1 active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Sair</span>
        </button>
      </nav>
    </div>
  );
};
