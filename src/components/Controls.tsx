import React from 'react';
import { ConnectionStatus, AssistantState, AppTheme } from '../types';
import { Mic, MicOff, PhoneCall, PhoneOff, Hand, Volume2, Sparkles } from 'lucide-react';

interface ControlsProps {
  status: ConnectionStatus;
  assistantState: AssistantState;
  isMuted: boolean;
  isPushToTalk: boolean;
  isHoldingPTT: boolean;
  theme: AppTheme;
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
  onConnect,
  onDisconnect,
  onToggleMute,
  onInterrupt,
  onSetPushToTalk,
  onSetHoldingPTT,
}: ControlsProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const sassyPrompts = [
    { label: '🔥 Roast Me', text: 'Roast me with your sharpest witty banter.' },
    { label: '🎬 Open YouTube', text: 'Open YouTube and play some trending music.' },
    { label: '⏱️ 2-Min Timer', text: 'Set a two minute timer for my coffee break.' },
    { label: '🍕 Pizza or Tacos?', text: 'Flip a coin to decide if I should eat pizza or tacos.' },
    { label: '📝 Save Note', text: 'Save a note: finish the presentation by 5 PM.' },
    { label: '🔍 Search Topic', text: 'Search the web for latest AI breakthrough news.' },
  ];

  return (
    <div id="controls-container" className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      {/* Primary Action Button Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Main Connect / Disconnect Pill Button */}
        {!isConnected ? (
          <button
            id="btn-start-voice-session"
            onClick={onConnect}
            disabled={isConnecting}
            className="px-10 h-14 bg-[#ff2d55] hover:bg-[#ff375f] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(255,45,85,0.3)] transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-3 cursor-pointer"
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>Start Live Voice</span>
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
                title="Interrupt UMNG speaking"
              >
                <Hand className="w-4 h-4" />
                <span>Interrupt</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Mode Switches & Voice Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#888] bg-[#0f0f14] border border-[#ffffff08] px-5 py-2.5 rounded-full">
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
          <Volume2 className="w-3.5 h-3.5 text-[#ff2d55]" />
          <span>Aoede Voice • Mina Persona</span>
        </div>
      </div>

      {/* Sassy Conversational Sparks */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#555] font-bold">
              Suggested Sparks
            </span>
          </div>
          <span className="text-[10px] text-[#ff2d55] font-black uppercase tracking-[0.2em]">
            Voice Commands
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {sassyPrompts.map((prompt, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#16161c] rounded-xl border border-[#ffffff05] hover:border-[#ffffff15] transition-all text-left flex flex-col justify-between group"
            >
              <div className="text-xs font-bold text-[#e0e0e0] group-hover:text-[#ff2d55] transition-colors">
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

