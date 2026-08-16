import { motion } from 'motion/react';
import { AssistantState, AppTheme, AppMode, EmotionalMode } from '../types';
import { Sparkles, Mic, Volume2, Flame, Wrench, AlertCircle, Shield, HeartHandshake, Briefcase } from 'lucide-react';
import { THEME_CONFIGS } from '../utils/theme';

interface VoiceOrbProps {
  state: AssistantState;
  inputVolume: number;
  outputVolume: number;
  theme: AppTheme;
  appMode: AppMode;
  emotionalMode: EmotionalMode;
  isConnected: boolean;
  onOrbClick?: () => void;
}

export function VoiceOrb({
  state,
  inputVolume,
  outputVolume,
  theme,
  appMode,
  emotionalMode,
  isConnected,
  onOrbClick,
}: VoiceOrbProps) {
  const isJarvis = appMode === 'jarvis';
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.neon_rose;

  // Volume scaling
  const volumeScale =
    state === 'speaking'
      ? 1 + Math.min(outputVolume * 1.6, 0.35)
      : state === 'listening'
      ? 1 + Math.min(inputVolume * 1.3, 0.25)
      : 1;

  const getStatusDetails = () => {
    if (isJarvis) {
      if (!isConnected) {
        return {
          headline: 'J.A.R.V.I.S. Protocol Standby',
          subtext: 'Mark VII Tactical AI Interface • Owner: Umang Rai',
          actionHint: 'Tap Arc Reactor or button to initiate',
          icon: Shield,
        };
      }

      switch (state) {
        case 'speaking':
          return {
            headline: 'J.A.R.V.I.S. Transmitting...',
            subtext: 'Fenrir British Tactical Voice • 24kHz Stream',
            actionHint: 'At your service, sir',
            icon: Volume2,
          };
        case 'listening':
          return {
            headline: 'Awaiting Command...',
            subtext: 'Acoustic sensors active, go ahead sir',
            actionHint: 'Listening continuous telemetry',
            icon: Mic,
          };
        case 'tool_executing':
          return {
            headline: 'Processing Protocol...',
            subtext: 'Executing browser subroutine',
            actionHint: 'Subroutines engaged',
            icon: Wrench,
          };
        case 'interrupted':
          return {
            headline: 'Interrupted by User',
            subtext: 'Holding channel, ready for instruction',
            actionHint: 'Go ahead, sir',
            icon: AlertCircle,
          };
        default:
          return {
            headline: 'All Systems Nominal',
            subtext: 'Stark Architecture • Engineered by Umang Rai',
            actionHint: 'Speak anytime to command',
            icon: Shield,
          };
      }
    }

    // UMNG Companion Status
    if (!isConnected) {
      return {
        headline: `Ready (${emotionalMode.toUpperCase()} Mode)`,
        subtext: 'Gemini 3.1 Flash Live Preview • Owner: Umang Rai',
        actionHint: 'Tap to start live audio session',
        icon: Sparkles,
      };
    }

    switch (state) {
      case 'speaking':
        return {
          headline: 'UMNG is Speaking...',
          subtext: `${emotionalMode.toUpperCase()} Persona Active • 24kHz Stream`,
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
          headline: 'Executing Action...',
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
          headline: `Live & ${emotionalMode === 'sassy' ? 'Sassy' : emotionalMode === 'supportive' ? 'Empathetic' : 'Ready'}`,
          subtext: `Voice Companion • Built for Umang Rai`,
          actionHint: 'Speak anytime to begin',
          icon: emotionalMode === 'sassy' ? Flame : emotionalMode === 'supportive' ? HeartHandshake : Briefcase,
        };
    }
  };

  const status = getStatusDetails();

  // Equalizer bar heights calculated based on live audio activity
  const activityLevel = isConnected
    ? Math.max(outputVolume * 2, inputVolume * 1.5)
    : 0;

  const primaryColorHex = isJarvis ? '#00e5ff' : themeConfig.primaryHex;

  return (
    <div id="voice-orb-container" className="flex flex-col items-center justify-center py-4 select-none relative w-full">
      {/* Radial center glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${primaryColorHex} 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96">
        {/* Outer Concentric Rings */}
        <div
          className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border transition-all duration-700 pointer-events-none ${
            isJarvis ? 'border-[#00e5ff25]' : 'border-[#ffffff15]'
          } ${isConnected ? 'animate-pulse' : 'opacity-40'}`}
        />
        <div
          className={`absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border pointer-events-none ${
            isJarvis ? 'border-[#00e5ff15]' : 'border-[#ffffff08]'
          } ${isConnected ? 'animate-spin [animation-duration:18s]' : 'opacity-20'}`}
        />

        {/* Central Audio Core */}
        <motion.div
          id="voice-orb-core"
          onClick={onOrbClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={{ scale: volumeScale }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className={`relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center border-4 cursor-pointer overflow-hidden group transition-all duration-500 ${
            isJarvis
              ? 'bg-[#050c18] border-[#00e5ff40] shadow-[0_0_70px_rgba(0,229,255,0.3)]'
              : 'bg-[#0f0f14] border-[#1a1a24] shadow-[0_0_60px_rgba(255,45,85,0.2)]'
          }`}
        >
          {/* Subtle top glare */}
          <div className="absolute top-0 left-1/4 right-1/4 h-8 bg-white/10 rounded-full blur-[4px] pointer-events-none" />

          {/* Equalizer Waveform Bars / Arc Reactor Matrix */}
          <div className="flex items-center gap-1.5 h-28 sm:h-32 z-10">
            {/* Bar 1 */}
            <div
              className="w-2 sm:w-2.5 rounded-full opacity-60 transition-all duration-75"
              style={{
                backgroundColor: primaryColorHex,
                height: `${Math.max(12, Math.min(60, 14 + activityLevel * 80))}%`,
              }}
            />
            {/* Bar 2 */}
            <div
              className="w-2 sm:w-2.5 rounded-full opacity-85 transition-all duration-75"
              style={{
                backgroundColor: primaryColorHex,
                height: `${Math.max(22, Math.min(85, 24 + activityLevel * 120))}%`,
              }}
            />
            {/* Center Main Bar with Intense Glow */}
            <div
              className="w-2.5 sm:w-3 rounded-full transition-all duration-75"
              style={{
                backgroundColor: primaryColorHex,
                boxShadow: `0 0 16px ${primaryColorHex}`,
                height: `${Math.max(34, Math.min(98, 36 + activityLevel * 150))}%`,
              }}
            />
            {/* Bar 4 */}
            <div
              className="w-2 sm:w-2.5 rounded-full opacity-85 transition-all duration-75"
              style={{
                backgroundColor: primaryColorHex,
                height: `${Math.max(20, Math.min(80, 22 + activityLevel * 110))}%`,
              }}
            />
            {/* Bar 5 */}
            <div
              className="w-2 sm:w-2.5 rounded-full opacity-60 transition-all duration-75"
              style={{
                backgroundColor: primaryColorHex,
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
              {isConnected
                ? state === 'speaking'
                  ? 'Transmitting'
                  : 'Online'
                : 'Standby'}
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
          <span
            className={`inline-block text-[11px] font-mono uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#16161c] border ${
              isJarvis ? 'text-[#00e5ff] border-[#00e5ff]/20' : 'text-[#888] border-[#ffffff08]'
            }`}
          >
            {status.actionHint}
          </span>
        </div>
      </div>
    </div>
  );
}


