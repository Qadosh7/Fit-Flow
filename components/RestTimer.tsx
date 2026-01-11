
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface RestTimerProps {
  initialSeconds: number;
  onClose: () => void;
  onAdjustRest?: (newBaseSeconds: number) => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds, onClose, onAdjustRest }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [baseSeconds, setBaseSeconds] = useState(initialSeconds);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio feedback failed", e);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      playBeep();
      const timeout = setTimeout(onClose, 800);
      return () => clearTimeout(timeout);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  const addTime = (seconds: number) => {
    const newTime = Math.max(0, timeLeft + seconds);
    const newBase = Math.max(0, baseSeconds + seconds);
    
    setTimeLeft(newTime);
    setBaseSeconds(newBase);
    
    // Salva a nova preferência de descanso para o exercício
    if (onAdjustRest) {
      onAdjustRest(newBase);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / Math.max(1, baseSeconds)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-6 pb-10 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/30 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 flex flex-col items-center transform animate-in slide-in-from-bottom-10 duration-500">
        
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="currentColor" 
                    className="text-slate-800" strokeWidth="8"
                />
                <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="currentColor" 
                    className="text-indigo-500 transition-all duration-1000" 
                    strokeWidth="8"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * progress) / 100}
                    strokeLinecap="round"
                />
            </svg>
            <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white tabular-nums">
                    {formatTime(Math.max(0, timeLeft))}
                </span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    Base: {baseSeconds}s
                </span>
            </div>
        </div>

        <h3 className="text-indigo-400 font-black uppercase tracking-widest text-sm mb-6">Tempo de Descanso</h3>

        <div className="grid grid-cols-2 gap-3 mb-8 w-full">
            <Button variant="secondary" className="rounded-xl py-2.5 text-xs" onClick={() => addTime(-15)}>-15s</Button>
            <Button variant="secondary" className="rounded-xl py-2.5 text-xs" onClick={() => addTime(15)}>+15s</Button>
            <Button variant="secondary" className="rounded-xl py-2.5 text-xs" onClick={() => addTime(-30)}>-30s</Button>
            <Button variant="secondary" className="rounded-xl py-2.5 text-xs" onClick={() => addTime(30)}>+30s</Button>
        </div>

        <div className="w-full space-y-3">
          <Button variant="danger" size="lg" className="w-full rounded-2xl h-14 uppercase tracking-widest text-xs" onClick={onClose}>
            {timeLeft <= 0 ? 'CONCLUÍDO' : 'PULAR DESCANSO'}
          </Button>
          <p className="text-[8px] text-slate-600 text-center uppercase font-black tracking-[0.15em]">Ajustes feitos aqui salvam seu novo tempo base</p>
        </div>
      </div>
    </div>
  );
};
