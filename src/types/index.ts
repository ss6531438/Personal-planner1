export type EnergyLevel = 'deep' | 'admin' | 'rest' | 'routine';

export type TaskStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface TaskBlock {
  id: string;
  title: string;
  durationMinutes: number;
  startTime: string; // ISO string e.g. "2026-09-29T10:00:00.000Z"
  endTime: string;   // ISO string e.g. "2026-09-29T10:45:00.000Z"
  energyLevel: EnergyLevel;
  status: TaskStatus;
  notes?: string;
  actualDurationMinutes?: number;
  completedAt?: string;
}

export interface DayTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name or emoji
  blocks: {
    title: string;
    durationMinutes: number;
    energyLevel: EnergyLevel;
    notes?: string;
  }[];
}

export type AudioNoiseType =
  | 'none'
  | 'brown'
  | 'white'
  | 'rain'
  | 'binaural'
  | 'ocean'
  | 'campfire'
  | 'stream'
  | 'zen-bowl'
  | 'birds';

export type TickingSoundType =
  | 'none'
  | 'antique-pendulum'
  | 'pocket-watch'
  | 'antique-wooden'
  | 'chronometer'
  | 'soft-tick';

export type AnalogClockStyle =
  | 'grandfather'
  | 'pocket-watch'
  | 'steampunk'
  | 'art-deco'
  | 'chronometer'
  | 'modern';

export type SecondsHandMode = 'tick' | 'smooth' | 'subdial' | 'none';

export type NumeralsStyle = 'roman' | 'arabic' | 'hash';

export type ClockColorPreset =
  | 'brass-ivory'
  | 'bronze-obsidian'
  | 'copper-emerald'
  | 'navy-brass'
  | 'silver-pearl'
  | 'steampunk-amber'
  | 'custom';

export interface ClockCustomColors {
  dialBg: string;
  bezel: string;
  hands: string;
  secondsHand: string;
  accent: string;
  numerals: string;
}

export const CLOCK_COLOR_PRESETS: Record<
  ClockColorPreset,
  { name: string; colors: ClockCustomColors }
> = {
  'brass-ivory': {
    name: 'Antique Brass & Ivory',
    colors: {
      dialBg: '#0f172a',
      bezel: '#b45309',
      hands: '#f59e0b',
      secondsHand: '#ef4444',
      accent: '#8b5cf6',
      numerals: '#fde68a',
    },
  },
  'bronze-obsidian': {
    name: 'Victorian Bronze & Obsidian',
    colors: {
      dialBg: '#070a13',
      bezel: '#92400e',
      hands: '#fbbf24',
      secondsHand: '#f43f5e',
      accent: '#ec4899',
      numerals: '#fef08a',
    },
  },
  'copper-emerald': {
    name: 'Aged Copper & Malachite',
    colors: {
      dialBg: '#06281e',
      bezel: '#c2410c',
      hands: '#34d399',
      secondsHand: '#fbbf24',
      accent: '#10b981',
      numerals: '#a7f3d0',
    },
  },
  'navy-brass': {
    name: 'Naval Chronometer Blue',
    colors: {
      dialBg: '#0a192f',
      bezel: '#eab308',
      hands: '#38bdf8',
      secondsHand: '#fb923c',
      accent: '#0ea5e9',
      numerals: '#bae6fd',
    },
  },
  'silver-pearl': {
    name: 'Antique Sterling Silver',
    colors: {
      dialBg: '#0f172a',
      bezel: '#94a3b8',
      hands: '#e2e8f0',
      secondsHand: '#38bdf8',
      accent: '#818cf8',
      numerals: '#f8fafc',
    },
  },
  'steampunk-amber': {
    name: 'Steampunk Escapement',
    colors: {
      dialBg: '#18120b',
      bezel: '#78350f',
      hands: '#f59e0b',
      secondsHand: '#dc2626',
      accent: '#ea580c',
      numerals: '#fed7aa',
    },
  },
  custom: {
    name: 'Custom Atelier Palette',
    colors: {
      dialBg: '#0b1120',
      bezel: '#b45309',
      hands: '#f59e0b',
      secondsHand: '#ef4444',
      accent: '#8b5cf6',
      numerals: '#fde68a',
    },
  },
};

export type TimerDisplayMode = 'analog' | 'radial' | 'dual';

export interface PlannerSettings {
  autoChime: boolean;
  chimeVolume: number;
  ambientType: AudioNoiseType;
  ambientVolume: number;
  defaultTaskDuration: number;
  defaultEnergyLevel: EnergyLevel;
  theme: 'dark';
  // Antique Analog Clock & Ticking Sound Configurations
  timerDisplayMode: TimerDisplayMode;
  clockStyle: AnalogClockStyle;
  secondsHandMode: SecondsHandMode;
  numeralsStyle: NumeralsStyle;
  clockColorPreset: ClockColorPreset;
  clockCustomColors: ClockCustomColors;
  clockHandsMode: 'realtime' | 'countdown';
  tickingSound: TickingSoundType;
  tickingVolume: number;
  tickingOnlyWhileRunning: boolean;
  showPendulum: boolean;
  showGears: boolean;
}

export interface EnergyConfig {
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  textAccent: string;
  icon: string;
  description: string;
}

export const ENERGY_CONFIG: Record<EnergyLevel, EnergyConfig> = {
  deep: {
    label: 'Deep Focus',
    color: '#8b5cf6', // Violet
    bgLight: 'rgba(139, 92, 246, 0.12)',
    borderLight: 'rgba(139, 92, 246, 0.35)',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    textAccent: 'text-violet-400',
    icon: 'Sparkles',
    description: 'High energy, complex creative work & coding',
  },
  admin: {
    label: 'Shallow / Admin',
    color: '#f59e0b', // Amber
    bgLight: 'rgba(245, 158, 11, 0.12)',
    borderLight: 'rgba(245, 158, 11, 0.35)',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textAccent: 'text-amber-400',
    icon: 'FileText',
    description: 'Emails, planning, quick calls & logistics',
  },
  rest: {
    label: 'Recharge / Rest',
    color: '#10b981', // Emerald
    bgLight: 'rgba(16, 185, 129, 0.12)',
    borderLight: 'rgba(16, 185, 129, 0.35)',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    textAccent: 'text-emerald-400',
    icon: 'Coffee',
    description: 'Break, walk, meal, stretching & mind reset',
  },
  routine: {
    label: 'Routine / Chores',
    color: '#0ea5e9', // Sky Cyan
    bgLight: 'rgba(14, 165, 233, 0.12)',
    borderLight: 'rgba(14, 165, 233, 0.35)',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    textAccent: 'text-sky-400',
    icon: 'CheckCircle2',
    description: 'Daily habits, household tasks & organization',
  },
};
