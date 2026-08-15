import { ConnectionStatus, AppTheme } from '../types';
import { Palette, VolumeX, Volume2, Sparkles } from 'lucide-react';

interface HeaderProps {
  status: ConnectionStatus;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function Header({
  status,
  theme,
  setTheme,
  isMuted,
  onToggleMute,
}: HeaderProps) {
  const themes: { id: AppTheme; label: string; dotColor: string }[] = [
    { id: 'neon_rose', label: 'Neon Rose (Default)', dotColor: 'bg-[#ff2d55]' },
    { id: 'midnight_velvet', label: 'Midnight Velvet', dotColor: 'bg-[#a855f7]' },
    { id: 'cyber_lavender', label: 'Cyber Lavender', dotColor: 'bg-[#818cf8]' },
    { id: 'emerald_glow', label: 'Emerald Glow', dotColor: 'bg-[#00ff9d]' },
  ];

  return (
    <header
      id="main-app-header"
      className="w-full border-b border-[#ffffff10] bg-[#0f0f12] sticky top-0 z-50 px-6 sm:px-8 py-4 sm:py-5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#ff2d55] to-[#ff375f] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,45,85,0.4)] shrink-0">
            <span className="text-white font-bold text-xl leading-none">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
              UMNG Assistant
            </span>
            <span className="text-[10px] text-[#ff2d55] font-black uppercase tracking-[0.2em]">
              Mina Persona v3.1
            </span>
          </div>
        </div>

        {/* Status Indicators & Rate Badges */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Connection Status */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-[11px] text-[#888] uppercase tracking-widest hidden xs:inline">
              Connection Status
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]'
                    : status === 'connecting'
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'
                    : status === 'error'
                    ? 'bg-[#ff2d55] shadow-[0_0_8px_#ff2d55]'
                    : 'bg-[#555]'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  status === 'connected'
                    ? 'text-[#00ff9d]'
                    : status === 'connecting'
                    ? 'text-amber-400'
                    : status === 'error'
                    ? 'text-[#ff2d55]'
                    : 'text-[#888]'
                }`}
              >
                {status === 'connected'
                  ? 'Gemini Live Active'
                  : status === 'connecting'
                  ? 'Connecting...'
                  : status === 'error'
                  ? 'Error'
                  : 'Ready'}
              </span>
            </div>
          </div>

          <div className="hidden md:block h-7 w-[1px] bg-[#ffffff10]" />

          {/* Audio Spec Pills */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="px-3 py-1 bg-[#1a1a1f] border border-[#ffffff10] rounded text-[10px] uppercase font-bold text-[#888] tracking-wider">
              24kHz Out
            </div>
            <div className="px-3 py-1 bg-[#1a1a1f] border border-[#ffffff10] rounded text-[10px] uppercase font-bold text-[#888] tracking-wider">
              16kHz In
            </div>
          </div>

          {/* Mute Button */}
          <button
            id="btn-quick-mute"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`p-2 sm:p-2.5 rounded-full border transition-all cursor-pointer ${
              isMuted
                ? 'bg-[#ff2d55]/15 border-[#ff2d55]/60 text-[#ff2d55] hover:bg-[#ff2d55]/25 shadow-[0_0_12px_rgba(255,45,85,0.2)]'
                : 'bg-[#1a1a1f] border-[#ffffff10] text-[#888] hover:text-white hover:border-[#ff2d55]/40'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Dropdown / Mood Selector */}
          <div className="relative group">
            <button
              id="theme-selector-button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1f] border border-[#ffffff10] hover:border-[#ff2d55]/50 text-[#ccc] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              title="Change Mood Accent"
            >
              <Palette className="w-3.5 h-3.5 text-[#ff2d55]" />
              <span className="hidden sm:inline">Theme</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[#0f0f14] border border-[#ffffff15] rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#666] px-3 py-1.5">
                Aesthetic Accent
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  id={`theme-option-${t.id}`}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    theme === t.id
                      ? 'bg-[#ffffff10] text-white font-bold'
                      : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${t.dotColor}`} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

