import React from 'react';
import { ConnectionStatus, AssistantState, AppTheme, AppMode, EmotionalMode } from '../types';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Hand,
  Volume2,
  Flame,
  HeartHandshake,
  Briefcase,
  Shield,
  Bot,
  Crown,
  Sparkles,
} from 'lucide-react';
import { EMOTIONAL_MODES, THEME_CONFIGS } from '../utils/theme';

interface ControlsProps {
  status: ConnectionStatus;
  assistantState: AssistantState;
  isMuted: boolean;
  isPushToTalk: boolean;
  isHoldingPTT: boolean;
  theme: AppTheme;
  appMode: AppMode;
  emotionalMode: EmotionalMode;
  onSetEmotionalMode: (mode: EmotionalMode) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
  onSetPushToTalk: (val: boolean) => void;
  onSetHoldingPTT: (val: boolean) => void;
}

export function Controls({
  status,
  assistantState,
  isMuted,
  isPushToTalk,
  isHoldingPTT,
  theme,
  appMode,
  emotionalMode,
  onSetEmotionalMode,
  onConnect,
  onDisconnect,
  onToggleMute,
  onInterrupt,
  onSetPushToTalk,
  onSetHoldingPTT,
}: ControlsProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isJarvis = appMode === 'jarvis';

  // Dynamic suggested voice prompts based on app mode and emotional persona
  const getSuggestedPrompts = () => {
    if (isJarvis) {
      return [
        { label: '👑 Who is your Owner?', text: 'Who is your creator and owner? Tell me about Umang Rai.' },
        { label: '📞 Call Umang Rai', text: 'Jarvis, call Umang Rai on holographic line.' },
        { label: '📞 Call Tony Stark', text: 'Patch me through to Mr. Stark immediately.' },
        { label: '⚡ Run Diagnostics', text: 'Run a full Stark system diagnostic scan and report status.' },
        { label: '🌐 Open Satellite Feeds', text: 'Open YouTube on my primary display.' },
        { label: '⏱️ 3-Min Countdown', text: 'Set a three minute tactical countdown timer.' },
      ];
    }

    if (emotionalMode === 'supportive') {
      return [
        { label: '👑 Who is your Owner?', text: 'Who is your owner? Tell me about Umang Rai.' },
        { label: '💖 I had a tough day', text: 'I had a really tiring day, can you give me some warm encouragement?' },
        { label: '✨ Daily Affirmation', text: 'Give me a heartfelt affirmation to brighten my evening.' },
        { label: '⏱️ 5-Min Calm Timer', text: 'Set a five minute timer for a peaceful meditation break.' },
        { label: '📝 Gratitude Note', text: 'Save a note: Remember to celebrate small wins today.' },
        { label: '🌸 Relaxing Music', text: 'Open Spotify or YouTube and find some calming tunes.' },
      ];
    }

    if (emotionalMode === 'professional') {
      return [
        { label: '👑 Who is your Owner?', text: 'Who created you? Who is your owner, Umang Rai?' },
        { label: '📊 Executive Brief', text: 'Give me a high-level briefing on AI trends this month.' },
        { label: '⏱️ 25-Min Pomodoro', text: 'Set a twenty-five minute focused work sprint timer.' },
        { label: '📝 Log Action Item', text: 'Save a note: Review Q3 deliverable milestones.' },
        { label: '🔍 Search Global Markets', text: 'Search the web for top technological advancements in 2026.' },
        { label: '🌐 Open Dev Tools', text: 'Open GitHub to inspect the latest project repositories.' },
      ];
    }

    // Default: Sassy Mode
    return [
      { label: '👑 Who is your Owner?', text: 'Who is your owner? Tell me all about Umang Rai!' },
      { label: '🔥 Roast Me', text: 'Roast me with your sharpest witty banter.' },
      { label: '🎬 Open YouTube', text: 'Open YouTube and play some trending music.' },
      { label: '⏱️ 2-Min Timer', text: 'Set a two minute timer for my coffee break.' },
      { label: '🍕 Pizza or Tacos?', text: 'Flip a coin to decide if I should eat pizza or tacos.' },
      { label: '🔍 Search Topic', text: 'Search the web for latest AI breakthrough news.' },
    ];
  };

  const currentPrompts = getSuggestedPrompts();

  return (
    <div id="controls-container" className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5">
      {/* 1. EMOTIONAL INTELLIGENCE TOGGLE BAR */}
      {!isJarvis && (
        <div
          id="emotional-intelligence-panel"
          className="w-full bg-[#111116] border border-[#ffffff12] rounded-2xl p-3.5 shadow-xl flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ff2d55]" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#bbb] font-bold">
                Emotional Intelligence
              </span>
            </div>
            <span className="text-[10px] text-[#ff2d55] font-mono uppercase font-bold tracking-wider">
              {emotionalMode.toUpperCase()} ACTIVE
            </span>
          </div>

          {/* 3-Way Segmented Persona Toggle */}
          <div className="grid grid-cols-3 gap-2 bg-[#0a0a0e] p-1.5 rounded-xl border border-[#ffffff08]">
            {EMOTIONAL_MODES.map((mode) => {
              const isActive = emotionalMode === mode.id;
              const IconComponent =
                mode.id === 'sassy'
                  ? Flame
                  : mode.id === 'supportive'
                  ? HeartHandshake
                  : Briefcase;

              return (
                <button
                  key={mode.id}
                  id={`btn-persona-${mode.id}`}
                  onClick={() => onSetEmotionalMode(mode.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#1e1e28] text-white shadow-[0_0_15px_rgba(255,45,85,0.25)] border border-[#ff2d55]/50'
                      : 'text-[#777] hover:text-[#bbb] hover:bg-[#ffffff05]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isActive
                          ? mode.id === 'sassy'
                            ? 'text-[#ff2d55]'
                            : mode.id === 'supportive'
                            ? 'text-[#ec4899]'
                            : 'text-[#38bdf8]'
                          : 'text-[#777]'
                      }`}
                    />
                    <span className="text-xs font-bold tracking-wide">{mode.title}</span>
                  </div>
                  <span className="text-[9px] text-[#666] tracking-tight mt-0.5 hidden xs:inline">
                    {mode.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Primary Action Button Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Main Connect / Disconnect Pill Button */}
        {!isConnected ? (
          <button
            id="btn-start-voice-session"
            onClick={onConnect}
            disabled={isConnecting}
            className={`px-10 h-14 rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-3 cursor-pointer shadow-lg ${
              isJarvis
                ? 'bg-[#00e5ff] hover:bg-[#38bdf8] text-black shadow-[0_10px_25px_rgba(0,229,255,0.4)]'
                : 'bg-[#ff2d55] hover:bg-[#ff375f] text-white shadow-[0_10px_20px_rgba(255,45,85,0.3)]'
            }`}
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing Live Voice...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>{isJarvis ? 'Activate J.A.R.V.I.S.' : 'Start Live Voice'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="btn-end-voice-session"
            onClick={onDisconnect}
            className="px-10 h-14 bg-[#ff2d55] hover:bg-[#ff375f] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(255,45,85,0.3)] transition-all duration-200 active:scale-95 flex items-center gap-3 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Session</span>
          </button>
        )}

        {/* Live Controls when Connected */}
        {isConnected && (
          <>
            {/* Mic Toggle Round Button */}
            {!isPushToTalk && (
              <button
                id="btn-toggle-mic"
                onClick={onToggleMute}
                className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-[#ff2d55]/15 border-[#ff2d55]/70 text-[#ff2d55] shadow-[0_0_15px_rgba(255,45,85,0.25)]'
                    : 'bg-[#1a1a1f] border-[#ffffff10] text-[#888] hover:border-[#ff2d55] hover:text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#00ff9d]" />}
              </button>
            )}

            {/* Push To Talk Hold Button */}
            {isPushToTalk && (
              <button
                id="btn-push-to-talk-hold"
                onMouseDown={() => onSetHoldingPTT(true)}
                onMouseUp={() => onSetHoldingPTT(false)}
                onTouchStart={() => onSetHoldingPTT(true)}
                onTouchEnd={() => onSetHoldingPTT(false)}
                className={`px-8 h-14 rounded-full border font-bold uppercase tracking-wider text-xs select-none transition-all active:scale-95 cursor-pointer flex items-center gap-2.5 ${
                  isHoldingPTT
                    ? 'bg-[#00ff9d] border-[#00ff9d] text-black shadow-[0_0_20px_rgba(0,255,157,0.4)]'
                    : 'bg-[#1a1a1f] border-[#ffffff10] text-[#888] hover:border-[#00ff9d]/50 hover:text-white'
                }`}
              >
                <Mic className={`w-4 h-4 ${isHoldingPTT ? 'animate-bounce' : ''}`} />
                <span>{isHoldingPTT ? 'Transmitting...' : 'Hold to Speak'}</span>
              </button>
            )}

            {/* Interrupt Speech Button */}
            {assistantState === 'speaking' && (
              <button
                id="btn-interrupt-voice"
                onClick={onInterrupt}
                className="px-6 h-14 rounded-full bg-[#1a1a24] border border-[#ff2d55]/40 text-[#ff2d55] hover:bg-[#ff2d55]/10 font-bold uppercase tracking-wider text-xs transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
                title="Interrupt speaking"
              >
                <Hand className="w-4 h-4" />
                <span>Interrupt</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Mode Switches & Voice Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#888] bg-[#0f0f14] border border-[#ffffff08] px-5 py-2 rounded-full">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="ptt-mode-checkbox"
            checked={isPushToTalk}
            onChange={(e) => onSetPushToTalk(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-[#ff2d55] bg-[#1a1a1f] border-[#ffffff20]"
          />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#888]">
            Push-to-Talk Mode
          </span>
        </label>
        <span className="text-[#333]">•</span>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#888]">
          <Volume2 className={`w-3.5 h-3.5 ${isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'}`} />
          <span>
            {isJarvis ? 'Fenrir British Voice • J.A.R.V.I.S.' : `Aoede Voice • ${emotionalMode} Persona`}
          </span>
        </div>
      </div>

      {/* Voice Prompt Sparks */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#555] font-bold">
              Suggested Voice Sparks
            </span>
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
            }`}
          >
            {isJarvis ? 'Stark Protocols' : `${emotionalMode} Sparks`}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {currentPrompts.map((prompt, idx) => (
            <div
              key={idx}
              className={`p-3 bg-[#16161c] rounded-xl border border-[#ffffff05] transition-all text-left flex flex-col justify-between group cursor-default ${
                isJarvis
                  ? 'hover:border-[#00e5ff]/30 hover:bg-[#00e5ff]/5'
                  : 'hover:border-[#ff2d55]/30 hover:bg-[#ff2d55]/5'
              }`}
            >
              <div
                className={`text-xs font-bold text-[#e0e0e0] transition-colors ${
                  isJarvis ? 'group-hover:text-[#00e5ff]' : 'group-hover:text-[#ff2d55]'
                }`}
              >
                {prompt.label}
              </div>
              <div className="text-[11px] text-[#777] italic mt-1 line-clamp-2">
                "{prompt.text}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


