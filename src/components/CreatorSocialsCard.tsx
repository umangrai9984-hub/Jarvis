import { useState } from 'react';
import {
  Instagram,
  Youtube,
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  Crown,
  Sparkles,
  PhoneCall,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { UMANG_RAI_SOCIALS } from '../utils/creatorAndContacts';
import { AppMode, AppTheme } from '../types';

interface CreatorSocialsCardProps {
  appMode: AppMode;
  theme: AppTheme;
  onCallCreator?: () => void;
}

export function CreatorSocialsCard({ appMode, onCallCreator }: CreatorSocialsCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const isJarvis = appMode === 'jarvis';

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div
      id="creator-socials-card"
      className={`w-full rounded-2xl border p-5 sm:p-6 transition-all duration-300 relative overflow-hidden ${
        isJarvis
          ? 'bg-[#050b16] border-[#00e5ff30] shadow-[0_0_35px_rgba(0,229,255,0.08)]'
          : 'bg-[#0d0d12] border-[#ffffff12] shadow-xl'
      }`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isJarvis ? 'bg-[#00e5ff]' : 'bg-[#ff2d55]'
        }`}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              isJarvis
                ? 'bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]'
                : 'bg-[#ff2d55]/10 border-[#ff2d55]/30 text-[#ff2d55]'
            }`}
          >
            {isJarvis ? <Crown className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white tracking-wide">Umang Rai</h4>
              <ShieldCheck className={`w-3.5 h-3.5 ${isJarvis ? 'text-[#00e5ff]' : 'text-[#ff2d55]'}`} />
            </div>
            <p className="text-[11px] text-[#888] font-medium">Master Architect, Visionary & Owner</p>
          </div>
        </div>

        {onCallCreator && (
          <button
            id="call-creator-btn"
            onClick={onCallCreator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              isJarvis
                ? 'bg-[#00e5ff] hover:bg-[#33ebff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'bg-gradient-to-r from-[#ff2d55] to-[#ff375f] hover:brightness-110 text-white shadow-[0_0_15px_rgba(255,45,85,0.4)]'
            }`}
            title="Direct Holographic Comms to Umang Rai"
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span>Call Umang</span>
          </button>
        )}
      </div>

      <p className="text-xs text-[#aaa] leading-relaxed mb-4">
        Connect directly with the creator of UMNG Assistant & J.A.R.V.I.S. Protocol across official channels:
      </p>

      {/* Social Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Instagram */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            isJarvis
              ? 'bg-[#0a1424] border-[#00e5ff20] hover:border-[#00e5ff50]'
              : 'bg-[#15151c] border-[#ffffff08] hover:border-[#ffffff20]'
          }`}
        >
          <a
            href={UMANG_RAI_SOCIALS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 truncate flex-1 hover:text-white group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Instagram className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <span className="text-[10px] uppercase font-bold text-[#777] block tracking-wider">Instagram</span>
              <span className="text-xs font-semibold text-[#ddd] group-hover:text-[#ff2d55] truncate block">
                {UMANG_RAI_SOCIALS.instagram.handle}
              </span>
            </div>
          </a>

          <a
            href={UMANG_RAI_SOCIALS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-[#666] hover:text-white transition-colors"
            title="Open Instagram"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Discord */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            isJarvis
              ? 'bg-[#0a1424] border-[#00e5ff20] hover:border-[#00e5ff50]'
              : 'bg-[#15151c] border-[#ffffff08] hover:border-[#ffffff20]'
          }`}
        >
          <div className="flex items-center gap-2 truncate flex-1">
            <div className="w-7 h-7 rounded-lg bg-[#5865f2] flex items-center justify-center text-white shrink-0 shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <span className="text-[10px] uppercase font-bold text-[#777] block tracking-wider">Discord</span>
              <span className="text-xs font-semibold text-[#ddd] truncate block">
                {UMANG_RAI_SOCIALS.discord.handle}
              </span>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(UMANG_RAI_SOCIALS.discord.tag, 'discord')}
            className={`p-1.5 rounded-md transition-all ${
              copiedKey === 'discord'
                ? 'text-[#00ff9d] bg-[#00ff9d]/10'
                : 'text-[#888] hover:text-white hover:bg-[#ffffff10]'
            }`}
            title="Copy Discord Username"
          >
            {copiedKey === 'discord' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* YouTube */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            isJarvis
              ? 'bg-[#0a1424] border-[#00e5ff20] hover:border-[#00e5ff50]'
              : 'bg-[#15151c] border-[#ffffff08] hover:border-[#ffffff20]'
          }`}
        >
          <a
            href={UMANG_RAI_SOCIALS.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 truncate flex-1 hover:text-white group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#ff0000] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <span className="text-[10px] uppercase font-bold text-[#777] block tracking-wider">YouTube</span>
              <span className="text-xs font-semibold text-[#ddd] group-hover:text-[#ff0000] truncate block">
                {UMANG_RAI_SOCIALS.youtube.handle}
              </span>
            </div>
          </a>

          <a
            href={UMANG_RAI_SOCIALS.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-[#666] hover:text-white transition-colors"
            title="Open YouTube"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
