
import { Goal, ExperienceLevel, EquipmentPreference } from './types';

export const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilhas', 'Abdômen'
];

export const GOALS = Object.values(Goal);
export const LEVELS = Object.values(ExperienceLevel);
export const EQUIPMENTS = Object.values(EquipmentPreference);

export const DESCRIPTIONS = {
  levels: {
    [ExperienceLevel.BEGINNER]: 'Menos de 6 meses de treino ou voltando agora.',
    [ExperienceLevel.INTERMEDIATE]: '6 meses a 2 anos de treino consistente.',
    [ExperienceLevel.ADVANCED]: 'Mais de 2 anos com técnica sólida e intensidade.'
  },
  goals: {
    [Goal.HYPERTROPHY]: 'Foco em ganho de massa muscular e volume.',
    [Goal.FAT_LOSS]: 'Foco em déficit calórico e definição muscular.',
    [Goal.STRENGTH]: 'Foco em progressão de carga e força bruta.',
    [Goal.CONDITIONING]: 'Foco em resistência e saúde cardiovascular.'
  },
  equipments: {
    [EquipmentPreference.MACHINES]: 'Apenas aparelhos guiados (ideal para iniciantes).',
    [EquipmentPreference.FREE_WEIGHTS]: 'Halteres e barras (exige mais estabilização).',
    [EquipmentPreference.BOTH]: 'Mix completo para máxima versatilidade.'
  },
  gender: {
    'Masculino': 'Fisiologia e perfil hormonal masculino.',
    'Feminino': 'Fisiologia e perfil hormonal feminino.'
  }
};

export const AGE_RANGES = [
  'Menos de 12',
  '13-16',
  '17-20',
  '21-24',
  '25-34',
  '35-40',
  '41-44',
  '45-50',
  '51-55',
  '55+'
];

export const DEFAULT_USER_PREFS = {
  age: '45-50',
  gender: 'Masculino',
  experienceLevel: ExperienceLevel.INTERMEDIATE,
  sessionDuration: 60,
  weeklyFrequency: 4,
  equipment: EquipmentPreference.BOTH,
  goal: Goal.HYPERTROPHY,
  focusMuscles: ['Peito', 'Bíceps', 'Quadríceps', 'Posterior'],
  restrictions: ''
};
