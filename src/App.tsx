import { useState, useEffect } from 'react';
import { useLiveVoice } from './hooks/useLiveVoice';
import { AppTheme } from './types';
import { Header } from './components/Header';
import { VoiceOrb } from './components/VoiceOrb';
import { AudioVisualizer } from './components/AudioVisualizer';
import { Controls } from './components/Controls';
import { ActionFeed } from './components/ActionFeed';
import { TranscriptView } from './components/TranscriptView';
import { AlertTriangle, Sparkles, Sliders, Flame, HeartHandshake } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>('neon_rose');
  const [sessionDuration, setSessionDuration] = useState(0);

  const {
    status,
    assistantState,
    isMuted,
    isPushToTalk,
    isHoldingPTT,
    errorMessage,
    inputVolume,
    outputVolume,
    transcripts,
    currentLiveUserText,
    currentLiveModelText,
    toolCalls,
    activeTimers,
    notes,
    lastActionResult,
    connect,
    disconnect,
    toggleMute,
    interrupt,
    setIsPushToTalk,
    setIsHoldingPTT,
    dismissTimer,
    deleteNote,
  } = useLiveVoice({
    theme,
    setTheme,
  });

  const isConnected = status === 'connected';

  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e0e0e0] font-sans flex flex-col selection:bg-[#ff2d55]/30 selection:text-[#ff375f]">
      {/* Top Header */}
      <Header
        status={status}
        theme={theme}
        setTheme={setTheme}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            id="error-banner"
            className="w-full max-w-2xl mx-auto flex items-start gap-3 p-4 rounded-2xl bg-[#ff2d55]/10 border border-[#ff2d55]/40 text-[#ff2d55] text-xs shadow-xl"
          >
            <AlertTriangle className="w-4 h-4 text-[#ff2d55] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Connection Error
              </h4>
              <p className="text-[#ff2d55]/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Dynamic Action Notification Toast */}
        {lastActionResult && (
          <div
            id="action-toast"
            className="w-full max-w-xl mx-auto flex items-center justify-between gap-3 px-4 py-2 rounded-full bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#ff2d55] shrink-0" />
              <span className="truncate text-white">{lastActionResult}</span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold text-[#ff2d55] tracking-widest shrink-0">
              Live Executed
            </span>
          </div>
        )}

        {/* 3-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Persona Vibe & Attitude Telemetry */}
          <section className="lg:col-span-3 flex flex-col gap-6 bg-[#0d0d10] border border-[#ffffff10] rounded-2xl p-5 sm:p-6">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#555] font-bold mb-4">
                Persona Vibe
              </h3>
              <div className="space-y-3">
                {/* Confidence Meter */}
                <div className="p-3 bg-[#16161c] rounded-xl border border-[#ffffff05]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#888] font-medium text-[11px]">Confidence</span>
                    <span className="text-[#ff2d55] font-bold text-[11px] uppercase">Max</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div className="w-[95%] h-full bg-[#ff2d55] shadow-[0_0_10px_rgba(255,45,85,0.5)] rounded-full" />
                  </div>
                </div>

                {/* Sass Level Meter */}
                <div className="p-3 bg-[#16161c] rounded-xl border border-[#ffffff05]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#888] font-medium text-[11px]">Sass Level</span>
                    <span className="text-[#ff2d55] font-bold text-[11px] uppercase">Teasing</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div className="w-[82%] h-full bg-[#ff2d55] shadow-[0_0_10px_rgba(255,45,85,0.5)] rounded-full" />
                  </div>
                </div>

                {/* Response Speed Meter */}
                <div className="p-3 bg-[#16161c] rounded-xl border border-[#ffffff05]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#888] font-medium text-[11px]">Voice Latency</span>
                    <span className="text-[#00ff9d] font-bold text-[11px] uppercase font-mono">
                      {isConnected ? '~120ms' : '0ms'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div className="w-[88%] h-full bg-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.5)] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Persona Signature Quote */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#0d0d10] border border-[#ffffff08] mt-auto">
              <p className="text-[#888] italic text-xs leading-relaxed">
                "Honestly, sugar, you ask the most amusing questions, but I'm completely here for it. What's next on our agenda?"
              </p>
              <p className="text-[#ff2d55] text-[10px] font-black mt-3 uppercase tracking-widest">
                — Mina (UMNG Companion)
              </p>
            </div>
          </section>

          {/* Center Stage: Voice Orb & Interactive Audio Engine */}
          <section className="lg:col-span-5 flex flex-col items-center gap-6">
            {/* The Voice Orb Core Box */}
            <div className="w-full flex flex-col items-center justify-center bg-[#0d0d10] border border-[#ffffff10] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <VoiceOrb
                state={assistantState}
                inputVolume={inputVolume}
                outputVolume={outputVolume}
                theme={theme}
                isConnected={isConnected}
                onOrbClick={isConnected ? interrupt : connect}
              />

              {/* Real-time Audio Input / Output Visualizer */}
              <div className="w-full mt-4">
                <AudioVisualizer
                  inputVolume={inputVolume}
                  outputVolume={outputVolume}
                  theme={theme}
                  isConnected={isConnected}
                />
              </div>
            </div>

            {/* Controls Bar & Mode Switches */}
            <div className="w-full">
              <Controls
                status={status}
                assistantState={assistantState}
                isMuted={isMuted}
                isPushToTalk={isPushToTalk}
                isHoldingPTT={isHoldingPTT}
                theme={theme}
                onConnect={connect}
                onDisconnect={disconnect}
                onToggleMute={toggleMute}
                onInterrupt={interrupt}
                onSetPushToTalk={setIsPushToTalk}
                onSetHoldingPTT={setIsHoldingPTT}
              />
            </div>
          </section>

          {/* Right Column: Execution Logs & Live Speech Transcript */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            {/* Live Subtitles & Transcript */}
            <TranscriptView
              transcripts={transcripts}
              currentLiveUserText={currentLiveUserText}
              currentLiveModelText={currentLiveModelText}
              theme={theme}
            />

            {/* Action Tools & Execution Logs */}
            <ActionFeed
              toolCalls={toolCalls}
              activeTimers={activeTimers}
              notes={notes}
              lastActionResult={lastActionResult}
              theme={theme}
              onDismissTimer={dismissTimer}
              onDeleteNote={deleteNote}
            />
          </section>
        </div>
      </main>

      {/* Elegant Dark Footer */}
      <footer className="w-full border-t border-[#ffffff10] bg-[#0f0f12] px-6 sm:px-8 py-5 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-[#555] font-bold mb-0.5 tracking-wider">
                Mic Sensitivity
              </span>
              <span className="text-xs text-white font-medium">Auto-Optimized</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-[#555] font-bold mb-0.5 tracking-wider">
                Total Duration
              </span>
              <span className="text-xs text-white font-medium font-mono">
                {isConnected ? formatDuration(sessionDuration) : '0m 00s'}
              </span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] uppercase text-[#555] font-bold mb-0.5 tracking-wider">
                Audio Stream
              </span>
              <span className="text-xs text-[#00ff9d] font-medium font-mono">
                {isConnected ? '24kHz Low-Latency' : 'Standby'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#666] font-mono text-center sm:text-right">
            UMNG Assistant • Gemini Live Engine v3.1
          </div>
        </div>
      </footer>
    </div>
  );
}

