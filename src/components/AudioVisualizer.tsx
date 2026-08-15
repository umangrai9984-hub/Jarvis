import { AppTheme } from '../types';

interface AudioVisualizerProps {
  inputVolume: number;
  outputVolume: number;
  theme: AppTheme;
  isConnected: boolean;
}

export function AudioVisualizer({
  inputVolume,
  outputVolume,
  theme,
  isConnected,
}: AudioVisualizerProps) {
  const barCount = 20;
  const currentLevel = Math.max(outputVolume * 1.8, inputVolume * 1.4);

  return (
    <div
      id="audio-visualizer-panel"
      className="w-full max-w-lg mx-auto bg-[#1a1a24] border border-[#ffffff08] rounded-2xl p-4 shadow-xl"
    >
      <div className="flex items-center justify-between mb-3 text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-2">
          <span className="text-[#888]">Audio Input / Output</span>
          <span className="text-[#555] font-mono font-normal">|</span>
          <span className="text-[#777] font-mono font-normal">
            Mic {isConnected ? `${Math.round(inputVolume * 100)}%` : '0%'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-[#00ff9d] shadow-[0_0_6px_#00ff9d]' : 'bg-[#555]'
            }`}
          />
          <span className={isConnected ? 'text-[#00ff9d]' : 'text-[#666]'}>
            {isConnected ? 'Syncing' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Waveform Equalizer Bars */}
      <div className="flex items-end justify-center gap-1.5 h-10 px-1">
        {Array.from({ length: barCount }).map((_, i) => {
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const factor = Math.cos(centerDist * Math.PI * 0.5);
          const jitter = Math.sin((i + Date.now() / 180) * 0.7) * 0.2;
          const activeHeight = isConnected
            ? Math.max(10, Math.min(100, (currentLevel * factor + jitter * currentLevel) * 130))
            : 8;

          const isHigh = activeHeight > 45;

          return (
            <div
              key={i}
              className={`flex-1 rounded-xs transition-all duration-75 ${
                isConnected
                  ? isHigh
                    ? 'bg-[#ff2d55] shadow-[0_0_8px_rgba(255,45,85,0.6)]'
                    : 'bg-[#ff2d55]/70'
                  : 'bg-[#222228]'
              }`}
              style={{
                height: `${activeHeight}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

