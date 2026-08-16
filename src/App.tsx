import { useState, useEffect } from 'react';
import { useLiveVoice } from './hooks/useLiveVoice';
import { AppTheme, AppMode, EmotionalMode, StarkClearanceState } from './types';
import { Header } from './components/Header';
import { VoiceOrb } from './components/VoiceOrb';
import { AudioVisualizer } from './components/AudioVisualizer';
import { Controls } from './components/Controls';
import { ActionFeed } from './components/ActionFeed';
import { TranscriptView } from './components/TranscriptView';
import { StarkAccessGateModal } from './components/StarkAccessGateModal';
import { HolographicCallModal } from './components/HolographicCallModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import {
  AlertTriangle,
  Sparkles,
  Shield,
  Bot,
  Zap,
  Activity,
  Cpu,
  Flame,
  HeartHandshake,
  Briefcase,
  Crown,
  Key,
  PhoneCall,
  Lock,
  Download,
  FolderArchive,
  CheckCircle,
} from 'lucide-react';
import { THEME_CONFIGS } from './utils/theme';
import { playUiSound } from './utils/audio';

export default function App() {
  // Detect if initial route is /jarvis or ?mode=jarvis
  const getInitialAppMode = (): AppMode => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (path.includes('jarvis') || params.get('mode') === 'jarvis') {
        return 'jarvis';
      }
    }
    return 'umng';
  };

  const initialMode = getInitialAppMode();
  const [appMode, setAppMode] = useState<AppMode>(initialMode);
  const [emotionalMode, setEmotionalMode] = useState<EmotionalMode>('sassy');
  const [theme, setTheme] = useState<AppTheme>(initialMode === 'jarvis' ? 'stark_arc' : 'neon_rose');
  const [sessionDuration, setSessionDuration] = useState(0);

  // Modal States
  const [isAccessGateOpen, setIsAccessGateOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [voiceCallTarget, setVoiceCallTarget] = useState<string | undefined>(undefined);
  const [starkClearance, setStarkClearance] = useState<StarkClearanceState | null>(null);

  // Load cached clearance on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('stark_clearance_cache');
      if (cached) {
        setStarkClearance(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }, []);

  // Handler for voice tool `makeCall`
  const handleVoiceInitiatedCall = (contactName: string, reason?: string) => {
    setVoiceCallTarget(contactName);
    setIsCallModalOpen(true);
  };

  // Sync browser URL when app mode changes without full reload
  const handleSelectAppMode = (newMode: AppMode) => {
    if (newMode === 'jarvis' && !starkClearance?.isGranted) {
      // Trigger Access Key gate prompt if not already cleared
      setIsAccessGateOpen(true);
    }

    setAppMode(newMode);
    if (newMode === 'jarvis') {
      setTheme('stark_arc');
      window.history.pushState({}, '', '/jarvis');
      playUiSound('action');
    } else {
      if (theme === 'stark_arc') {
        setTheme('neon_rose');
      }
      window.history.pushState({}, '', '/');
      playUiSound('action');
    }
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const isJarvisPath = window.location.pathname.toLowerCase().includes('jarvis');
      setAppMode(isJarvisPath ? 'jarvis' : 'umng');
      if (isJarvisPath) setTheme('stark_arc');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    emotionalMode,
    setEmotionalMode,
    appMode,
    setAppMode,
    onVoiceInitiatedCall: handleVoiceInitiatedCall,
  });

  const isConnected = status === 'connected';
  const isJarvis = appMode === 'jarvis';
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.neon_rose;

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
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-500 ${
        isJarvis
          ? 'bg-[#040810] text-[#d6e5f5] selection:bg-[#00e5ff]/30 selection:text-[#00e5ff]'
          : 'bg-[#0a0a0b] text-[#e0e0e0] selection:bg-[#ff2d55]/30 selection:text-[#ff375f]'
      }`}
    >
      {/* Top Header */}
      <Header
        status={status}
        theme={theme}
        setTheme={setTheme}
        appMode={appMode}
        onSelectAppMode={handleSelectAppMode}
        emotionalMode={emotionalMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenCallModal={() => {
          setVoiceCallTarget(undefined);
          setIsCallModalOpen(true);
        }}
        onOpenAccessGate={() => setIsAccessGateOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        starkClearance={starkClearance}
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
            className={`w-full max-w-xl mx-auto flex items-center justify-between gap-3 px-4 py-2 rounded-full border text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 ${
              isJarvis
                ? 'bg-[#00e5ff]/10 border-[#00e5ff]/40 text-[#00e5ff]'
                : 'bg-[#ff2d55]/10 border-[#ff2d55]/30 text-[#ff2d55]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className={`w-3.5 h-3.5 ${isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'} shrink-0`} />
              <span className="truncate text-white">{lastActionResult}</span>
            </div>
            <span
              className={`text-[9px] uppercase font-mono font-bold tracking-widest shrink-0 ${
                isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
              }`}
            >
              Live Executed
            </span>
          </div>
        )}

        {/* 3-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Persona Vibe / Stark Telemetry & Creator Socials */}
          <section className="lg:col-span-3 flex flex-col gap-5">
            {/* Telemetry Card */}
            <div
              className={`flex flex-col gap-4 border rounded-2xl p-5 transition-all duration-300 ${
                isJarvis
                  ? 'bg-[#060c18] border-[#00e5ff20] shadow-[0_0_30px_rgba(0,229,255,0.05)]'
                  : 'bg-[#0d0d10] border-[#ffffff10]'
              }`}
            >
              {/* Top Identity Block */}
              <div className="flex items-center justify-between border-b border-[#ffffff08] pb-3">
                <div className="flex items-center gap-2">
                  {isJarvis ? (
                    <Shield className="w-4 h-4 text-[#00e5ff]" />
                  ) : emotionalMode === 'sassy' ? (
                    <Flame className="w-4 h-4 text-[#ff2d55]" />
                  ) : emotionalMode === 'supportive' ? (
                    <HeartHandshake className="w-4 h-4 text-[#ec4899]" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-[#38bdf8]" />
                  )}
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#bbb] font-bold">
                    {isJarvis ? 'Stark Telemetry' : 'Persona Telemetry'}
                  </h3>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                    isJarvis
                      ? 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30'
                      : 'bg-[#ffffff10] text-[#ff2d55] border-[#ff2d55]/30'
                  }`}
                >
                  {isJarvis ? 'MARK VII' : emotionalMode.toUpperCase()}
                </span>
              </div>

              {/* Metric Meters */}
              <div className="space-y-3">
                {/* Metric 1 */}
                <div className="p-3 bg-[#13131c] rounded-xl border border-[#ffffff05]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#888] font-medium text-[11px]">
                      {isJarvis ? 'Arc Reactor Output' : 'Confidence Level'}
                    </span>
                    <span
                      className={`font-bold text-[11px] uppercase ${
                        isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
                      }`}
                    >
                      {isJarvis ? '100% 3.0 GJ/s' : 'Maximum (100%)'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div
                      className={`w-[98%] h-full rounded-full transition-all duration-500 ${
                        isJarvis
                          ? 'bg-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.7)]'
                          : 'bg-[#ff2d55] shadow-[0_0_10px_rgba(255,45,85,0.5)]'
                      }`}
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-3 bg-[#13131c] rounded-xl border border-[#ffffff05]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#888] font-medium text-[11px]">
                      {isJarvis ? 'Tactical Readiness' : 'Emotional Vibe'}
                    </span>
                    <span
                      className={`font-bold text-[11px] uppercase ${
                        isJarvis
                          ? 'text-[#00ff9d]'
                          : emotionalMode === 'sassy'
                          ? 'text-[#ff2d55]'
                          : emotionalMode === 'supportive'
                          ? 'text-[#ec4899]'
                          : 'text-[#38bdf8]'
                      }`}
                    >
                      {isJarvis
                        ? 'Combat Ready'
                        : emotionalMode === 'sassy'
                        ? 'Spicy & Teasing'
                        : emotionalMode === 'supportive'
                        ? 'Empathetic'
                        : 'Analytical'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div
                      className={`w-[85%] h-full rounded-full transition-all duration-500 ${
                        isJarvis
                          ? 'bg-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.5)]'
                          : emotionalMode === 'sassy'
                          ? 'bg-[#ff2d55] shadow-[0_0_10px_rgba(255,45,85,0.5)]'
                          : emotionalMode === 'supportive'
                          ? 'bg-[#ec4899] shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                          : 'bg-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                      }`}
                    />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-3 bg-[#13131c] rounded-xl border border-[#ffffff05]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#888] font-medium text-[11px]">Clearance Protocol</span>
                    <span className="text-[#00ff9d] font-bold text-[11px] uppercase font-mono">
                      {starkClearance?.isGranted ? 'VIP AUTHENTICATED' : 'STANDARD'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.5)] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Persona Signature Quote */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isJarvis
                    ? 'bg-gradient-to-b from-[#0a1526] to-[#040810] border-[#00e5ff20]'
                    : 'bg-gradient-to-b from-[#1a1a24] to-[#0d0d10] border-[#ffffff08]'
                }`}
              >
                <p className="text-[#aaa] italic text-xs leading-relaxed">
                  {isJarvis
                    ? '"At your service, sir. All defense protocols and quantum sensors are calibrated under Mr. Umang Rai\'s directives. How may I assist your operations?"'
                    : emotionalMode === 'supportive'
                    ? '"Take a deep breath. Whatever you\'re working on, you\'ve got this and I\'m right by your side to help!"'
                    : emotionalMode === 'professional'
                    ? '"Standing by for task execution and analytical syntheses. Ready when you are."'
                    : '"Honestly, sugar, you ask the most amusing questions, but I am completely here for it. What\'s next on our agenda?"'}
                </p>
                <p
                  className={`text-[10px] font-black mt-2.5 uppercase tracking-widest ${
                    isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
                  }`}
                >
                  {isJarvis ? '— J.A.R.V.I.S. (Fenrir Voice)' : '— Mina (Aoede Voice)'}
                </p>
              </div>

              {/* Direct 1-Click Code & App ZIP Downloader */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isJarvis
                    ? 'bg-[#040d1c] border-[#00e5ff40] shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                    : 'bg-[#15121b] border-[#ff2d5530]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <FolderArchive className={`w-4 h-4 ${isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'}`} />
                    <span>{isJarvis ? 'J.A.R.V.I.S. Direct ZIP Bundle' : 'UMNG AI Direct ZIP Bundle'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    ZIP
                  </span>
                </div>
                <p className="text-[11px] text-[#88a8cc] mb-3 leading-relaxed">
                  {isJarvis
                    ? 'Direct download for J.A.R.V.I.S. package & offline standalone app code (no parsing errors).'
                    : 'Direct download for UMNG AI package & offline standalone app code.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    id="btn-direct-download-jjj-apk"
                    href="/jjj.apk"
                    download="jjj.apk"
                    onClick={() => playUiSound('action')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
                      isJarvis
                        ? 'bg-[#00e5ff] hover:bg-[#33ebff] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                        : 'bg-gradient-to-r from-[#ff2d55] to-[#ec4899] text-white shadow-[0_0_15px_rgba(255,45,85,0.3)]'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download jjj.apk</span>
                  </a>
                  <a
                    id="btn-direct-download-zip"
                    href={isJarvis ? '/api/download-zip/jarvis' : '/api/download-zip/umng'}
                    download={isJarvis ? 'jarvis-stark-assistant.zip' : 'umng-ai-assistant.zip'}
                    onClick={() => playUiSound('action')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-[#ffffff10] hover:bg-[#ffffff18] text-white border border-[#ffffff15] transition-all active:scale-95 cursor-pointer"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download .ZIP</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Center Stage: Voice Orb & Interactive Audio Engine */}
          <section className="lg:col-span-5 flex flex-col items-center gap-6">
            {/* The Voice Orb Core Box */}
            <div
              className={`w-full flex flex-col items-center justify-center border rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
                isJarvis
                  ? 'bg-[#060c18] border-[#00e5ff20]'
                  : 'bg-[#0d0d10] border-[#ffffff10]'
              }`}
            >
              <VoiceOrb
                state={assistantState}
                inputVolume={inputVolume}
                outputVolume={outputVolume}
                theme={theme}
                appMode={appMode}
                emotionalMode={emotionalMode}
                isConnected={isConnected}
                onOrbClick={isConnected ? interrupt : connect}
              />

              {/* Real-time Audio Input / Output Visualizer */}
              <div className="w-full mt-4">
                <AudioVisualizer
                  inputVolume={inputVolume}
                  outputVolume={outputVolume}
                  theme={theme}
                  appMode={appMode}
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
                appMode={appMode}
                emotionalMode={emotionalMode}
                onSetEmotionalMode={setEmotionalMode}
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
              appMode={appMode}
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

      {/* Holographic Calling Matrix Modal */}
      <HolographicCallModal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setVoiceCallTarget(undefined);
        }}
        targetContactName={voiceCallTarget}
        appMode={appMode}
        theme={theme}
      />

      {/* Stark Firebase Access Key Gate Modal */}
      <StarkAccessGateModal
        isOpen={isAccessGateOpen}
        onClose={() => setIsAccessGateOpen(false)}
        onClearanceGranted={(clearance) => {
          setStarkClearance(clearance);
        }}
      />

      {/* Official Android APK Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        appMode={appMode}
        theme={theme}
      />

      {/* Elegant Dark Footer */}
      <footer
        className={`w-full border-t px-6 sm:px-8 py-5 mt-auto transition-colors duration-300 ${
          isJarvis
            ? 'bg-[#03060c] border-[#00e5ff20]'
            : 'bg-[#0f0f12] border-[#ffffff10]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-[#555] font-bold mb-0.5 tracking-wider">
                Mic Sensitivity
              </span>
              <span className="text-xs text-white font-medium">Auto-Calibrated</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-[#555] font-bold mb-0.5 tracking-wider">
                Session Active
              </span>
              <span className="text-xs text-white font-medium font-mono">
                {isConnected ? formatDuration(sessionDuration) : '0m 00s'}
              </span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] uppercase text-[#555] font-bold mb-0.5 tracking-wider">
                Voice Model
              </span>
              <span
                className={`text-xs font-medium font-mono ${
                  isJarvis ? 'text-[#00e5ff]' : 'text-[#00ff9d]'
                }`}
              >
                {isConnected
                  ? isJarvis
                    ? 'Fenrir • 24kHz Tactical Stream'
                    : 'Aoede • 24kHz Live Stream'
                  : 'Ready'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#888] font-mono text-center sm:text-right">
            {isJarvis ? 'J.A.R.V.I.S. Protocol' : 'UMNG Assistant'} • Owner: <span className="text-white font-bold">Umang Rai</span>
          </div>
        </div>
      </footer>
    </div>
  );
}



