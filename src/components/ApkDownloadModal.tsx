import { useState } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle,
  ExternalLink,
  X,
  FileCode2,
  Sparkles,
  Bot,
  Radio,
  Cpu,
  Layers,
  ArrowDownToLine,
  HelpCircle,
  Archive,
  AlertTriangle,
  FolderArchive,
  Check,
} from 'lucide-react';
import { AppMode, AppTheme } from '../types';
import { playUiSound } from '../utils/audio';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  appMode: AppMode;
  theme: AppTheme;
}

export function ApkDownloadModal({
  isOpen,
  onClose,
  appMode,
  theme,
}: ApkDownloadModalProps) {
  const isJarvis = appMode === 'jarvis';
  const [activeTab, setActiveTab] = useState<'zip' | 'apk' | 'pwa'>('zip');
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (type: 'zip' | 'apk', flavor: 'umng' | 'jarvis', filename: string) => {
    playUiSound('action');
    const itemKey = `${type}-${flavor}`;
    setDownloadingItem(itemKey);

    const url = type === 'zip' ? `/api/download-zip/${flavor}` : `/api/download-apk/${flavor}`;

    // Trigger browser direct download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingItem(null);
    }, 2500);
  };

  return (
    <div
      id="apk-download-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div
        id="apk-download-modal-box"
        className={`w-full max-w-2xl border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl text-left max-h-[90vh] overflow-y-auto ${
          isJarvis
            ? 'bg-[#050c18] border-[#00e5ff40] shadow-[0_0_80px_rgba(0,229,255,0.2)]'
            : 'bg-[#0e0e13] border-[#ffffff15] shadow-[0_0_80px_rgba(255,45,85,0.15)]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#778899] hover:text-white rounded-full bg-[#ffffff08] hover:bg-[#ffffff15] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              isJarvis
                ? 'bg-[#00e5ff]/15 border-[#00e5ff]/40 text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                : 'bg-[#ff2d55]/15 border-[#ff2d55]/40 text-[#ff2d55] shadow-[0_0_20px_rgba(255,45,85,0.3)]'
            }`}
          >
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase tracking-[0.2em] font-black ${
                  isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
                }`}
              >
                Official Distribution Packages
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                v2.4.0 ZIP & APK
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Download J.A.R.V.I.S. & UMNG AI
            </h2>
          </div>
        </div>

        {/* Notice for "Parsing problem error" */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-bold block mb-0.5">
              Fixed Android "Parse Error / Problem parsing package":
            </strong>
            Android phones require strict APK signing certificates. Use the <strong>.ZIP Package</strong> below or <strong>1-Tap Install (WebAPK)</strong> to run seamlessly without parsing errors!
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#13131c] rounded-xl border border-[#ffffff08] mb-5">
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'zip'
                ? isJarvis
                  ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'bg-[#ff2d55] text-white shadow-[0_0_15px_rgba(255,45,85,0.4)]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>.ZIP Packages (Recommended)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-[#ffffff15] text-white shadow'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Direct .APK Files</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-[#ffffff15] text-white shadow'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant 1-Tap WebAPK</span>
          </button>
        </div>

        {/* Tab 1: ZIP PACKAGES (Recommended) */}
        {activeTab === 'zip' && (
          <div className="space-y-4 mb-5">
            {/* J.A.R.V.I.S. ZIP Card */}
            <div className="p-5 rounded-2xl bg-[#061224] border border-[#00e5ff]/40 hover:border-[#00e5ff]/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff] shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">
                      J.A.R.V.I.S. Protocol (.ZIP)
                    </h3>
                    <span className="text-[10px] font-mono bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-0.5 rounded border border-[#00e5ff]/20">
                      ZIP Archive
                    </span>
                  </div>
                  <p className="text-xs text-[#88a8cc] leading-relaxed mb-2">
                    Complete package with full Android Studio source, offline WebView launcher, assets, and holographic calling matrix.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#00ff9d]">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> No Parsing Error
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Android Studio Ready
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Offline Launcher Included
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="btn-download-jarvis-zip"
                onClick={() => handleDownload('zip', 'jarvis', 'jarvis-stark-assistant.zip')}
                disabled={downloadingItem === 'zip-jarvis'}
                className="shrink-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#00e5ff] hover:bg-[#33ebff] active:scale-95 text-black font-bold text-xs shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
              >
                {downloadingItem === 'zip-jarvis' ? (
                  <>
                    <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                    <span>Downloading ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download J.A.R.V.I.S. (.zip)</span>
                  </>
                )}
              </button>
            </div>

            {/* UMNG AI ZIP Card */}
            <div className="p-5 rounded-2xl bg-[#14141d] border border-[#ff2d55]/40 hover:border-[#ff2d55]/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#ff2d55]/20 border border-[#ff2d55]/40 flex items-center justify-center text-[#ff2d55] shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">
                      UMNG AI Assistant (.ZIP)
                    </h3>
                    <span className="text-[10px] font-mono bg-[#ffffff08] text-[#ccc] px-2 py-0.5 rounded border border-[#ffffff10]">
                      ZIP Archive
                    </span>
                  </div>
                  <p className="text-xs text-[#999] leading-relaxed mb-2">
                    Complete package with multi-persona voice engine, live streaming audio drivers, and full Android project.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#00ff9d]">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> No Parsing Error
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Full Source & Manifest
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="btn-download-umng-zip"
                onClick={() => handleDownload('zip', 'umng', 'umng-ai-assistant.zip')}
                disabled={downloadingItem === 'zip-umng'}
                className="shrink-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ec4899] hover:opacity-90 active:scale-95 text-white font-bold text-xs shadow-[0_0_20px_rgba(255,45,85,0.3)] transition-all cursor-pointer"
              >
                {downloadingItem === 'zip-umng' ? (
                  <>
                    <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                    <span>Downloading ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download UMNG AI (.zip)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: DIRECT APK FILES */}
        {activeTab === 'apk' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* J.A.R.V.I.S. APK / jjj.apk */}
            <div className="p-4 rounded-2xl bg-[#061224] border border-[#00e5ff]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">J.A.R.V.I.S. (jjj.apk)</span>
                  <span className="text-[10px] font-mono text-[#00e5ff]">29.1 MB</span>
                </div>
                <p className="text-[11px] text-[#88a8cc] mb-3">
                  Direct standalone Android package (<strong>jjj.apk</strong>) with Iron Man tactical HUD & live voice.
                </p>
              </div>
              <button
                id="btn-download-jjj-apk"
                onClick={() => handleDownload('apk', 'jarvis', 'jjj.apk')}
                disabled={downloadingItem === 'apk-jarvis'}
                className="w-full py-2.5 px-3 rounded-xl bg-[#00e5ff] text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download jjj.apk</span>
              </button>
            </div>

            {/* UMNG AI APK */}
            <div className="p-4 rounded-2xl bg-[#14141d] border border-[#ff2d55]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">UMNG AI Assistant</span>
                  <span className="text-[10px] font-mono text-[#ff2d55]">28.4 MB</span>
                </div>
                <p className="text-[11px] text-[#aaa] mb-3">
                  Direct standalone Android package (.apk) with emotional persona voice engine.
                </p>
              </div>
              <button
                onClick={() => handleDownload('apk', 'umng', 'umng-ai-assistant.apk')}
                disabled={downloadingItem === 'apk-umng'}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ec4899] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: INSTANT 1-TAP WEB APK */}
        {activeTab === 'pwa' && (
          <div className="p-5 rounded-2xl bg-[#0b172a] border border-[#00ff9d]/30 mb-5 text-xs text-[#a0c8e8] space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap className="w-4 h-4 text-[#00ff9d]" />
              <span>Instant Native Android App via Chrome (Zero Parsing Errors)</span>
            </div>
            <p>
              You don't need any complex compiler or sideloading to get a native app icon on your phone:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-[#ccddee]">
              <li>Open this page on your Android phone's Google Chrome browser.</li>
              <li>Tap the three dots icon (<strong>⋮</strong>) at the top right of Chrome.</li>
              <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>Android instantly creates the native app with full mic permission and full-screen UI!</li>
            </ol>
          </div>
        )}

        {/* Security & Info Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#ffffff08] text-[11px] text-[#777]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official builds created by Umang Rai • Zero Malware & Ad-free</span>
          </div>
          <span className="font-mono text-[#555]">Gemini Live Engine v2.4</span>
        </div>
      </div>
    </div>
  );
}

