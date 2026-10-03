import React from 'react';

interface SentenceLengthChartProps {
  originalDistribution: number[];
  humanizedDistribution: number[];
}

export const SentenceLengthChart: React.FC<SentenceLengthChartProps> = ({
  originalDistribution,
  humanizedDistribution,
}) => {
  const maxOriginal = Math.max(...originalDistribution, 20);
  const maxHumanized = Math.max(...humanizedDistribution, 20);
  const overallMax = Math.max(maxOriginal, maxHumanized, 30);

  return (
    <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-200">Sentence Burstiness Visualizer</h4>
          <p className="text-[11px] text-zinc-400">
            AI detectors flag flat, monotonous sentence lengths. Humans write with erratic bursts.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/80 inline-block" />
            <span className="text-zinc-400">Original AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
            <span className="text-zinc-300">Humanized</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Original Distribution */}
        <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Original Sentences ({originalDistribution.length})</span>
            <span className="font-mono text-zinc-500 text-[10px]">Word count per sentence</span>
          </div>
          <div className="h-20 flex items-end gap-1.5 pt-2">
            {originalDistribution.length === 0 ? (
              <div className="w-full text-center text-zinc-600 text-xs py-6 font-mono">
                No sentence data
              </div>
            ) : (
              originalDistribution.map((len, idx) => {
                const heightPercent = Math.max(8, (len / overallMax) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-rose-500/50 group-hover:bg-rose-500 rounded-t transition-all"
                    />
                    <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300">
                      {len}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Humanized Distribution */}
        <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">
              Humanized Sentences ({humanizedDistribution.length})
            </span>
            <span className="font-mono text-emerald-500/80 text-[10px]">Natural jagged spikes</span>
          </div>
          <div className="h-20 flex items-end gap-1.5 pt-2">
            {humanizedDistribution.length === 0 ? (
              <div className="w-full text-center text-zinc-600 text-xs py-6 font-mono">
                Click Humanize to see burst graph
              </div>
            ) : (
              humanizedDistribution.map((len, idx) => {
                const heightPercent = Math.max(8, (len / overallMax) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-emerald-500/60 group-hover:bg-emerald-400 rounded-t transition-all"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 group-hover:text-emerald-300">
                      {len}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
