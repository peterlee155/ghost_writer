import React from 'react';
import { Sparkles, Zap, ShieldCheck, X, ArrowRight, Lock, Check } from 'lucide-react';

interface PaywallPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscription: () => void;
  title?: string;
  reason: 'word_limit' | 'credits_exceeded' | 'locked_persona' | 'feature_locked';
  wordCount?: number;
  maxWords?: number;
}

export const PaywallPrompt: React.FC<PaywallPromptProps> = ({
  isOpen,
  onClose,
  onOpenSubscription,
  title,
  reason,
  wordCount = 0,
  maxWords = 250,
}) => {
  if (!isOpen) return null;

  let heading = title || 'Unlock GhostWriter Pro';
  let description =
    'Upgrade to GhostWriter Pro to unlock unlimited words, all human personas, and full detector bypass power.';

  if (reason === 'word_limit') {
    heading = `Word Limit Exceeded (${wordCount} words)`;
    description = `Free Starter tier supports up to ${maxWords} words per run. Upgrade to Pro to humanize full essays, papers, and up to 2,500 words in a single click!`;
  } else if (reason === 'credits_exceeded') {
    heading = 'Daily Free Credits Depleted (5/5)';
    description =
      'You have used all 5 free daily runs. Upgrade to GhostWriter Pro for unlimited humanizations with zero daily quotas!';
  } else if (reason === 'locked_persona') {
    heading = 'Pro Human Persona Locked';
    description =
      'This conversational voice persona requires a Pro membership. Upgrade to Pro to access all 6 human voice engines!';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-black/90 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {heading}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Benefits List */}
        <div className="my-5 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Included in Pro:
          </span>
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Up to 2,500 words per run (full essays & chapters)</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Unlimited daily humanizations & priority queue</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>All 6 human personas (Coffee Chat, Reddit, Slack DM)</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>TypeSafe AI Jev System One full audit verification</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenSubscription();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Subscription Plans ($19/mo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
