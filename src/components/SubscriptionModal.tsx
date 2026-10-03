import React, { useState } from 'react';
import { PlanTier, UserSubscription } from '../types';
import { PLAN_LIMITS, PRICING_PLANS, saveSubscription } from '../utils/subscription';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  X,
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Lock,
  Download,
  AlertCircle
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (newSub: UserSubscription) => void;
  initialSelectedTier?: PlanTier;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  initialSelectedTier = 'pro',
}) => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>(
    subscription.billingInterval || 'annual'
  );
  const [processingTier, setProcessingTier] = useState<PlanTier | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'billing'>('plans');

  if (!isOpen) return null;

  const currentTier = subscription.tier;
  const currentLimits = PLAN_LIMITS[currentTier];

  const handleSelectPlan = (tier: PlanTier) => {
    if (tier === currentTier) return;

    setProcessingTier(tier);
    setTimeout(() => {
      const updated: UserSubscription = {
        ...subscription,
        tier,
        billingInterval,
        status: 'active',
        renewalDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      saveSubscription(updated);
      onUpdateSubscription(updated);
      setProcessingTier(null);
      setCheckoutSuccess(
        tier === 'free'
          ? 'Switched to Free Starter tier.'
          : `🎉 Successfully subscribed to ${tier.toUpperCase()} Plan! Unlimited features unlocked.`
      );
      setTimeout(() => {
        setCheckoutSuccess(null);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl shadow-black/80 my-8 overflow-hidden flex flex-col">
        {/* Top Gradient Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>GhostWriter Subscription & Plans</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  SaaS Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Unlock unlimited essay word counts, all 6 human voice personas & priority bypass processing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Plans vs Billing Details */}
            <div className="hidden sm:flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'plans'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pricing Plans
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'billing'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Account & Usage
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner if upgraded */}
        {checkoutSuccess && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{checkoutSuccess}</span>
          </div>
        )}

        {/* Tab 1: Pricing Plans */}
        {activeTab === 'plans' ? (
          <div className="p-6 space-y-6">
            {/* Monthly / Annual Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-100">Billing Cycle:</span>
                <span>Annual plans include 2 months free + priority queue</span>
              </div>

              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs transition ${
                    billingInterval === 'monthly'
                      ? 'bg-zinc-800 text-white font-medium shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('annual')}
                  className={`px-3 py-1 rounded-lg text-xs transition flex items-center gap-1.5 ${
                    billingInterval === 'annual'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-black/40 text-amber-200 uppercase">
                    Save 35%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRICING_PLANS.map((plan) => {
                const isCurrent = currentTier === plan.tier;
                const isPro = plan.tier === 'pro';
                const price =
                  billingInterval === 'annual'
                    ? Math.round(plan.annualPrice / 12)
                    : plan.monthlyPrice;

                return (
                  <div
                    key={plan.tier}
                    className={`relative rounded-2xl p-5 flex flex-col justify-between border transition ${
                      isCurrent
                        ? 'bg-zinc-900/80 border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : isPro
                        ? 'bg-zinc-900/50 border-amber-500/30 hover:border-amber-500/60'
                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 mb-4 min-h-[32px] leading-relaxed">
                        {plan.tagline}
                      </p>

                      {/* Price Display */}
                      <div className="mb-4 pb-4 border-b border-zinc-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                            ${price}
                          </span>
                          <span className="text-xs text-zinc-400">/ month</span>
                        </div>
                        {billingInterval === 'annual' && plan.annualPrice > 0 && (
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                            Billed annually (${plan.annualPrice}/yr)
                          </span>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-6">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Included Features:
                        </span>
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug text-[11px]">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.tier)}
                      disabled={isCurrent || processingTier !== null}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-zinc-800 text-zinc-400 cursor-default border border-zinc-700/60'
                          : isPro
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-lg shadow-amber-500/20 active:scale-98'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                      }`}
                    >
                      {processingTier === plan.tier ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span>Current Plan</span>
                        </>
                      ) : (
                        <>
                          <span>{plan.cta}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Satisfaction Guarantee Notice */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-zinc-200">100% Anti-Detector Guarantee:</strong> Bypasses GPTZero, Turnitin, CopyLeaks & Winston AI with authentic human burstiness & tangents.
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Cancel or switch tiers anytime in 1 click
              </span>
            </div>
          </div>
        ) : (
          /* Tab 2: Account & Usage Details */
          <div className="p-6 space-y-6">
            {/* Current Subscription Status Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Active Membership
                  </span>
                  <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2 mt-0.5">
                    <span>{subscription.tier} Plan</span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-zinc-400 block">Renews on</span>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {subscription.renewalDate}
                  </span>
                </div>
              </div>

              {/* Usage Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Daily Runs Used
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-mono font-bold text-white">
                      {subscription.runsUsedToday}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      / {currentLimits.unlimitedRuns ? 'Unlimited' : `${currentLimits.dailyRuns} runs`}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Max Words Per Run
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {currentLimits.maxWordsPerRun.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">words</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Total Words Humanized
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {(subscription.totalWordsHumanized || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method & Mock Billing History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Payment Method & Invoices
              </h4>

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">
                      Visa ending in 4242 (Stripe Billing Ready)
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Expires 12/28 • Default Payment Method
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('plans')}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
                >
                  Change Plan
                </button>
              </div>

              {/* Sample Invoices */}
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl divide-y divide-zinc-800/60 overflow-hidden text-xs">
                <div className="p-3 flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span>GhostWriter Pro Subscription — {subscription.billingInterval}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-zinc-200">
                      ${subscription.tier === 'team' ? 49 : subscription.tier === 'pro' ? 19 : 0}.00
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      PAID
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/40 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>256-bit Encrypted SaaS Billing Pipeline</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
