
export enum ExperienceLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum Goal {
  HYPERTROPHY = 'Hipertrofia',
  FAT_LOSS = 'Emagrecimento',
  STRENGTH = 'Força',
  CONDITIONING = 'Condicionamento'
}

export enum EquipmentPreference {
  MACHINES = 'Máquinas',
  FREE_WEIGHTS = 'Pesos Livres',
  BOTH = 'Ambos'
}

export interface UserPreferences {
  age: string;
  gender: string;
  experienceLevel: ExperienceLevel;
  sessionDuration: number; // minutes
  weeklyFrequency: number;
  equipment: EquipmentPreference;
  goal: Goal;
  focusMuscles: string[];
  restrictions: string;
}

export interface SetDetail {
  id: string;
  weight: string;
  reps: string;
  isCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  englishName: string; 
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: number;
  initialWeight: string;
  imageUrl?: string;
  executionTip: string; 
  notes?: string;
  setDetails: SetDetail[];
}

export interface LibraryExercise {
  id: string;
  name: string;
  english_name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  image_url: string;
  execution_tip: string;
}

export interface WorkoutDay {
  label: string;
  description: string;
  warmup?: Exercise[];
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string; 
  isAI: boolean; 
  createdAt: number;
  days: WorkoutDay[];
}

export interface ExerciseLog {
  name: string;
  englishName: string;
  maxWeight: number;
  volume: number;
}

export interface WorkoutSession {
  id: string;
  date: number;
  dayLabel: string;
  dayDescription: string;
  totalSets: number;
  completedSets: number;
  exerciseCount: number;
  totalVolume: number;
  exerciseLogs: ExerciseLog[];
}

export interface BodyMetrics {
  weight: number;
  height: number;
  chest?: number;
  waist?: number;
  hips?: number;
  armL?: number;
  armR?: number;
  thighL?: number;
  thighR?: number;
  lastUpdated?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthDate?: string; 
  avatar?: string;
  level: number;
  xp: number;
  metrics: BodyMetrics;
  preferences?: UserPreferences;
  evolutionPhotos?: string[]; 
  activePlanId?: string; 
  favoriteExerciseIds?: string[]; // Lista personalizada de IDs da biblioteca
}
