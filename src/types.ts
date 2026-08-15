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

export type AppTheme = 'neon_rose' | 'midnight_velvet' | 'cyber_lavender' | 'emerald_glow';
