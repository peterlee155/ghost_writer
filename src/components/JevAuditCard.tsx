import React from 'react';
import { JevSystemOneResult } from '../types';
import { ShieldCheck, AlertTriangle, Zap, CheckCircle2, XCircle, Gauge, HelpCircle } from 'lucide-react';

interface JevAuditCardProps {
  jev: JevSystemOneResult;
  title?: string;
  isHumanized?: boolean;
}

export const JevAuditCard: React.FC<JevAuditCardProps> = ({
  jev,
  title = 'TypeSafe AI • Jev System One Verdict',
  isHumanized = false,
}) => {
  const { answers, latencyMs, model } = jev;
  const isHuman = answers.origin.choice === 'human';

  const humanPct = Math.round(answers.origin.probabilities.human * 100);
  const aiPct = Math.round(answers.origin.probabilities.ai * 100);

  return (
    <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                TypeSafe AI • Jev
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                System One Model
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Fast, schema-constrained probabilistic judgment • Cannot hallucinate format
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <Gauge className="w-3 h-3 text-emerald-400" />
          <span>{latencyMs}ms inference</span>
        </div>
      </div>

      {/* Primary Decision Banner */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between ${
          isHuman
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isHuman ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Typed Choice:</span>
              <span className="font-mono uppercase px-1.5 py-0.5 rounded bg-black/40">
                {answers.origin.choice}
              </span>
              <span className="text-[11px] font-normal text-zinc-400">
                ({isHuman ? 'Organically Human' : 'Synthetic AI Generation'})
              </span>
            </div>
            <p className="text-[10px] opacity-80 mt-0.5">
              Confidence: {Math.round(answers.origin.confidence * 100)}% • Probability: {isHuman ? humanPct : aiPct}%
            </p>
          </div>
        </div>

        {/* Probability pill */}
        <div className="text-right">
          <span className="text-sm font-mono font-bold block">
            {isHuman ? `${humanPct}% Human` : `${aiPct}% AI`}
          </span>
          <span className="text-[9px] font-mono opacity-70">
            P(human)={answers.origin.probabilities.human.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Typed Questions Output Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Question 1: Authenticity Score (0-4) */}
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300">
              Q: Authenticity Rating
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              Score: {answers.humanAuthenticity.score} / 4
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-snug">
            {answers.humanAuthenticity.label}
          </p>

          {/* Probability Distribution across 5 score buckets */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] font-mono text-zinc-500 block">
              Probability Distribution:
            </span>
            <div className="grid grid-cols-5 gap-1">
              {answers.humanAuthenticity.probabilities.map((p, idx) => {
                const isActive = idx === answers.humanAuthenticity.score;
                return (
                  <div
                    key={idx}
                    className={`p-1 text-center rounded border transition ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <div className="text-[8px] font-mono">{idx}</div>
                    <div className="text-[9px] font-mono">{Math.round(p * 100)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question 2: Has AI Markers (Noul: Boolean) */}
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-300">
                Q: Has AI Markers? (Noul)
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  answers.hasAiMarkers.noul
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {answers.hasAiMarkers.noul ? 'YES (Detected)' : 'NO (Clear)'}
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 mt-1.5 leading-snug">
              {answers.hasAiMarkers.noul
                ? 'Robotic symmetry, flat sentence lengths, or AI buzzwords present.'
                : 'Text lacks repetitive machine cadence and symmetric clauses.'}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>P(yes): {answers.hasAiMarkers.probabilities.yes}</span>
            <span>P(no): {answers.hasAiMarkers.probabilities.no}</span>
            <span>Conf: {Math.round(answers.hasAiMarkers.confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Footer Info on Jev */}
      <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/60">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-zinc-400" />
          <span>Evaluated via Jev discriminative parallel pass</span>
        </span>
        <span className="font-mono text-zinc-400">SDK: @typesafe-ai/sdk</span>
      </div>
    </div>
  );
};
