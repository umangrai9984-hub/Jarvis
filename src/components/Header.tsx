import { ConnectionStatus, AppTheme, AppMode, EmotionalMode, StarkClearanceState } from '../types';
import { Palette, VolumeX, Volume2, Shield, Bot, Flame, Copy, Check, PhoneCall, Key, ShieldCheck, Sparkles, Smartphone, Download } from 'lucide-react';
import { THEME_CONFIGS } from '../utils/theme';
import { useState } from 'react';

interface HeaderProps {
  status: ConnectionStatus;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  appMode: AppMode;
  onSelectAppMode: (mode: AppMode) => void;
  emotionalMode: EmotionalMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCallModal: () => void;
  onOpenAccessGate: () => void;
  onOpenApkModal: () => void;
  starkClearance: StarkClearanceState | null;
}

export function Header({
  status,
  theme,
  setTheme,
  appMode,
  onSelectAppMode,
  emotionalMode,
  isMuted,
  onToggleMute,
  onOpenCallModal,
  onOpenAccessGate,
  onOpenApkModal,
  starkClearance,
}: HeaderProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.neon_rose;
  const isJarvis = appMode === 'jarvis';

  const themes: { id: AppTheme; label: string; dotColor: string }[] = [
    { id: 'neon_rose', label: 'Neon Rose (Mina)', dotColor: 'bg-[#ff2d55]' },
    { id: 'midnight_velvet', label: 'Midnight Velvet', dotColor: 'bg-[#a855f7]' },
    { id: 'cyber_lavender', label: 'Cyber Lavender', dotColor: 'bg-[#818cf8]' },
    { id: 'emerald_glow', label: 'Emerald Matrix', dotColor: 'bg-[#00ff9d]' },
    { id: 'stark_arc', label: 'Stark Arc Reactor', dotColor: 'bg-[#00e5ff]' },
  ];

  const handleCopyJarvisUrl = () => {
    const jarvisUrl = `${window.location.origin}/jarvis`;
    navigator.clipboard.writeText(jarvisUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <header
      id="main-app-header"
      className={`w-full border-b transition-colors duration-300 sticky top-0 z-50 px-4 sm:px-8 py-3.5 sm:py-4 ${
        isJarvis
          ? 'bg-[#060b13]/95 border-[#00e5ff25] backdrop-blur-md'
          : 'bg-[#0f0f12]/95 border-[#ffffff10] backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand, Mode Switcher & Owner Attribution */}
        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                isJarvis
                  ? 'bg-gradient-to-tr from-[#00e5ff] to-[#0284c7] shadow-[0_0_25px_rgba(0,229,255,0.6)]'
                  : 'bg-gradient-to-tr from-[#ff2d55] to-[#ff375f] shadow-[0_0_20px_rgba(255,45,85,0.4)]'
              }`}
            >
              {isJarvis ? (
                <Shield className="w-5 h-5 text-black font-black" />
              ) : (
                <span className="text-white font-bold text-lg leading-none">U</span>
              )}
            </div>

            {/* Title & Owner Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  {isJarvis ? 'J.A.R.V.I.S. AI' : 'UMNG Assistant'}
                </span>
                {/* Owner Tag */}
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#ffffff10] text-[#00ff9d] border border-[#00ff9d]/30">
                  Owner: Umang Rai
                </span>
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
                }`}
              >
                {isJarvis
                  ? 'British Tactical Voice • Mark Protocol'
                  : `${emotionalMode.toUpperCase()} Mode • Gemini 3.1 Live`}
              </span>
            </div>
          </div>

          {/* Mode Switcher Pills (UMNG vs JARVIS) */}
          <div className="flex items-center bg-[#15151c] p-1 rounded-xl border border-[#ffffff10] shadow-inner">
            <button
              id="btn-switch-umng"
              onClick={() => onSelectAppMode('umng')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                !isJarvis
                  ? 'bg-[#ff2d55] text-white shadow-[0_0_12px_rgba(255,45,85,0.4)]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>UMNG</span>
            </button>
            <button
              id="btn-switch-jarvis"
              onClick={() => onSelectAppMode('jarvis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                isJarvis
                  ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.5)] font-black'
                  : 'text-[#888] hover:text-[#00e5ff]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>J.A.R.V.I.S.</span>
            </button>
          </div>
        </div>

        {/* Right: Holographic Call Button, Download APK, Firebase Key Badge, URL Route Badge, Connection Status, Mute & Theme */}
        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2.5 sm:gap-3">
          {/* Download APK / ZIP Button */}
          <button
            id="btn-open-apk-download"
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 bg-[#ffffff0a] hover:bg-[#ffffff15] text-white border border-[#ffffff15] hover:border-emerald-500/50 shadow-sm"
            title="Download J.A.R.V.I.S. & UMNG AI (ZIP & APK)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download ZIP / APK</span>
          </button>

          {/* Holographic Call Matrix Button */}
          <button
            id="btn-open-holographic-call"
            onClick={onOpenCallModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              isJarvis
                ? 'bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'bg-[#ff2d55]/15 hover:bg-[#ff2d55]/25 text-[#ff2d55] border border-[#ff2d55]/40'
            }`}
            title="Open Holographic Calling Matrix"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>Call Anyone</span>
          </button>

          {/* Stark Access Clearance Key Status / Gate Trigger */}
          <button
            id="btn-open-stark-key-gate"
            onClick={onOpenAccessGate}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border ${
              starkClearance?.isGranted
                ? 'bg-[#00ff9d]/15 border-[#00ff9d]/40 text-[#00ff9d]'
                : 'bg-[#0a1e38] border-[#00e5ff40] text-[#00e5ff] hover:bg-[#00e5ff]/20'
            }`}
            title="Stark Security Access Clearance (Firebase Synced)"
          >
            {starkClearance?.isGranted ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00ff9d]" />
                <span className="hidden sm:inline">Access: Granted</span>
                <span className="sm:hidden">Key: OK</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>Clearance Key</span>
              </>
            )}
          </button>

          {/* Direct Route /jarvis Share Pill */}
          <button
            id="btn-copy-jarvis-url"
            onClick={handleCopyJarvisUrl}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141d] border border-[#ffffff10] hover:border-[#00e5ff]/50 text-[#aaa] hover:text-white text-[11px] font-mono cursor-pointer transition-colors"
            title="Direct link for Jarvis mode (/jarvis)"
          >
            <span className="text-[#00e5ff] font-bold">URL:</span>
            <span>{isJarvis ? '/jarvis' : '/'}</span>
            {copiedUrl ? (
              <Check className="w-3 h-3 text-[#00ff9d]" />
            ) : (
              <Copy className="w-3 h-3 text-[#666]" />
            )}
          </button>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14141d] border border-[#ffffff08]">
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
              className={`text-xs font-semibold uppercase tracking-wider ${
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
                ? isJarvis ? 'Fenrir Voice Live' : 'Aoede Voice Live'
                : status === 'connecting'
                ? 'Connecting...'
                : status === 'error'
                ? 'Error'
                : 'Ready'}
            </span>
          </div>

          {/* Quick Mute Button */}
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

          {/* Theme Dropdown */}
          <div className="relative group">
            <button
              id="theme-selector-button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1f] border border-[#ffffff10] hover:border-[#ff2d55]/50 text-[#ccc] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              title="Change Mood Accent"
            >
              <Palette className={`w-3.5 h-3.5 ${isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'}`} />
              <span className="hidden sm:inline">Theme</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[#0f0f14] border border-[#ffffff15] rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#666] px-3 py-1.5">
                Visual Accent
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



