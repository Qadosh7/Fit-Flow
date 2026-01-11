
import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { UserPreferences, ExperienceLevel, Goal, EquipmentPreference } from '../types';
import { MUSCLE_GROUPS, GOALS, LEVELS, EQUIPMENTS, AGE_RANGES, DESCRIPTIONS } from '../constants';

interface SettingsProps {
  initialPrefs: UserPreferences;
  onSave: (prefs: UserPreferences, regenerate: boolean) => void;
  onCancel: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ initialPrefs, onSave, onCancel }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPrefs);

  const updatePrefs = (updates: Partial<UserPreferences>) => {
    setPrefs(prev => ({ ...prev, ...updates }));
  };

  const toggleFocus = (muscle: string) => {
    setPrefs(prev => {
      const exists = prev.focusMuscles.includes(muscle);
      return {
        ...prev,
        focusMuscles: exists 
          ? prev.focusMuscles.filter(m => m !== muscle)
          : [...prev.focusMuscles, muscle]
      };
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-40 pt-8 px-6 bg-slate-950">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Perfil e Metas</h2>
        <button onClick={onCancel} className="text-slate-500 font-black text-[10px] tracking-widest uppercase">FECHAR</button>
      </div>

      <div className="space-y-10">
        {/* Section: Básico */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Sua Base</h3>
          <div className="space-y-6 bg-slate-900/50 border border-white/5 rounded-[2rem] p-6">
             <div>
                <span className="text-[10px] text-slate-500 block mb-3 uppercase font-black tracking-widest">Faixa de Idade</span>
                <select 
                  value={prefs.age}
                  onChange={e => updatePrefs({ age: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none text-white"
                >
                  {AGE_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
             </div>
             <div>
                <span className="text-[10px] text-slate-500 block mb-3 uppercase font-black tracking-widest">Gênero</span>
                <select 
                  value={prefs.gender}
                  onChange={e => updatePrefs({ gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none text-white appearance-none"
                >
                  <option>Masculino</option>
                  <option>Feminino</option>
                </select>
                <p className="mt-2 text-[9px] text-slate-500 font-medium">
                  {DESCRIPTIONS.gender[prefs.gender as keyof typeof DESCRIPTIONS.gender]}
                </p>
             </div>
          </div>
        </section>

        {/* Section: Nível */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Nível de Experiência</h3>
          <div className="grid grid-cols-1 gap-2">
            {LEVELS.map(level => (
              <button 
                key={level}
                onClick={() => updatePrefs({ experienceLevel: level as ExperienceLevel })}
                className={`p-4 rounded-xl text-left border-2 transition-all ${prefs.experienceLevel === level ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
              >
                <span className="block text-xs font-black uppercase tracking-tight">{level}</span>
                <span className={`text-[9px] font-medium block mt-0.5 ${prefs.experienceLevel === level ? 'text-indigo-200' : 'text-slate-600'}`}>
                  {DESCRIPTIONS.levels[level as ExperienceLevel]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Frequência */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Disponibilidade</h3>
          <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Treinos por semana</span>
                <span className="text-xl font-black text-indigo-400 italic">{prefs.weeklyFrequency}x</span>
              </div>
              <input 
                type="range" min="1" max="7" 
                value={prefs.weeklyFrequency}
                onChange={e => updatePrefs({ weeklyFrequency: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-300 block mb-3 uppercase tracking-widest">Tempo por sessão</span>
              <select 
                value={prefs.sessionDuration}
                onChange={e => updatePrefs({ sessionDuration: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none text-white"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30m</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section: Objetivo */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Objetivo de Treino</h3>
          <div className="grid grid-cols-1 gap-2">
            {GOALS.map(goal => (
              <button 
                key={goal}
                onClick={() => updatePrefs({ goal: goal as Goal })}
                className={`p-4 rounded-xl text-left border-2 transition-all ${prefs.goal === goal ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
              >
                <span className="block text-xs font-black uppercase tracking-tight">{goal}</span>
                <span className={`text-[9px] font-medium block mt-0.5 ${prefs.goal === goal ? 'text-indigo-200' : 'text-slate-600'}`}>
                  {DESCRIPTIONS.goals[goal as Goal]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Foco */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Foco Muscular</h3>
          <div className="grid grid-cols-2 gap-2">
            {MUSCLE_GROUPS.map(muscle => (
              <button 
                key={muscle}
                onClick={() => toggleFocus(muscle)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${prefs.focusMuscles.includes(muscle) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </section>

        {/* Section: Restrições */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Segurança / Lesões</h3>
          <textarea 
            value={prefs.restrictions}
            onChange={e => updatePrefs({ restrictions: e.target.value })}
            className="w-full bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 text-sm font-medium h-32 outline-none focus:border-indigo-500 text-white placeholder:text-slate-700"
            placeholder="Nenhuma restrição informada."
          />
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 z-50">
        <Button size="lg" className="w-full h-14 !rounded-2xl italic font-black uppercase tracking-widest text-[10px]" onClick={() => onSave(prefs, true)}>
          Regerar Treino com IA 🤖
        </Button>
        <Button variant="outline" size="md" className="w-full h-12 !rounded-2xl uppercase tracking-widest text-[10px] font-bold" onClick={() => onSave(prefs, false)}>
          Apenas salvar perfil
        </Button>
      </div>
    </div>
  );
};
