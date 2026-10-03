import { PlanLimits, PlanTier, ToneType, UserSubscription } from '../types';

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxWordsPerRun: 250,
    dailyRuns: 5,
    unlockedTones: ['bro', 'college'],
    canUploadFiles: false,
    canUseCustomBannedWords: false,
    priorityProcessing: false,
    unlimitedRuns: false,
  },
  pro: {
    maxWordsPerRun: 2500,
    dailyRuns: 9999,
    unlockedTones: ['bro', 'reddit', 'college', 'coffee', 'quick_dm', 'work'],
    canUploadFiles: true,
    canUseCustomBannedWords: true,
    priorityProcessing: true,
    unlimitedRuns: true,
  },
  team: {
    maxWordsPerRun: 10000,
    dailyRuns: 9999,
    unlockedTones: ['bro', 'reddit', 'college', 'coffee', 'quick_dm', 'work'],
    canUploadFiles: true,
    canUseCustomBannedWords: true,
    priorityProcessing: true,
    unlimitedRuns: true,
  },
};

export const PRICING_PLANS = [
  {
    tier: 'free' as PlanTier,
    name: 'Free Trial',
    tagline: 'Test the bypass engine with everyday short texts.',
    monthlyPrice: 0,
    annualPrice: 0,
    badge: 'Starter',
    features: [
      '5 Humanizations / day',
      'Up to 250 words per run',
      '2 Core Personas (Casual Bro, College)',
      'Basic Jev System One verdict',
      'Standard anti-detector bypass',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    tier: 'pro' as PlanTier,
    name: 'GhostWriter Pro',
    tagline: 'For students, creators, and professionals needing undetectable long-form essays.',
    monthlyPrice: 19,
    annualPrice: 149,
    badge: 'Most Popular',
    features: [
      'Unlimited Humanizations & credits',
      'Up to 2,500 words per run (Full essays)',
      'All 6 Human Personas unlocked',
      'Extreme Burstiness & Asides Levers',
      'TypeSafe AI Jev Full System One Audit',
      'Document file import (.txt, .md)',
      'Custom Anti-AI Banned Words Scrubber',
      'Priority AI generation queue',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    tier: 'team' as PlanTier,
    name: 'Studio / Team',
    tagline: 'For agencies, content teams, and power users with bulk throughput.',
    monthlyPrice: 49,
    annualPrice: 399,
    badge: 'Powerhouse',
    features: [
      'Everything in Pro',
      'Up to 10,000 words per run (Whole chapters)',
      'Multi-seat collaboration (up to 5 seats)',
      'API Webhook access & Bulk Batch runner',
      'Custom Tone Persona Builder',
      'Dedicated 24/7 priority support',
    ],
    cta: 'Upgrade to Team',
    popular: false,
  },
];

const STORAGE_KEY = 'ghostwriter_subscription_v1';

export function getStoredSubscription(): UserSubscription {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Check if daily reset is needed
      const today = new Date().toISOString().split('T')[0];
      const lastReset = parsed.lastResetDate;
      if (lastReset !== today) {
        parsed.runsUsedToday = 0;
        parsed.lastResetDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Subscription storage read error:', e);
  }

  const defaultSub: UserSubscription & { lastResetDate: string } = {
    tier: 'free',
    billingInterval: 'monthly',
    runsUsedToday: 0,
    totalWordsHumanized: 0,
    renewalDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: 'active',
    lastResetDate: new Date().toISOString().split('T')[0],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSub));
  } catch {
    // ignore
  }

  return defaultSub;
}

export function saveSubscription(sub: UserSubscription): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sub, lastResetDate: today }));
  } catch (e) {
    console.warn('Subscription save error:', e);
  }
}
