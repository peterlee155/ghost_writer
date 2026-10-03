import React from 'react';
import { Sparkles, ShieldCheck, Zap, Sliders, History, Crown, Star, Radio } from 'lucide-react';
import { UserSubscription } from '../types';
import { PLAN_LIMITS } from '../utils/subscription';
import { UserAuthButton } from './UserAuthButton';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  subscription: UserSubscription;
  onOpenSubscription: () => void;
  onOpenLiveVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  historyCount,
  subscription,
  onOpenSubscription,
  onOpenLiveVoice,
}) => {
  const isFree = subscription.tier === 'free';
  const limits = PLAN_LIMITS[subscription.tier];
  const creditsRemaining = Math.max(0, limits.dailyRuns - subscription.runsUsedToday);

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                GhostWriter
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Humanizer v2.5
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Organic nuances, Live voice assistant & Gemini audio transcription
            </p>
          </div>
        </div>

        {/* Status Indicators, Live Voice, Subscription & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini Live Voice Button */}
          <button
            onClick={onOpenLiveVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition cursor-pointer shadow-sm group"
            title="Real-time Spoken Conversation (gemini-3.8-live)"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition animate-pulse" />
            <span className="font-semibold">Live Voice</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-200">
              Live API
            </span>
          </button>

          {/* Subscription Tier Pill */}
          <button
            onClick={onOpenSubscription}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              isFree
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/50'
                : subscription.tier === 'pro'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/15'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/15'
            }`}
            title="Manage Subscription & Billing"
          >
            {isFree ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-mono text-[11px]">
                  Free: {creditsRemaining} credit{creditsRemaining !== 1 ? 's' : ''} left
                </span>
              </>
            ) : subscription.tier === 'pro' ? (
              <>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-mono text-[11px] font-bold">PRO MEMBER</span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                <span className="font-mono text-[11px] font-bold">TEAM STUDIO</span>
              </>
            )}
          </button>

          {/* Upgrade CTA if on Free Tier */}
          {isFree && (
            <button
              onClick={onOpenSubscription}
              className="relative group overflow-hidden px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition text-xs font-medium cursor-pointer"
            title="Saved Humanized Texts"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          {/* Firebase Google Auth Button */}
          <UserAuthButton onOpenSubscription={onOpenSubscription} />
        </div>
      </div>
    </header>
  );
};
