
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, WorkoutPlan, WorkoutSession, LibraryExercise } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'fitflow_profile',
  WORKOUTS: 'fitflow_workouts_v2',
  HISTORY: 'fitflow_history',
};

// Imagem de fallback universal caso o link original falhe
export const EXERCISE_FALLBACK_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";

// Biblioteca de fallback com 3 exercícios por grupo muscular
const LIBRARY_SEED: LibraryExercise[] = [
  // PEITO
  { id: 'p1', name: 'Supino Reto com Barra', english_name: 'Barbell Bench Press', muscle_group: 'Peito', equipment: 'Barra', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha os escápulas retraídas e desça a barra até o meio do peito.' },
  { id: 'p2', name: 'Supino Inclinado com Halteres', english_name: 'Incline Dumbbell Press', muscle_group: 'Peito', equipment: 'Halteres', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop', execution_tip: 'Foco na parte superior do peitoral, incline o banco entre 30 e 45 graus.' },
  { id: 'p3', name: 'Crucifixo Máquina (Peck Deck)', english_name: 'Chest Fly', muscle_group: 'Peito', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha um leve arco nos cotovelos e sinta o alongamento do peito.' },
  
  // COSTAS
  { id: 'c1', name: 'Puxada Frontal Aberta', english_name: 'Lat Pulldown', muscle_group: 'Costas', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1603287611837-f2146f5de4e1?q=80&w=800&auto=format&fit=crop', execution_tip: 'Puxe a barra em direção ao peito, não atrás da nuca, focando nas dorsais.' },
  { id: 'c2', name: 'Remada Curvada com Barra', english_name: 'Bent Over Row', muscle_group: 'Costas', equipment: 'Barra', difficulty: 'Avançado', image_url: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha a coluna neutra e puxe a barra em direção ao umbigo.' },
  { id: 'c3', name: 'Barra Fixa', english_name: 'Pull-up', muscle_group: 'Costas', equipment: 'Peso do Corpo', difficulty: 'Avançado', image_url: 'https://images.unsplash.com/photo-1598971639058-aba3c39449d6?q=80&w=800&auto=format&fit=crop', execution_tip: 'Cruze as pernas e foque em levar o queixo acima da barra.' },

  // OMBROS
  { id: 'o1', name: 'Desenvolvimento com Halteres', english_name: 'Dumbbell Shoulder Press', muscle_group: 'Ombros', equipment: 'Halteres', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1541534741688-6078c64b5ec5?q=80&w=800&auto=format&fit=crop', execution_tip: 'Estenda os braços totalmente sem bater os halteres no topo.' },
  { id: 'o2', name: 'Elevação Lateral', english_name: 'Lateral Raise', muscle_group: 'Ombros', equipment: 'Halteres', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1591940742878-13aba4b7a35e?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha os braços levemente à frente da linha do corpo.' },
  { id: 'o3', name: 'Desenvolvimento Arnold', english_name: 'Arnold Press', muscle_group: 'Ombros', equipment: 'Halteres', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop', execution_tip: 'Rode os punhos durante o movimento para atingir todas as cabeças do deltoide.' },

  // BÍCEPS
  { id: 'b1', name: 'Rosca Direta com Barra W', english_name: 'EZ Bar Curl', muscle_group: 'Bíceps', equipment: 'Barra', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha os cotovelos colados ao corpo e evite balançar o tronco.' },
  { id: 'b2', name: 'Rosca Martelo', english_name: 'Hammer Curl', muscle_group: 'Bíceps', equipment: 'Halteres', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1590239068512-6367f8d3bd1d?q=80&w=800&auto=format&fit=crop', execution_tip: 'Pegada neutra (palmas viradas uma para a outra) para focar no braquial.' },
  { id: 'b3', name: 'Rosca Concentrada', english_name: 'Concentration Curl', muscle_group: 'Bíceps', equipment: 'Halteres', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1536922246289-88c42f957773?q=80&w=800&auto=format&fit=crop', execution_tip: 'Apoie o braço na parte interna da coxa para isolamento máximo.' },

  // TRÍCEPS
  { id: 't1', name: 'Tríceps Pulley (Corda)', english_name: 'Triceps Rope Pushdown', muscle_group: 'Tríceps', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1596333143323-094383c31671?q=80&w=800&auto=format&fit=crop', execution_tip: 'Abra a corda no final do movimento para contração máxima.' },
  { id: 't2', name: 'Tríceps Testa com Barra W', english_name: 'Skull Crusher', muscle_group: 'Tríceps', equipment: 'Barra', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?q=80&w=800&auto=format&fit=crop', execution_tip: 'Desça a barra em direção à testa mantendo os cotovelos paralelos.' },
  { id: 't3', name: 'Mergulho no Banco', english_name: 'Bench Dips', muscle_group: 'Tríceps', equipment: 'Peso do Corpo', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1598575435261-0c3dd4ed3015?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha as costas próximas ao banco durante toda a descida.' },

  // QUADRÍCEPS
  { id: 'q1', name: 'Agachamento Livre', english_name: 'Barbell Squat', muscle_group: 'Quadríceps', equipment: 'Barra', difficulty: 'Avançado', image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=800&auto=format&fit=crop', execution_tip: 'Desça até as coxas ficarem paralelas ao chão ou um pouco mais.' },
  { id: 'q2', name: 'Leg Press 45', english_name: 'Leg Press', muscle_group: 'Quadríceps', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1590439474864-3da7a95788d4?q=80&w=800&auto=format&fit=crop', execution_tip: 'Não estenda totalmente os joelhos (bloqueio) no topo do movimento.' },
  { id: 'q3', name: 'Cadeira Extensora', english_name: 'Leg Extension', muscle_group: 'Quadríceps', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1594737625785-a6bad33ff117?q=80&w=800&auto=format&fit=crop', execution_tip: 'Ajuste o rolo logo acima dos tornozelos e segure firme nos apoios.' },

  // POSTERIOR
  { id: 'ps1', name: 'Stiff com Barra', english_name: 'Stiff-Legged Deadlift', muscle_group: 'Posterior', equipment: 'Barra', difficulty: 'Avançado', image_url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha as pernas quase retas e a coluna totalmente neutra.' },
  { id: 'ps2', name: 'Cadeira Flexora', english_name: 'Seated Leg Curl', muscle_group: 'Posterior', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop', execution_tip: 'Ajuste o encosto para que seus joelhos fiquem alinhados com o eixo da máquina.' },
  { id: 'ps3', name: 'Mesa Flexora', english_name: 'Lying Leg Curl', muscle_group: 'Posterior', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha o quadril colado ao banco durante o movimento.' },

  // GLÚTEOS
  { id: 'gl1', name: 'Elevação Pélvica', english_name: 'Hip Thrust', muscle_group: 'Glúteos', equipment: 'Barra', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1590439474864-3da7a95788d4?q=80&w=800&auto=format&fit=crop', execution_tip: 'Contraia os glúteos no topo por 1-2 segundos.' },
  { id: 'gl2', name: 'Agachamento Sumô', english_name: 'Sumo Squat', muscle_group: 'Glúteos', equipment: 'Halteres', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1590239068512-6367f8d3bd1d?q=80&w=800&auto=format&fit=crop', execution_tip: 'Pés mais afastados que a largura dos ombros e pontas dos pés para fora.' },
  { id: 'gl3', name: 'Abdução de Quadril', english_name: 'Hip Abduction', muscle_group: 'Glúteos', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=800&auto=format&fit=crop', execution_tip: 'Foco no glúteo médio, mantenha o tronco firme.' },

  // PANTURRILHAS
  { id: 'pn1', name: 'Gêmeos em Pé', english_name: 'Standing Calf Raise', muscle_group: 'Panturrilhas', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop', execution_tip: 'Alongue bem no fundo e suba até a ponta máxima dos pés.' },
  { id: 'pn2', name: 'Gêmeos Sentado', english_name: 'Seated Calf Raise', muscle_group: 'Panturrilhas', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha um ritmo controlado, evitando o uso de impulso.' },
  { id: 'pn3', name: 'Panturrilha no Leg Press', english_name: 'Leg Press Calf Raise', muscle_group: 'Panturrilhas', equipment: 'Máquina', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1590439474864-3da7a95788d4?q=80&w=800&auto=format&fit=crop', execution_tip: 'Deixe apenas as pontas dos pés na plataforma.' },

  // ABDÔMEN
  { id: 'a1', name: 'Abdominal Supra (Solo)', english_name: 'Crunch', muscle_group: 'Abdômen', equipment: 'Peso do Corpo', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1594737625785-a6bad33ff117?q=80&w=800&auto=format&fit=crop', execution_tip: 'Tire apenas os ombros do chão, focando na contração do abdômen.' },
  { id: 'a2', name: 'Prancha Isométrica', english_name: 'Plank', muscle_group: 'Abdômen', equipment: 'Peso do Corpo', difficulty: 'Iniciante', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', execution_tip: 'Mantenha o corpo reto como uma prancha, sem deixar o quadril cair.' },
  { id: 'a3', name: 'Elevação de Pernas', english_name: 'Leg Raise', muscle_group: 'Abdômen', equipment: 'Peso do Corpo', difficulty: 'Intermediário', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', execution_tip: 'Desça as pernas lentamente sem encostar os calcanhares no chão.' }
];

// Função crucial para evitar o erro [object Object]
const formatError = (err: any): string => {
  if (!err) return "Erro desconhecido";
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.details) return err.details;
  return JSON.stringify(err);
};

export const storageService = {
  async getLibraryExercises(): Promise<LibraryExercise[]> {
    let exercises: LibraryExercise[] = [];
    
    // Tenta buscar do Supabase se estiver configurado
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          exercises = data;
        }
      } catch (err: any) {
        console.warn("Erro ao buscar biblioteca do banco, usando fallback local:", formatError(err));
      }
    }

    // Se a busca falhou ou retornou vazio, usa a semente local
    if (exercises.length === 0) {
      exercises = LIBRARY_SEED;
    }
    
    return exercises;
  },

  async getProfile(userId?: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured() && userId && userId !== 'guest-user') {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          const profile: UserProfile = {
            id: data.id,
            name: data.name || 'Atleta',
            email: data.email || '',
            birthDate: data.birth_date,
            avatar: data.avatar,
            level: data.level || 1,
            xp: data.xp || 0,
            metrics: data.metrics || { weight: 75, height: 175 },
            preferences: data.preferences,
            activePlanId: data.active_plan_id,
            favoriteExerciseIds: data.favorite_exercise_ids || []
          };
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
          return profile;
        }
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", formatError(err));
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return local ? JSON.parse(local) : null;
  },

  async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    if (isSupabaseConfigured() && userId !== 'guest-user') {
      try {
        const payload = {
          id: userId,
          name: profile.name,
          email: profile.email,
          birth_date: profile.birthDate,
          avatar: profile.avatar,
          level: profile.level,
          xp: profile.xp,
          metrics: profile.metrics,
          preferences: profile.preferences,
          active_plan_id: profile.activePlanId,
          favorite_exercise_ids: profile.favoriteExerciseIds,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (error) throw error;
      } catch (err: any) {
        const msg = formatError(err);
        console.error("Erro detalhado ao salvar perfil:", msg);
        throw new Error(msg);
      }
    }
  },

  async getWorkouts(userId?: string): Promise<WorkoutPlan[]> {
    if (isSupabaseConfigured() && userId && userId !== 'guest-user') {
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) {
          const plans = data.map((d: any) => d.plan_data);
          localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(plans));
          return plans;
        }
      } catch (err: any) {
        console.warn("Erro ao buscar treinos:", formatError(err));
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return local ? JSON.parse(local) : [];
  },

  async saveWorkout(userId: string, plan: WorkoutPlan): Promise<void> {
    const plans = await this.getWorkouts(userId);
    const index = plans.findIndex(p => p.id === plan.id);
    const updatedPlans = [...plans];
    if (index >= 0) updatedPlans[index] = plan;
    else updatedPlans.push(plan);
    
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedPlans));

    if (isSupabaseConfigured() && userId !== 'guest-user') {
      try {
        const payload = { 
          id: plan.id,
          user_id: userId, 
          plan_data: plan, 
          created_at: new Date(plan.createdAt || Date.now()).toISOString() 
        };

        const { error } = await supabase
          .from('workout_plans')
          .upsert(payload, { onConflict: 'id' });

        if (error) throw error;
      } catch (err: any) {
        const msg = formatError(err);
        console.error("Erro detalhado ao salvar treino:", msg);
        throw new Error(msg);
      }
    }
  },

  async deleteWorkout(userId: string, planId: string): Promise<void> {
    const plans = await this.getWorkouts(userId);
    const updated = plans.filter(p => p.id !== planId);
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updated));

    if (isSupabaseConfigured() && userId !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('workout_plans')
          .delete()
          .eq('id', planId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (err: any) {
        console.error("Erro ao deletar treino:", formatError(err));
      }
    }
  },

  async getHistory(userId?: string): Promise<WorkoutSession[]> {
    if (isSupabaseConfigured() && userId && userId !== 'guest-user') {
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        if (data) {
          const history = data.map((d: any) => d.session_data);
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
          return history;
        }
      } catch (err: any) {
        console.warn("Erro ao buscar histórico:", formatError(err));
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return local ? JSON.parse(local) : [];
  },

  async saveSession(userId: string, session: WorkoutSession): Promise<void> {
    const history = await this.getHistory(userId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([session, ...history]));

    if (isSupabaseConfigured() && userId !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('workout_sessions')
          .insert({ 
            user_id: userId, 
            date: session.date, 
            session_data: session 
          });
        
        if (error) throw error;
      } catch (err: any) {
        console.error("Erro ao salvar sessão:", formatError(err));
      }
    }
  },

  async clearHistory(userId?: string): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    if (isSupabaseConfigured() && userId && userId !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('workout_sessions')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (err: any) {
        console.error("Erro ao limpar histórico:", formatError(err));
      }
    }
  }
};
