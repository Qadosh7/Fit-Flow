
import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { supabase, checkSupabaseConfig } from '../lib/supabase';

interface AuthViewProps {
  onAuth: () => void;
  onEnterGuest: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuth, onEnterGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'dev' | 'user' } | null>(null);

  const isConfigured = checkSupabaseConfig();

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError({ message: "Insira seu e-mail para recuperar a senha.", type: 'user' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Serviço de autenticação indisponível.");
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin 
      });
      if (error) throw error;
      alert("E-mail de recuperação enviado!");
    } catch (err: any) {
      setError({ message: err.message || "Erro ao recuperar senha.", type: 'user' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || !supabase) {
      setError({ message: "Acesso direto indisponível no momento. Use o Modo Offline abaixo.", type: 'user' });
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        alert("Verifique seu e-mail para confirmar a conta!");
      }
      onAuth();
    } catch (err: any) {
      setError({ message: err.message || "Erro na autenticação.", type: 'user' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isConfigured || !supabase) {
      setError({ message: "Login social indisponível. Use o Modo Offline.", type: 'user' });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err: any) {
      setError({ message: err.message || "Falha ao conectar com Google.", type: 'user' });
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm";

  return (
    <div className="min-h-screen flex flex-col justify-center px-8 py-12 bg-slate-950">
      <div className="mb-12 text-center animate-view">
        <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">
          FITFLOW <span className="text-indigo-500">AI</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">A Evolução é Implacável</p>
      </div>

      <Card className="bg-white/95 backdrop-blur-xl border-slate-200 p-8 shadow-2xl relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight italic">
          {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
        </h2>

        {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-[10px] font-black uppercase text-rose-500 tracking-widest leading-relaxed">
                {error.message}
            </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-[14px]">Entrar com Google</span>
        </button>

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">ou acesso direto</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder="Nome Completo"
            />
          )}
          <input 
            type="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            className={inputClass}
            placeholder="E-mail"
          />
          <div className="space-y-2">
            <input 
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Senha"
            />
            {isLogin && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}
          </div>
          
          <Button type="submit" size="lg" isLoading={loading} className="w-full mt-2 !rounded-2xl h-14 uppercase tracking-widest text-[9px] italic font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
            {isLogin ? 'ENTRAR NA PLATAFORMA' : 'CRIAR MINHA CONTA'}
          </Button>
          
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(null); }} 
            className="w-full text-[10px] font-black text-slate-500 mt-4 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já possui conta? Entre aqui'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onEnterGuest(); }}
            className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest py-3 border border-emerald-500/20 rounded-xl hover:bg-emerald-50 transition-all active:scale-95"
          >
            Entrar no Modo Offline (Guest) 🚀
          </button>
        </div>
      </Card>
    </div>
  );
};
