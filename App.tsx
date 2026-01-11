
import React, { useState, useEffect, useMemo } from 'react';
import { Onboarding } from './components/Onboarding';
import { WorkoutView } from './components/WorkoutView';
import { Settings } from './components/Settings';
import { HistoryView } from './components/HistoryView';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { UserPreferences, WorkoutPlan, WorkoutSession, UserProfile, LibraryExercise, Exercise, SetDetail } from './types';
import { generateWorkoutPlan } from './services/geminiService';
import { storageService } from './services/storageService';
import { DEFAULT_USER_PREFS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';

type View = 'auth' | 'dashboard' | 'onboarding' | 'workout' | 'settings' | 'history' | 'generating' | 'loading' | 'library';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_USER_PREFS);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [currentView, setCurrentView] = useState<View>('loading');
  const [returnView, setReturnView] = useState<View>('dashboard');
  const [activeWorkoutDayIdx, setActiveWorkoutDayIdx] = useState(0);

  const activePlan = useMemo(() => {
    if (!user?.activePlanId) return allPlans[0] || null;
    return allPlans.find(p => p.id === user.activePlanId) || allPlans[0] || null;
  }, [allPlans, user?.activePlanId]);

  const favoriteExercises = useMemo(() => {
    if (!user?.favoriteExerciseIds || !library.length) return [];
    return library.filter(ex => user.favoriteExerciseIds?.includes(ex.id));
  }, [user?.favoriteExerciseIds, library]);

  const loadUserData = async (userId: string, email: string) => {
    setCurrentView('loading');
    try {
      const profile = await storageService.getProfile(userId);
      const workouts = await storageService.getWorkouts(userId);
      const sessionHistory = await storageService.getHistory(userId);

      if (profile) {
        setUser({ ...profile, favoriteExerciseIds: profile.favoriteExerciseIds || [] });
        setPrefs(profile.preferences || DEFAULT_USER_PREFS);
        setAllPlans(workouts);
        setHistory(sessionHistory);
        
        // Define a aba de Treino como inicial se houver planos disponíveis
        if (workouts.length > 0) {
          setCurrentView('workout');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        const defaultUser: UserProfile = { 
          id: userId, 
          email,
          name: email.split('@')[0], 
          level: 1, 
          xp: 0, 
          metrics: { weight: 75, height: 175 }, 
          preferences: DEFAULT_USER_PREFS,
          favoriteExerciseIds: []
        };
        setUser(defaultUser);
        setPrefs(DEFAULT_USER_PREFS);
        setCurrentView('onboarding');
      }
    } catch (err) {
      console.error("Erro no carregamento:", err);
      setCurrentView('auth');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const libData = await storageService.getLibraryExercises();
      setLibrary(libData);
      
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await loadUserData(session.user.id, session.user.email!);
        else setCurrentView('auth');

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session) await loadUserData(session.user.id, session.user.email!);
          else {
            setCurrentView('auth');
            setUser(null);
          }
        });
      } else {
        // Fallback imediato para Guest Mode se Supabase não configurado
        await loadUserData('guest-user', 'offline@fitflow.ai');
      }
    };
    loadInitialData();
  }, []);

  const handleUpdatePlan = async (p: WorkoutPlan) => {
    if (!user) return;
    const updatedPlans = allPlans.map(item => item.id === p.id ? p : item);
    setAllPlans(updatedPlans);
    try {
      await storageService.saveWorkout(user.id, p);
    } catch (err) {
      console.error("Falha ao salvar treino:", err);
    }
  };

  const handleToggleFavorite = async (exerciseId: string) => {
    if (!user) return;
    const currentFavs = user.favoriteExerciseIds || [];
    const isFav = currentFavs.includes(exerciseId);
    const updatedFavs = isFav 
      ? currentFavs.filter(id => id !== exerciseId)
      : [...currentFavs, exerciseId];
    
    const updatedUser = { ...user, favoriteExerciseIds: updatedFavs };
    setUser(updatedUser);
    await storageService.saveProfile(user.id, updatedUser);
  };

  const handleAddExerciseToPlan = async (libEx: LibraryExercise) => {
    if (!user || !activePlan) {
      alert("Selecione ou crie um treino primeiro!");
      return;
    }

    const baseWeight = user.preferences?.gender === 'Feminino' ? "5kg" : "10kg";
    const sets = 3;
    const reps = "12";
    
    const setDetails: SetDetail[] = Array.from({ length: sets }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      weight: baseWeight,
      reps: reps,
      isCompleted: false
    }));

    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: libEx.name,
      englishName: libEx.english_name,
      muscleGroup: libEx.muscle_group,
      sets: sets,
      reps: reps,
      rest: 60,
      initialWeight: baseWeight,
      imageUrl: libEx.image_url || `https://loremflickr.com/800/600/gym,${encodeURIComponent(libEx.name)}/all`,
      executionTip: libEx.execution_tip,
      setDetails: setDetails
    };

    const updatedPlan = { ...activePlan };
    if (updatedPlan.days.length === 0) {
      updatedPlan.days.push({ label: 'Treino A', description: 'Personalizado', exercises: [] });
    }
    
    const targetIdx = Math.min(activeWorkoutDayIdx, updatedPlan.days.length - 1);
    updatedPlan.days[targetIdx].exercises.push(newExercise);

    await handleUpdatePlan(updatedPlan);
  };

  const handleOnboardingComplete = async (newPrefs: UserPreferences) => {
    if (!user) return;
    setCurrentView('generating');
    try {
      const newPlan = await generateWorkoutPlan(newPrefs);
      setAllPlans(prev => [...prev, newPlan]);
      const updatedUser = { ...user, preferences: newPrefs, activePlanId: newPlan.id };
      setUser(updatedUser);
      await storageService.saveWorkout(user.id, newPlan);
      await storageService.saveProfile(user.id, updatedUser);
      setCurrentView('workout'); // Vai direto para o treino gerado
    } catch (err) {
      console.error(err);
      setCurrentView('dashboard');
    }
  };

  const handleCreateEmptyPlan = async () => {
    if (!user) return;
    const newPlan: WorkoutPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Treino Manual ${allPlans.length + 1}`,
      isAI: false,
      createdAt: Date.now(),
      days: [{ label: 'Treino A', description: 'Personalize seu treino', exercises: [] }]
    };
    setAllPlans(prev => [...prev, newPlan]);
    const updatedUser = { ...user, activePlanId: newPlan.id };
    setUser(updatedUser);
    await storageService.saveWorkout(user.id, newPlan);
    await storageService.saveProfile(user.id, updatedUser);
    setCurrentView('workout');
  };

  const renderView = () => {
    switch (currentView) {
      case 'loading':
        return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 animate-view">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Carregando...</p>
          </div>
        );
      case 'auth':
        return <AuthView onAuth={() => setCurrentView('loading')} onEnterGuest={() => loadUserData('guest-user', 'offline@fitflow.ai')} />;
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'generating':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-slate-950 animate-view">
            <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(249,115,22,0.2)]" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🤖</div>
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase mb-2">GERANDO PLANO...</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">IA em ação</p>
          </div>
        );
      case 'dashboard':
        return user && (
          <DashboardView 
              user={user} sessions={history} plan={activePlan} allPlans={allPlans}
              favoriteExercises={favoriteExercises}
              onStartWorkout={() => setCurrentView(activePlan ? 'workout' : 'onboarding')}
              onOpenHistory={() => setCurrentView('history')}
              onOpenLibrary={() => { setReturnView('dashboard'); setCurrentView('library'); }}
              onOpenSettings={() => { setReturnView('dashboard'); setCurrentView('settings'); }}
              onSignOut={() => (isSupabaseConfigured() && supabase) ? supabase.auth.signOut() : setCurrentView('auth')}
              onSelectPlan={(id) => { setUser({...user, activePlanId: id}); storageService.saveProfile(user.id, {...user, activePlanId: id}); }}
              onDeletePlan={async (id) => { await storageService.deleteWorkout(user.id, id); setAllPlans(prev => prev.filter(p => p.id !== id)); }}
              onCreateEmptyPlan={handleCreateEmptyPlan}
              onUpdateMetrics={(m) => { const u = {...user, metrics: {...user.metrics, ...m}}; setUser(u); storageService.saveProfile(user.id, u); }}
              onUpdateUser={(up) => { const u = {...user, ...up}; setUser(u); storageService.saveProfile(user.id, u); }}
              onAddFavoriteExercise={handleAddExerciseToPlan}
          />
        );
      case 'workout':
        return activePlan && (
          <WorkoutView 
              plan={activePlan} userPrefs={prefs} onUpdate={handleUpdatePlan}
              onReset={() => setCurrentView('onboarding')}
              onOpenSettings={() => { setReturnView('workout'); setCurrentView('settings'); }}
              onOpenHistory={() => setCurrentView('history')}
              onFinishWorkout={async (s) => { setHistory(p => [s, ...p]); await storageService.saveSession(user!.id, s); setCurrentView('history'); }}
              onGoToDashboard={() => setCurrentView('dashboard')}
              onOpenLibrary={() => { setReturnView('workout'); setCurrentView('library'); }}
              onDayChange={setActiveWorkoutDayIdx}
              initialDayIdx={activeWorkoutDayIdx}
          />
        );
      case 'library':
        return (
          <ExerciseLibraryView 
            onBack={() => setCurrentView(returnView)} 
            onSelectExercise={handleAddExerciseToPlan} 
            activePlanName={activePlan?.name}
            favoriteIds={user?.favoriteExerciseIds || []}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case 'history':
        return <HistoryView sessions={history} onBack={() => setCurrentView('dashboard')} onClearHistory={() => { setHistory([]); storageService.clearHistory(user?.id); }} />;
      case 'settings':
        return <Settings initialPrefs={prefs} onCancel={() => setCurrentView(returnView)} onSave={(p, reg) => reg ? handleOnboardingComplete(p) : (setPrefs(p), setUser({...user!, preferences: p}), storageService.saveProfile(user!.id, {...user!, preferences: p}), setCurrentView(returnView))} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 relative overflow-hidden shadow-2xl">
      {renderView()}
    </div>
  );
};

export default App;
