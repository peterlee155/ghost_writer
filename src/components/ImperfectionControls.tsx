import React from 'react';
import { HumanizeOptions, TangentLevel, BurstinessLevel } from '../types';
import { Sliders, Shuffle, CornerDownRight, Keyboard, Compass, Activity } from 'lucide-react';

interface ImperfectionControlsProps {
  options: HumanizeOptions;
  onChange: (options: HumanizeOptions) => void;
}

export const ImperfectionControls: React.FC<ImperfectionControlsProps> = ({ options, onChange }) => {
  const handleTypoRateChange = (rate: number) => {
    onChange({
      ...options,
      typoRate: rate,
      includeTypos: rate > 0,
    });
  };

  const handleTangentChange = (level: TangentLevel) => {
    onChange({ ...options, tangentLevel: level });
  };

  const handleBurstinessChange = (level: BurstinessLevel) => {
    onChange({ ...options, burstiness: level });
  };

  const handleLowercaseToggle = () => {
    onChange({ ...options, allowCasualLower: !options.allowCasualLower });
  };

  // Helper text for typo rate
  const getTypoLabel = (rate: number) => {
    if (rate === 0) return 'Primacy Clean (0%)';
    if (rate <= 3) return 'Subtle Slips (3%) - apostrophe drops';
    if (rate <= 6) return 'Natural Casual (6%) - "teh", "dont", "wierd"';
    if (rate <= 10) return 'Messy Typist (10%) - transpositions & slips';
    return 'Raw Mobile Typing (15%) - heavy human mess';
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Imperfection & Humanizer Levers
            </h3>
            <p className="text-[11px] text-zinc-400">
              Dial in the human flaws that break algorithmic AI detection patterns
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700">
          Anti-GPTZero Tuning
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Lever 1: Casual Typos & Keyboard Slips */}
        <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Mess It Up (Casual Typos)</span>
            </label>
            <span className="text-[11px] font-mono font-medium text-amber-400">
              {options.typoRate}%
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-snug">
            {getTypoLabel(options.typoRate)}
          </p>

          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={options.typoRate}
            onChange={(e) => handleTypoRateChange(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
            <span>0% Clean</span>
            <span>6% Ideal</span>
            <span>15% Messy</span>
          </div>

          {/* Typo samples preview pill */}
          <div className="pt-1 flex flex-wrap gap-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
              teh
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
              dont
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
              definetly
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
              wierd
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
              prolly
            </span>
          </div>
        </div>

        {/* Lever 2: Tangents & Detours */}
        <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subtle Tangents & Asides</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-400 capitalize">
              {options.tangentLevel}
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-snug">
            {options.tangentLevel === 'none' && 'Strict focus, no cognitive detours'}
            {options.tangentLevel === 'subtle' && '1 brief parenthetical or casual aside'}
            {options.tangentLevel === 'conversational' && '2-3 organic detours & self-corrections'}
            {options.tangentLevel === 'rambly' && 'Stream-of-consciousness human flow'}
          </p>

          <div className="grid grid-cols-4 gap-1 pt-1">
            {(['none', 'subtle', 'conversational', 'rambly'] as TangentLevel[]).map((level) => {
              const active = options.tangentLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => handleTangentChange(level)}
                  className={`py-1.5 text-[10px] font-medium rounded-lg capitalize transition border ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {level === 'conversational' ? 'Conv.' : level}
                </button>
              );
            })}
          </div>

          <div className="text-[9px] text-zinc-500 italic pt-1 truncate">
            e.g. "(which still sounds fake to me honestly)"
          </div>
        </div>

        {/* Lever 3: Burstiness & Casual Formatting */}
        <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Sentence Burstiness</span>
              </label>
              <span className="text-[10px] font-mono text-sky-400 capitalize">
                {options.burstiness}
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 leading-snug">
              Varies sentence length variance to break uniform AI cadence
            </p>

            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <button
                onClick={() => handleBurstinessChange('balanced')}
                className={`py-1.5 px-2 text-[10px] rounded-lg transition border ${
                  options.burstiness === 'balanced'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                Balanced Flow
              </button>
              <button
                onClick={() => handleBurstinessChange('extreme')}
                className={`py-1.5 px-2 text-[10px] rounded-lg transition border ${
                  options.burstiness === 'extreme'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                Extreme Spikes 🔥
              </button>
            </div>
          </div>

          {/* Lowercase opener toggle */}
          <label className="flex items-center gap-2 pt-2 border-t border-zinc-800/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.allowCasualLower}
              onChange={handleLowercaseToggle}
              className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-zinc-300">
              Casual lowercase opener (e.g. <span className="font-mono text-zinc-400">"honestly..."</span>)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
