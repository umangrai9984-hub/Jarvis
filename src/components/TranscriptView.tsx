import React, { useEffect, useRef, useState } from 'react';
import { TranscriptItem, AppTheme, AppMode } from '../types';
import { MessageSquare, User, Sparkles, Copy, Check, Shield } from 'lucide-react';
import { THEME_CONFIGS } from '../utils/theme';

interface TranscriptViewProps {
  transcripts: TranscriptItem[];
  currentLiveUserText: string;
  currentLiveModelText: string;
  theme: AppTheme;
  appMode?: AppMode;
  onClear?: () => void;
}

export function TranscriptView({
  transcripts,
  currentLiveUserText,
  currentLiveModelText,
  theme,
  appMode = 'umng',
  onClear,
}: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isJarvis = appMode === 'jarvis';
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.neon_rose;
  const assistantName = isJarvis ? 'J.A.R.V.I.S.' : 'UMNG';

  const handleCopy = () => {
    const text = transcripts
      .slice()
      .reverse()
      .map((t) => `${t.speaker === 'user' ? 'You' : assistantName}: ${t.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="live-transcript-panel"
      className={`w-full flex flex-col border rounded-2xl p-5 sm:p-6 h-full max-h-[460px] transition-all duration-300 ${
        isJarvis
          ? 'bg-[#070e18] border-[#00e5ff20]'
          : 'bg-[#0d0d10] border-[#ffffff10]'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#ffffff08] mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-[10px] uppercase tracking-[0.25em] font-bold ${isJarvis ? 'text-[#00e5ff]' : 'text-[#555]'}`}>
            {isJarvis ? 'Telemetry & Audio Transcripts' : 'Live Speech Transcript'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {transcripts.length > 0 && (
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-[#1a1a1f] hover:bg-[#ffffff10] border border-[#ffffff10] text-[#888] hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy transcript log"
            >
              {copied ? <Check className="w-3 h-3 text-[#00ff9d]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Log'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none flex flex-col-reverse">
        <div ref={bottomRef} />

        {/* Real-time streaming model speech */}
        {currentLiveModelText && (
          <div
            className={`p-3.5 rounded-xl border text-white text-xs animate-pulse ${
              isJarvis
                ? 'border-[#00e5ff]/40 bg-[#00e5ff]/10'
                : 'border-[#ff2d55]/30 bg-[#ff2d55]/10'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px] mb-1 ${
                isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
              }`}
            >
              {isJarvis ? <Shield className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              <span>{assistantName} (Speaking...)</span>
            </div>
            <p className="leading-relaxed font-normal text-[#f0f0f0]">{currentLiveModelText}</p>
          </div>
        )}

        {/* Real-time streaming user speech */}
        {currentLiveUserText && (
          <div className="p-3.5 rounded-xl border border-[#00ff9d]/30 bg-[#00ff9d]/10 text-white text-xs animate-pulse">
            <div className="flex items-center gap-1.5 text-[#00ff9d] font-black uppercase tracking-wider text-[10px] mb-1">
              <User className="w-3 h-3" />
              <span>You (Speaking...)</span>
            </div>
            <p className="leading-relaxed font-normal text-[#f0f0f0]">{currentLiveUserText}</p>
          </div>
        )}

        {/* Completed turns log */}
        {transcripts.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border text-xs transition-all ${
              item.speaker === 'assistant'
                ? isJarvis
                  ? 'border-[#00e5ff]/25 bg-[#00e5ff]/5 text-[#e0e0e0]'
                  : 'border-[#ff2d55]/20 bg-[#ff2d55]/5 text-[#e0e0e0]'
                : 'border-[#ffffff08] bg-[#16161c] text-[#ccc]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                {item.speaker === 'assistant' ? (
                  <>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'
                      }`}
                    >
                      {assistantName}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-[#888] font-bold uppercase tracking-wider">
                      You
                    </span>
                  </>
                )}
              </div>
              <span className="text-[9px] text-[#555] font-mono">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="leading-relaxed">{item.text}</p>
          </div>
        ))}

        {transcripts.length === 0 && !currentLiveUserText && !currentLiveModelText && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-[#555] text-xs">
            <MessageSquare className="w-8 h-8 stroke-[1.5] mb-2 opacity-30 text-[#888]" />
            <p className="font-medium text-[#888]">
              {isJarvis ? 'Tactical Audio Protocol Active' : 'Continuous Audio Link Active'}
            </p>
            <p className="text-[11px] text-[#555] mt-1 max-w-xs">
              Live speech transcripts and captions stream here automatically during conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


