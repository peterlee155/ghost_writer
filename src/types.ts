export type ToneType = 'bro' | 'reddit' | 'college' | 'coffee' | 'quick_dm' | 'work';

export type TangentLevel = 'none' | 'subtle' | 'conversational' | 'rambly';

export type BurstinessLevel = 'balanced' | 'extreme';

export interface HumanizeOptions {
  tone: ToneType;
  tangentLevel: TangentLevel;
  burstiness: BurstinessLevel;
  includeTypos: boolean;
  typoRate: number; // 0 to 15
  allowCasualLower: boolean;
}

export interface JevSystemOneResult {
  model: string;
  system: 'System One';
  latencyMs: number;
  answers: {
    origin: {
      choice: 'human' | 'ai';
      probabilities: { human: number; ai: number };
      confidence: number;
    };
    humanAuthenticity: {
      score: number; // 0 to 4
      label: string;
      probabilities: number[];
      confidence: number;
    };
    hasAiMarkers: {
      noul: boolean;
      probabilities: { yes: number; no: number };
      confidence: number;
    };
  };
}

export interface AnalysisResult {
  score: number; // 0-100 (100 = AI, 0 = Human)
  label: 'Highly Likely AI' | 'Likely AI' | 'Uncertain / Mixed' | 'Likely Human' | 'Authentically Human';
  burstiness: {
    meanLength: number;
    variance: number;
    distribution: number[];
  };
  perplexityEstimate: 'Very Low (Predictable)' | 'Moderate' | 'High (Unpredictable / Natural)';
  detectedBuzzwords: { word: string; count: number }[];
  sentenceCount: number;
  wordCount: number;
  tangentCount: number;
  typoCount: number;
  reasons: string[];
  jev?: JevSystemOneResult;
}

export interface HumanizeResponse {
  success: boolean;
  originalText: string;
  humanizedText: string;
  tangentsAdded: string[];
  aiPatternsRemoved: string[];
  humanTechniquesUsed: string[];
  appliedTypos: string[];
  originalAnalysis: AnalysisResult;
  humanizedAnalysis: AnalysisResult;
  jevEvaluation?: JevSystemOneResult;
}

export interface PresetItem {
  id: string;
  title: string;
  category: string;
  text: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  humanizedText: string;
  tone: ToneType;
  typoRate: number;
  originalScore: number;
  humanizedScore: number;
}

export type PlanTier = 'free' | 'pro' | 'team';

export interface PlanLimits {
  maxWordsPerRun: number;
  dailyRuns: number;
  unlockedTones: ToneType[];
  canUploadFiles: boolean;
  canUseCustomBannedWords: boolean;
  priorityProcessing: boolean;
  unlimitedRuns: boolean;
}

export interface UserSubscription {
  tier: PlanTier;
  billingInterval: 'monthly' | 'annual';
  runsUsedToday: number;
  totalWordsHumanized: number;
  renewalDate: string;
  status: 'active' | 'trial' | 'canceled';
}
