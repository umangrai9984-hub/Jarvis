import { motion } from 'motion/react';
import { AssistantState, AppTheme } from '../types';
import { Sparkles, Mic, Volume2, Flame, Wrench, AlertCircle } from 'lucide-react';

interface VoiceOrbProps {
  state: AssistantState;
  inputVolume: number;
  outputVolume: number;
  theme: AppTheme;
  isConnected: boolean;
  onOrbClick?: () => void;
}

export function VoiceOrb({
  state,
  inputVolume,
  outputVolume,
  theme,
  isConnected,
  onOrbClick,
}: VoiceOrbProps) {
  // Volume scaling
  const volumeScale = state === 'speaking'
    ? 1 + Math.min(outputVolume * 1.6, 0.4)
    : state === 'listening'
    ? 1 + Math.min(inputVolume * 1.3, 0.3)
    : 1;

  const getStatusDetails = () => {
    if (!isConnected) {
      return {
        headline: 'Ready to Banter',
        subtext: 'Gemini 3.1 Flash Live Preview',
        actionHint: 'Tap to start live audio session',
        icon: Sparkles,
      };
    }

    switch (state) {
      case 'speaking':
        return {
          headline: 'UMNG is Speaking...',
          subtext: 'Mina Persona Active • 24kHz Stream',
          actionHint: 'Tap to interrupt anytime',
          icon: Volume2,
        };
      case 'listening':
        return {
          headline: 'Currently Listening...',
          subtext: 'Speak naturally, I am listening',
          actionHint: 'Continuous Audio Stream Active',
          icon: Mic,
        };
      case 'tool_executing':
        return {
          headline: 'Executing Tool Action...',
          subtext: 'Running browser function',
          actionHint: 'Working digital magic',
          icon: Wrench,
        };
      case 'interrupted':
        return {
          headline: 'Interrupted',
          subtext: 'Go ahead, you have the floor',
          actionHint: 'Listening for your response',
          icon: AlertCircle,
        };
      default:
        return {
          headline: 'Live & Sassy',
          subtext: 'Gemini 3.1 Flash Live Preview',
          actionHint: 'Speak anytime to begin',
          icon: Flame,
        };
    }
  };

  const status = getStatusDetails();

  // Equalizer bar heights calculated based on live audio activity
  const activityLevel = isConnected
    ? Math.max(outputVolume * 2, inputVolume * 1.5)
    : 0;

  return (
    <div id="voice-orb-container" className="flex flex-col items-center justify-center py-4 select-none relative w-full">
      {/* Radial center glow */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_#ff2d55_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96">
        {/* Outer Concentric Pulse Rings */}
        <div
          className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-[#ff2d5520] transition-all duration-700 pointer-events-none ${
            isConnected ? 'animate-pulse' : 'opacity-40'
          }`}
        />
        <div
          className={`absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-[#ff2d5510] pointer-events-none ${
            isConnected ? 'animate-elegant-ring' : 'opacity-20'
          }`}
        />

        {/* Central Glowing Audio Orb */}
        <motion.div
          id="voice-orb-core"
          onClick={onOrbClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={{ scale: volumeScale }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 bg-[#0f0f14] rounded-full flex flex-col items-center justify-center border-4 border-[#1a1a24] shadow-[0_0_60px_rgba(255,45,85,0.18)] cursor-pointer overflow-hidden group"
        >
          {/* Subtle top glare */}
          <div className="absolute top-0 left-1/4 right-1/4 h-8 bg-white/5 rounded-full blur-[4px] pointer-events-none" />

          {/* Equalizer Waveform Bars */}
          <div className="flex items-center gap-1.5 h-28 sm:h-32 z-10">
            {/* Bar 1 */}
            <div
              className="w-2 sm:w-2.5 bg-[#ff2d55] rounded-full opacity-60 transition-all duration-75"
              style={{
                height: `${Math.max(12, Math.min(60, 14 + activityLevel * 80))}%`,
              }}
            />
            {/* Bar 2 */}
            <div
              className="w-2 sm:w-2.5 bg-[#ff2d55] rounded-full opacity-85 transition-all duration-75"
              style={{
                height: `${Math.max(22, Math.min(85, 24 + activityLevel * 120))}%`,
              }}
            />
            {/* Center Main Bar with Intense Glow */}
            <div
              className="w-2.5 sm:w-3 bg-[#ff2d55] rounded-full shadow-[0_0_15px_#ff2d55] transition-all duration-75"
              style={{
                height: `${Math.max(34, Math.min(98, 36 + activityLevel * 150))}%`,
              }}
            />
            {/* Bar 4 */}
            <div
              className="w-2 sm:w-2.5 bg-[#ff2d55] rounded-full opacity-85 transition-all duration-75"
              style={{
                height: `${Math.max(20, Math.min(80, 22 + activityLevel * 110))}%`,
              }}
            />
            {/* Bar 5 */}
            <div
              className="w-2 sm:w-2.5 bg-[#ff2d55] rounded-full opacity-60 transition-all duration-75"
              style={{
                height: `${Math.max(12, Math.min(55, 14 + activityLevel * 70))}%`,
              }}
            />
          </div>

          {/* Center Micro State Label Overlay */}
          <div className="absolute bottom-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a24]/90 border border-[#ffffff10] backdrop-blur-sm z-20">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-[#00ff9d] shadow-[0_0_6px_#00ff9d]' : 'bg-[#666]'
              }`}
            />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#aaa]">
              {isConnected ? (state === 'speaking' ? 'Talking' : 'Live') : 'Offline'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Status Typography */}
      <div className="mt-4 sm:mt-6 text-center z-10">
        <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
          {status.headline}
        </h2>
        <p className="text-[#888] text-xs sm:text-sm mt-1.5 font-normal tracking-wide">
          {status.subtext}
        </p>
        <div className="mt-3">
          <span className="inline-block text-[11px] text-[#555] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#16161c] border border-[#ffffff05]">
            {status.actionHint}
          </span>
        </div>
      </div>
    </div>
  );
}

