
import React from 'react';
import { WorkoutSession } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface HistoryViewProps {
  sessions: WorkoutSession[];
  onBack: () => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onBack, onClearHistory }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalCompletedSets = sessions.reduce((acc, s) => acc + s.completedSets, 0);
  const workoutsThisMonth = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex flex-col min-h-screen pb-24 pt-8 px-6 bg-slate-950">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Histórico</h2>
        <button onClick={onBack} className="text-indigo-500 font-bold">VOLTAR</button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-indigo-600/10 border-indigo-500/20 text-center">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Total Treinos</span>
            <span className="text-3xl font-black text-white">{sessions.length}</span>
        </Card>
        <Card className="bg-emerald-600/10 border-emerald-500/20 text-center">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Este Mês</span>
            <span className="text-3xl font-black text-white">{workoutsThisMonth}</span>
        </Card>
      </div>

      <div className="space-y-4 flex-1">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-4xl mb-4">🏋️‍♂️</p>
            <p className="font-bold">Nenhum treino registrado ainda.</p>
            <p className="text-sm">Complete seu primeiro treino para ver a evolução!</p>
          </div>
        ) : (
          sortedSessions.map(session => (
            <Card key={session.id} className="!p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tight">{session.dayLabel}</h4>
                  <p className="text-xs text-slate-500 font-medium">{session.dayDescription}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{formatDate(session.date)}</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${(session.completedSets / session.totalSets) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-black text-slate-300">
                    {Math.round((session.completedSets / session.totalSets) * 100)}%
                </span>
              </div>
              <div className="flex gap-4 mt-3">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">{session.exerciseCount} exercícios</span>
                 <span className="text-[10px] text-slate-500 font-bold uppercase">{session.completedSets} séries feitas</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {sessions.length > 0 && (
        <div className="mt-10 mb-4">
           <button 
             onClick={() => { if(confirm("Deseja apagar todo o histórico?")) onClearHistory(); }}
             className="text-[10px] text-rose-500/50 font-black uppercase tracking-widest w-full text-center hover:text-rose-500"
           >
             Limpar Histórico de Evolução
           </button>
        </div>
      )}
    </div>
  );
};
