
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { UserPreferences, ExperienceLevel, Goal, EquipmentPreference } from '../types';
import { MUSCLE_GROUPS, GOALS, LEVELS, EQUIPMENTS, DEFAULT_USER_PREFS, AGE_RANGES, DESCRIPTIONS } from '../constants';
import { generateAIBackground } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const STEPS = [
  'Perfil',
  'Experiência',
  'Volume',
  'Espaço',
  'Mindset',
  'Prioridades',
  'Segurança'
];

const STEP_IMAGE_PROMPTS: Record<number, string> = {
  0: "A modern high-end gym interior, empty, early morning sunlight, luxury equipment, cinematic feel, dark atmosphere",
  1: "Bodybuilder in silhouette training with heavy weights, chalk in the air, dramatic rim lighting, intense focus",
  2: "Cinematic close-up of a high-end gym clock and a digital calendar on a tablet, depth of field, workspace of a pro athlete",
  3: "Wide shot of a luxury garage gym with free weights and a rack, moody lighting, industrial aesthetic",
  4: "Close up of hands gripping a heavy barbell, veins visible, sweat, raw intensity, motivational fitness photography",
  5: "Abstract glowing anatomical human muscular system, blue and indigo neon lights, high-tech medical visualization",
  6: "Clean, professional recovery room with foam rollers and massage equipment, soft calming blue lighting, zen fitness"
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_USER_PREFS);
  const [stepBackgrounds, setStepBackgrounds] = useState<Record<number, string>>({});
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Pré-carregamento e geração de backgrounds via IA
  useEffect(() => {
    const fetchBg = async () => {
      if (stepBackgrounds[currentStep]) return;
      
      setIsGeneratingImg(true);
      try {
        const prompt = STEP_IMAGE_PROMPTS[currentStep] || STEP_IMAGE_PROMPTS[0];
        const imageUrl = await generateAIBackground(prompt);
        setStepBackgrounds(prev => ({ ...prev, [currentStep]: imageUrl }));
      } catch (err) {
        console.error("Erro ao gerar imagem para o passo:", err);
      } finally {
        setIsGeneratingImg(false);
      }
    };

    fetchBg();
  }, [currentStep]);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const back = () => setCurrentStep(prev => Math.max(prev - 1, 0));

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

  const renderStepContent = () => {
    const animationClass = "animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out";

    switch (currentStep) {
      case 0:
        return (
          <div className={animationClass}>
            <h2 className="text-5xl font-black text-white leading-none italic tracking-tighter uppercase mb-2">
              QUEM É O<br/>
              <span className="text-indigo-500">ATLETA?</span>
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Defina sua base biológica</p>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Idade</span>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_RANGES.map(range => (
                    <Card 
                      key={range} 
                      active={prefs.age === range}
                      onClick={() => updatePrefs({ age: range })}
                      className="!bg-slate-900/40 backdrop-blur-md border-white/5 py-3 hover:border-indigo-500/50"
                    >
                      <span className="text-xs font-black text-white text-center block">{range}</span>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Gênero</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Masculino', 'Feminino'].map(g => (
                    <Card 
                      key={g} 
                      active={prefs.gender === g}
                      onClick={() => updatePrefs({ gender: g })}
                      className="!bg-slate-900/40 backdrop-blur-md border-white/5 py-4"
                    >
                      <span className="text-sm font-black text-white text-center block uppercase italic">{g}</span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className={animationClass}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-8">NÍVEL DE<br/><span className="text-indigo-500">EXPERIÊNCIA</span></h2>
            <div className="space-y-3">
              {LEVELS.map(level => (
                <Card 
                  key={level} 
                  active={prefs.experienceLevel === level}
                  onClick={() => updatePrefs({ experienceLevel: level as ExperienceLevel })}
                  className="!p-6 !bg-slate-900/40 backdrop-blur-xl border-white/5"
                >
                  <h3 className="text-xl font-black text-white uppercase italic leading-none mb-2">{level}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-tight">
                    {DESCRIPTIONS.levels[level as ExperienceLevel]}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={animationClass}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-10">FREQUÊNCIA E<br/><span className="text-indigo-500">DISPONIBILIDADE</span></h2>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-10">
              <div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sessões Semanais</span>
                  <span className="text-4xl font-black text-white italic">{prefs.weeklyFrequency}x</span>
                </div>
                <input 
                  type="range" min="1" max="7" 
                  value={prefs.weeklyFrequency}
                  onChange={e => updatePrefs({ weeklyFrequency: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              <div className="space-y-4">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Duração Ideal</span>
                <div className="grid grid-cols-1 gap-2">
                  {[30, 60, 90].map(min => (
                    <Card 
                      key={min} 
                      active={prefs.sessionDuration === min}
                      onClick={() => updatePrefs({ sessionDuration: min })}
                      className="py-3 !bg-slate-950/40"
                    >
                      <span className="text-xs font-black text-white uppercase text-center block">
                        {min === 60 ? '1 HORA' : min === 90 ? '1H 30MIN' : `${min} MINUTOS`}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={animationClass}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-8">ONDE VAI<br/><span className="text-indigo-500">TREINAR?</span></h2>
            <div className="grid grid-cols-1 gap-4">
              {EQUIPMENTS.map(item => (
                <Card 
                  key={item} 
                  active={prefs.equipment === item}
                  onClick={() => updatePrefs({ equipment: item as EquipmentPreference })}
                  className="!p-6 !bg-slate-900/40 backdrop-blur-xl"
                >
                  <span className="text-xl font-black text-white uppercase italic block mb-1">{item}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{DESCRIPTIONS.equipments[item as EquipmentPreference]}</span>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className={animationClass}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-8">QUAL O SEU<br/><span className="text-indigo-500">OBJETIVO?</span></h2>
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map(goal => (
                <Card 
                  key={goal} 
                  active={prefs.goal === goal}
                  onClick={() => updatePrefs({ goal: goal as Goal })}
                  className="!p-6 !bg-slate-900/40 backdrop-blur-xl"
                >
                  <span className="text-xl font-black text-white uppercase italic block mb-1">{goal}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{DESCRIPTIONS.goals[goal as Goal]}</span>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className={animationClass}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">GRUPOS EM<br/><span className="text-indigo-500">DESTAQUE</span></h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Priorize áreas específicas para a IA focar</p>
            <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
              {MUSCLE_GROUPS.map(muscle => (
                <Card 
                  key={muscle} 
                  active={prefs.focusMuscles.includes(muscle)}
                  onClick={() => toggleFocus(muscle)}
                  className="py-4 !bg-slate-900/40 backdrop-blur-md"
                >
                  <span className="text-[10px] font-black text-white text-center block uppercase tracking-tighter">{muscle}</span>
                </Card>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className={animationClass}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-8">RESTRIÇÕES E<br/><span className="text-rose-500">SEGURANÇA</span></h2>
            <textarea 
              placeholder="Ex: Lesão no joelho esquerdo, dor lombar crônica..."
              value={prefs.restrictions}
              onChange={e => updatePrefs({ restrictions: e.target.value })}
              className="w-full bg-slate-900/40 backdrop-blur-xl border-2 border-white/5 rounded-[2.5rem] p-8 text-lg min-h-[220px] focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-bold text-white shadow-2xl"
            />
            <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
               <span className="text-lg">⚠️</span>
               <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-tight">A IA evitará exercícios que sobrecarreguem suas áreas sensíveis.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 relative overflow-hidden">
      
      {/* Imersão Visual: IA Generated Backgrounds */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out z-0 pointer-events-none"
        style={{
          backgroundImage: `url("${stepBackgrounds[currentStep] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop'}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isGeneratingImg ? 0.2 : 0.5,
          transform: isGeneratingImg ? 'scale(1.1)' : 'scale(1)',
          filter: isGeneratingImg ? 'blur(20px)' : 'none'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
      </div>

      {/* Progress Indicator */}
      <div className="relative z-50 px-8 pt-14">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Passo {currentStep + 1} de {STEPS.length}</span>
        </div>
        <div className="flex gap-2">
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-end">
            {isGeneratingImg && (
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                 <span className="w-1 h-1 rounded-full bg-slate-500" /> IA Sincronizando Visuais...
              </span>
            )}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 relative z-20 px-8 pt-10 pb-40 overflow-y-auto no-scrollbar">
        {renderStepContent()}
      </div>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex gap-4 z-[100]">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 h-16 !rounded-[1.5rem] uppercase tracking-widest text-[10px] font-black !border-white/10" 
            onClick={back}
          >
            Voltar
          </Button>
        )}
        <Button 
          variant="primary" 
          size="lg" 
          className={`h-16 !rounded-[1.5rem] uppercase tracking-[0.2em] text-[11px] italic font-black shadow-2xl shadow-indigo-600/40 ${currentStep === 0 ? 'w-full' : 'flex-[2]'}`}
          onClick={() => {
            if (currentStep === STEPS.length - 1) {
              onComplete(prefs);
            } else {
              next();
            }
          }}
        >
          {currentStep === STEPS.length - 1 ? 'GERAR TREINO IA ⚡' : 'CONTINUAR →'}
        </Button>
      </div>
    </div>
  );
};
