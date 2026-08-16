export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export type AssistantState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'tool_executing';

export interface ToolCallItem {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: Date;
  status: 'executed' | 'pending';
  resultDescription?: string;
}

export interface TranscriptItem {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isFinal?: boolean;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface QuickNote {
  id: string;
  text: string;
  timestamp: Date;
}

export type EmotionalMode = 'sassy' | 'supportive' | 'professional';

export type AppMode = 'umng' | 'jarvis';

export type AppTheme = 'neon_rose' | 'midnight_velvet' | 'cyber_lavender' | 'emerald_glow' | 'stark_arc';

export interface CreatorSocials {
  name: string;
  instagram: { handle: string; url: string };
  discord: { handle: string; tag: string };
  youtube: { handle: string; url: string };
}

export interface CallContact {
  id: string;
  name: string;
  roleOrTitle: string;
  handleOrNumber: string;
  category: 'core' | 'avengers' | 'vip' | 'custom';
  avatarGradient: string;
  status: 'online' | 'busy' | 'encrypted';
  isFavorite?: boolean;
}

export type CallStage = 'idle' | 'dialing' | 'connected' | 'ended';

export interface HolographicCallSession {
  id: string;
  contact: CallContact;
  stage: CallStage;
  startTime?: Date;
  durationSeconds: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  satelliteLatencyMs: number;
  aiDialogueSnippet?: string;
}

export interface StarkClearanceState {
  isGranted: boolean;
  activeKey: string;
  clearanceLevel: string;
  keyLabel: string;
  grantedAt?: string;
}
