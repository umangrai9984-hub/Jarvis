import { AppTheme, AppMode, EmotionalMode } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  label: string;
  dotColor: string;
  primaryHex: string;
  glowHex: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  ringColor: string;
  bgGrad: string;
}

export const THEME_CONFIGS: Record<AppTheme, ThemeConfig> = {
  neon_rose: {
    id: 'neon_rose',
    label: 'Neon Rose (Mina)',
    dotColor: 'bg-[#ff2d55]',
    primaryHex: '#ff2d55',
    glowHex: 'rgba(255,45,85,0.4)',
    accentBg: 'bg-[#ff2d55]',
    accentBorder: 'border-[#ff2d55]',
    accentText: 'text-[#ff2d55]',
    ringColor: 'border-[#ff2d5525]',
    bgGrad: 'from-[#ff2d55] to-[#ff375f]',
  },
  midnight_velvet: {
    id: 'midnight_velvet',
    label: 'Midnight Velvet',
    dotColor: 'bg-[#a855f7]',
    primaryHex: '#a855f7',
    glowHex: 'rgba(168,85,247,0.4)',
    accentBg: 'bg-[#a855f7]',
    accentBorder: 'border-[#a855f7]',
    accentText: 'text-[#a855f7]',
    ringColor: 'border-[#a855f725]',
    bgGrad: 'from-[#a855f7] to-[#9333ea]',
  },
  cyber_lavender: {
    id: 'cyber_lavender',
    label: 'Cyber Lavender',
    dotColor: 'bg-[#818cf8]',
    primaryHex: '#818cf8',
    glowHex: 'rgba(129,140,248,0.4)',
    accentBg: 'bg-[#818cf8]',
    accentBorder: 'border-[#818cf8]',
    accentText: 'text-[#818cf8]',
    ringColor: 'border-[#818cf825]',
    bgGrad: 'from-[#818cf8] to-[#6366f1]',
  },
  emerald_glow: {
    id: 'emerald_glow',
    label: 'Emerald Matrix',
    dotColor: 'bg-[#00ff9d]',
    primaryHex: '#00ff9d',
    glowHex: 'rgba(0,255,157,0.4)',
    accentBg: 'bg-[#00ff9d]',
    accentBorder: 'border-[#00ff9d]',
    accentText: 'text-[#00ff9d]',
    ringColor: 'border-[#00ff9d25]',
    bgGrad: 'from-[#00ff9d] to-[#059669]',
  },
  stark_arc: {
    id: 'stark_arc',
    label: 'Stark Arc Reactor',
    dotColor: 'bg-[#00e5ff]',
    primaryHex: '#00e5ff',
    glowHex: 'rgba(0,229,255,0.5)',
    accentBg: 'bg-[#00e5ff]',
    accentBorder: 'border-[#00e5ff]',
    accentText: 'text-[#00e5ff]',
    ringColor: 'border-[#00e5ff30]',
    bgGrad: 'from-[#00e5ff] to-[#0284c7]',
  },
};

export const EMOTIONAL_MODES: {
  id: EmotionalMode;
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  description: string;
  vibe: string;
}[] = [
  {
    id: 'sassy',
    title: 'Sassy',
    subtitle: 'Witty & Teasing',
    badge: '🔥 Sassy',
    accent: '#ff2d55',
    description: 'Playful banter, clever quips, witty roasts & charismatic close-friend charm.',
    vibe: 'Teasing & Flirty',
  },
  {
    id: 'supportive',
    title: 'Supportive',
    subtitle: 'Empathetic & Caring',
    badge: '💖 Supportive',
    accent: '#ec4899',
    description: 'Deeply compassionate, validating, gentle encouragement and emotional care.',
    vibe: 'Warm & Empathetic',
  },
  {
    id: 'professional',
    title: 'Professional',
    subtitle: 'Executive & Sharp',
    badge: '💼 Professional',
    accent: '#38bdf8',
    description: 'Polished executive consultant, ultra-concise summaries and analytical rigor.',
    vibe: 'Direct & Strategic',
  },
];
