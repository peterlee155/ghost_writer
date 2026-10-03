import React from 'react';

interface XRayViewProps {
  text: string;
}

export const XRayView: React.FC<XRayViewProps> = ({ text }) => {
  if (!text) {
    return (
      <div className="p-4 text-center text-zinc-500 text-xs italic">
        Generate humanized text to view the Humanizer X-Ray inspection.
      </div>
    );
  }

  // Regex to detect parenthetical tangents, typos/slips, and informal slang
  // 1. Tangents: ( ... ) or — ... —
  // 2. Typos & dropped apostrophes: \b(dont|cant|wont|didnt|isnt|arent|youre|im|ive|id|thats|whats|teh|thier|wierd|definetly|seperate|alot|prolly|gonna|kinda)\b
  // 3. Conversational connectors: \b(honestly|tbh|look|i mean|lowkey|ngl|anyway)\b

  const tokens = text.split(/(\([^)]+\)|—[^—]+—|\b(?:dont|cant|wont|didnt|isnt|arent|youre|im|ive|id|thats|whats|teh|thier|wierd|definetly|seperate|alot|prolly|gonna|kinda)\b|\b(?:honestly|tbh|look|i mean|lowkey|ngl|anyway)\b)/gi);

  return (
    <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-3 font-sans text-sm leading-relaxed text-zinc-200">
      <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-zinc-800 text-[10px] font-mono">
        <span className="text-zinc-400 font-semibold uppercase tracking-wider">X-Ray Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/40 inline-block" />
          <span className="text-cyan-300">Natural Tangent / Aside</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40 inline-block" />
          <span className="text-amber-300">Casual Slip / Typo</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
          <span className="text-emerald-300">Informal Transition</span>
        </span>
      </div>

      <div className="space-y-2 whitespace-pre-wrap">
        {tokens.map((token, idx) => {
          if (!token) return null;

          // Tangent
          if (/^\(.*\)$|^—.*—$/.test(token)) {
            return (
              <span
                key={idx}
                className="bg-cyan-500/15 text-cyan-200 border-b border-cyan-400/50 px-1 py-0.5 rounded cursor-help font-medium transition hover:bg-cyan-500/25"
                title="Organic tangent: disrupts predictable AI flow"
              >
                {token}
              </span>
            );
          }

          // Typo / slip
          if (/^(dont|cant|wont|didnt|isnt|arent|youre|im|ive|id|thats|whats|teh|thier|wierd|definetly|seperate|alot|prolly|gonna|kinda)$/i.test(token)) {
            return (
              <span
                key={idx}
                className="bg-amber-500/20 text-amber-200 border-b border-amber-400/60 px-1 py-0.5 rounded cursor-help font-mono font-medium transition hover:bg-amber-500/30"
                title="Casual imperfection: completely destroys synthetic AI uniformity"
              >
                {token}
              </span>
            );
          }

          // Informal transition
          if (/^(honestly|tbh|look|i mean|lowkey|ngl|anyway)$/i.test(token)) {
            return (
              <span
                key={idx}
                className="bg-emerald-500/20 text-emerald-200 border-b border-emerald-400/60 px-1 py-0.5 rounded cursor-help font-medium transition hover:bg-emerald-500/30"
                title="Conversational shift: breaks robotic thesis structure"
              >
                {token}
              </span>
            );
          }

          return <span key={idx}>{token}</span>;
        })}
      </div>
    </div>
  );
};
