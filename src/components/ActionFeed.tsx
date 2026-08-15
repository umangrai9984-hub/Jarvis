import { ToolCallItem, ActiveTimer, QuickNote, AppTheme } from '../types';
import {
  ExternalLink,
  Search,
  Timer as TimerIcon,
  StickyNote,
  Dices,
  Coins,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ActionFeedProps {
  toolCalls: ToolCallItem[];
  activeTimers: ActiveTimer[];
  notes: QuickNote[];
  lastActionResult: string | null;
  theme: AppTheme;
  onDismissTimer: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export function ActionFeed({
  toolCalls,
  activeTimers,
  notes,
  lastActionResult,
  theme,
  onDismissTimer,
  onDeleteNote,
}: ActionFeedProps) {
  const getToolIcon = (name: string, args: Record<string, any>) => {
    if (name === 'openWebsite') return ExternalLink;
    if (name === 'searchWeb') return Search;
    if (name === 'triggerAction') {
      const type = args?.actionType;
      if (type === 'set_timer') return TimerIcon;
      if (type === 'save_note') return StickyNote;
      if (type === 'flip_coin') return Coins;
      if (type === 'roll_dice') return Dices;
    }
    return Sparkles;
  };

  return (
    <div
      id="action-feed-container"
      className="w-full flex flex-col gap-5 bg-[#0d0d10] border border-[#ffffff10] rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center justify-between border-b border-[#ffffff08] pb-3">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#555] font-bold">
            Execution Logs & Tools
          </h3>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-wider text-[#ff2d55] bg-[#ff2d55]/10 px-2 py-0.5 rounded border border-[#ff2d55]/20 font-bold">
          Live Actions
        </span>
      </div>

      {/* Active Live Timers Section */}
      {activeTimers.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#fbbf24]" />
            <span>Active Countdown Timers</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeTimers.map((timer) => {
              const minutes = Math.floor(timer.remainingSeconds / 60);
              const seconds = timer.remainingSeconds % 60;
              const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
              const progress =
                timer.totalSeconds > 0
                  ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100
                  : 100;

              return (
                <div
                  key={timer.id}
                  className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                    timer.remainingSeconds === 0
                      ? 'bg-[#fbbf24]/10 border-[#fbbf24]/40 text-[#fbbf24]'
                      : 'bg-[#16161c] border-[#ffffff08] text-[#e0e0e0]'
                  }`}
                >
                  <div
                    className="absolute bottom-0 left-0 top-0 bg-[#fbbf24]/10 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="relative flex items-center justify-between z-10">
                    <div>
                      <div className="text-xs font-semibold text-[#ccc]">{timer.label}</div>
                      <div className="text-xl font-bold font-mono tracking-tight text-[#fbbf24]">
                        {formatted}
                      </div>
                    </div>
                    <button
                      onClick={() => onDismissTimer(timer.id)}
                      className="p-1 rounded-lg text-[#666] hover:text-white hover:bg-[#ffffff10] transition-colors cursor-pointer"
                      title="Dismiss timer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Notes Scratchpad */}
      {notes.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold flex items-center gap-1.5">
            <StickyNote className="w-3 h-3 text-[#ff2d55]" />
            <span>Voice-Saved Scratchpad</span>
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between gap-2 p-3 rounded-xl bg-[#16161c] border border-[#ffffff05] text-xs text-[#ccc]"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#e0e0e0] leading-relaxed">{note.text}</p>
                  <span className="text-[10px] text-[#666] font-mono mt-1 block">
                    {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-[#666] hover:text-[#ff2d55] p-1 cursor-pointer transition-colors"
                  title="Delete note"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Call History / Executed Actions */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-[#00ff9d]" />
          <span>Execution Stream</span>
        </div>

        {toolCalls.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#16161c] border border-dashed border-[#ffffff08] text-center text-xs text-[#666] leading-relaxed">
            UMNG handles browser actions in real-time. Try saying: "Open YouTube", "Search latest movies", or "Flip a coin"!
          </div>
        ) : (
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {toolCalls.map((call) => {
              const Icon = getToolIcon(call.name, call.args);
              const urlToOpen =
                call.name === 'openWebsite'
                  ? call.args?.url
                  : call.name === 'searchWeb'
                  ? `https://www.google.com/search?q=${encodeURIComponent(call.args?.query || '')}`
                  : null;

              return (
                <div
                  key={call.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#16161c] border border-[#ffffff05] hover:border-[#ffffff10] text-xs transition-all"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_5px_#3b82f6] shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#555] font-bold uppercase font-mono">
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-xs text-[#ccc]">
                        Tool: <span className="text-[#3b82f6] font-mono">{call.name}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-[#888] mt-1 truncate">
                      {call.resultDescription || JSON.stringify(call.args)}
                    </p>

                    {urlToOpen && (
                      <a
                        href={urlToOpen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded bg-[#ff2d55]/10 hover:bg-[#ff2d55]/20 text-[#ff2d55] border border-[#ff2d55]/25 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <span>Open Target</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

