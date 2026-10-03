import React from 'react';
import { AnalysisResult } from '../types';
import { ShieldCheck, AlertTriangle, Activity, Zap, FileText, CheckCircle2 } from 'lucide-react';

interface DetectionRadarProps {
  analysis: AnalysisResult;
  title?: string;
  isHumanized?: boolean;
}

export const DetectionRadar: React.FC<DetectionRadarProps> = ({
  analysis,
  title = 'AI Detection Estimate',
  isHumanized = false,
}) => {
  const { score, label, burstiness, detectedBuzzwords, tangentCount, typoCount } = analysis;

  // Color scheme based on AI score (lower score = more human = emerald)
  const isHuman = score < 35;
  const isUncertain = score >= 35 && score < 65;

  const scoreColor = isHuman
    ? 'text-emerald-400'
    : isUncertain
    ? 'text-amber-400'
    : 'text-rose-400';

  const badgeBg = isHuman
    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    : isUncertain
    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-300 border-rose-500/30';

  const meterGradient = isHuman
    ? 'from-emerald-500 to-teal-400'
    : isUncertain
    ? 'from-amber-500 to-orange-400'
    : 'from-rose-600 to-red-500';

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isHuman ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span className="text-xs font-semibold text-zinc-300">{title}</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeBg}`}>
          {label}
        </span>
      </div>

      {/* Progress Bar & Big Score */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-zinc-400">Estimated AI Detector Flag Risk:</span>
          <span className={`text-base font-mono font-bold ${scoreColor}`}>
            {score}% <span className="text-[10px] font-normal text-zinc-500">{isHuman ? 'Human-like' : 'AI-like'}</span>
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${meterGradient}`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-800/60 text-[11px]">
        {/* Burstiness */}
        <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60">
          <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Burstiness</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="font-mono text-zinc-200">{burstiness.variance}</span>
            <span
              className={`text-[9px] font-medium px-1 rounded ${
                burstiness.variance > 30 ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400'
              }`}
            >
              {burstiness.variance > 30 ? 'High' : 'Uniform'}
            </span>
          </div>
        </div>

        {/* AI Buzzwords */}
        <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60">
          <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">AI Clichés</span>
          <div className="flex items-center justify-between mt-0.5">
            <span
              className={`font-mono ${
                detectedBuzzwords.length > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {detectedBuzzwords.reduce((sum, b) => sum + b.count, 0)}
            </span>
            <span className="text-[9px] text-zinc-500">
              {detectedBuzzwords.length > 0 ? 'Detected' : 'Clean'}
            </span>
          </div>
        </div>

        {/* Tangents */}
        <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60">
          <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Human Asides</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="font-mono text-emerald-400">{tangentCount}</span>
            <span className="text-[9px] text-zinc-500">Tangents</span>
          </div>
        </div>

        {/* Casual Typos */}
        <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60">
          <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Casual Slips</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="font-mono text-amber-400">{typoCount}</span>
            <span className="text-[9px] text-zinc-500">Imperfections</span>
          </div>
        </div>
      </div>

      {/* Detected buzzword chips if any */}
      {detectedBuzzwords.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] text-rose-400 font-medium block mb-1">
            Trigger Words Found:
          </span>
          <div className="flex flex-wrap gap-1">
            {detectedBuzzwords.map((b, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono"
              >
                "{b.word}" ({b.count}x)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Jev System One quick badge if available */}
      {analysis.jev && (
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span className="text-zinc-400">TypeSafe AI Jev:</span>
            <span
              className={`font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                analysis.jev.answers.origin.choice === 'human'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {analysis.jev.answers.origin.choice}
            </span>
            <span className="text-zinc-500 font-mono">
              ({Math.round(analysis.jev.answers.origin.probabilities[analysis.jev.answers.origin.choice] * 100)}% prob)
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">
            {analysis.jev.latencyMs}ms System One
          </span>
        </div>
      )}
    </div>
  );
};
