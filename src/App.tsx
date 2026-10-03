import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Download,
  Sliders,
  AlertCircle,
  FileText,
  CornerDownLeft,
  Flame,
  ShieldCheck,
  Activity,
  Layers,
  Info,
  Shuffle
} from 'lucide-react';
import { Header } from './components/Header';
import { ToneSelector } from './components/ToneSelector';
import { ImperfectionControls } from './components/ImperfectionControls';
import { DetectionRadar } from './components/DetectionRadar';
import { SentenceLengthChart } from './components/SentenceLengthChart';
import { XRayView } from './components/XRayView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { JevAuditCard } from './components/JevAuditCard';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PaywallPrompt } from './components/PaywallPrompt';
import { FileUploader } from './components/FileUploader';
import { CustomBannedWordsModal } from './components/CustomBannedWordsModal';
import { AudioTranscriber } from './components/AudioTranscriber';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PLAN_LIMITS, getStoredSubscription, saveSubscription } from './utils/subscription';
import { clientAnalyzeText, quickApplyTypos } from './utils/textAnalysis';
import {
  HumanizeOptions,
  HumanizeResponse,
  PresetItem,
  HistoryItem,
  AnalysisResult,
  ToneType,
  UserSubscription,
  PlanTier,
} from './types';

function GhostWriterMain() {
  const { currentUser, saveHumanizationToCloud, cloudHistory } = useAuth();

  // Input state
  const [inputText, setInputText] = useState<string>(
    `In the contemporary digital era, the ubiquitous prevalence of social media platforms has revolutionized human communication. Furthermore, it is crucial to recognize that while these networks facilitate global connectivity, they simultaneously foster feelings of isolation and psychological distress among adolescents. Moreover, the intricate tapestry of modern social networking underscores the multifaceted nature of interpersonal relationships in today's interconnected society. In conclusion, it is pivotal for policymakers and educators to delve deeply into this phenomenon to ensure holistic well-being.`
  );

  // Humanized output state
  const [humanizedText, setHumanizedText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'clean' | 'xray' | 'burstiness' | 'jev' | 'breakdown'>('clean');

  // Options state
  const [options, setOptions] = useState<HumanizeOptions>({
    tone: 'bro',
    tangentLevel: 'conversational',
    burstiness: 'extreme',
    includeTypos: true,
    typoRate: 6,
    allowCasualLower: true,
  });

  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription>(() => getStoredSubscription());
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<
    'word_limit' | 'credits_exceeded' | 'locked_persona' | 'feature_locked'
  >('word_limit');
  const [isCustomWordsOpen, setIsCustomWordsOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [customBannedWords, setCustomBannedWords] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ghostwriter_banned_words');
      return raw ? JSON.parse(raw) : ['synergistic', 'holistic', 'paradigm shift'];
    } catch {
      return ['synergistic', 'holistic'];
    }
  });

  const saveCustomWords = (words: string[]) => {
    setCustomBannedWords(words);
    try {
      localStorage.setItem('ghostwriter_banned_words', JSON.stringify(words));
    } catch {}
  };

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Last successful generation metadata
  const [lastResponse, setLastResponse] = useState<HumanizeResponse | null>(null);

  // History stored in localStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ghostwriter_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Presets
  const [presets, setPresets] = useState<PresetItem[]>([]);

  // Fetch presets on mount
  useEffect(() => {
    fetch('/api/presets')
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setPresets(data.presets);
      })
      .catch(() => {
        // Fallback default
      });
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ghostwriter_history', JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // Sync cloud history from Firestore when authenticated
  useEffect(() => {
    if (cloudHistory && cloudHistory.length > 0) {
      setHistory((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newItems = cloudHistory.filter((i) => !existingIds.has(i.id));
        return [...newItems, ...prev];
      });
    }
  }, [cloudHistory]);

  // Real-time client-side analysis of input text
  const inputAnalysis = useMemo(() => {
    return clientAnalyzeText(inputText);
  }, [inputText]);

  // Real-time client-side analysis of humanized output text
  const outputAnalysis = useMemo(() => {
    return clientAnalyzeText(humanizedText);
  }, [humanizedText]);

  // Show temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Humanize API call
  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError('Please provide some text to humanize');
      return;
    }

    const limits = PLAN_LIMITS[subscription.tier];

    // Check 1: Free tier daily credits limit
    if (!limits.unlimitedRuns && subscription.runsUsedToday >= limits.dailyRuns) {
      setPaywallReason('credits_exceeded');
      setIsPaywallOpen(true);
      return;
    }

    // Check 2: Word limits per tier
    if (inputAnalysis.wordCount > limits.maxWordsPerRun) {
      setPaywallReason('word_limit');
      setIsPaywallOpen(true);
      return;
    }

    // Check 3: Persona locked
    if (!limits.unlockedTones.includes(options.tone)) {
      setPaywallReason('locked_persona');
      setIsPaywallOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          tone: options.tone,
          tangentLevel: options.tangentLevel,
          burstiness: options.burstiness,
          includeTypos: options.includeTypos,
          typoRate: options.typoRate,
          allowCasualLower: options.allowCasualLower,
          customBannedWords: subscription.tier !== 'free' ? customBannedWords : [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to humanize text');
      }

      setHumanizedText(data.humanizedText);
      setLastResponse(data);

      // Record subscription usage
      const updatedSub: UserSubscription = {
        ...subscription,
        runsUsedToday: subscription.runsUsedToday + 1,
        totalWordsHumanized: (subscription.totalWordsHumanized || 0) + inputAnalysis.wordCount,
      };
      setSubscription(updatedSub);
      saveSubscription(updatedSub);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalText: inputText,
        humanizedText: data.humanizedText,
        tone: options.tone,
        typoRate: options.typoRate,
        originalScore: data.originalAnalysis?.score ?? 90,
        humanizedScore: data.humanizedAnalysis?.score ?? 15,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
      if (currentUser) {
        saveHumanizationToCloud(newHistoryItem);
      }
      triggerToast('✨ Humanized with natural tangents & nuances!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while humanizing the text');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleHumanize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Copy to clipboard
  const handleCopy = () => {
    if (!humanizedText) return;
    navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    triggerToast('Copied humanized text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download text file
  const handleDownload = () => {
    if (!humanizedText) return;
    const blob = new Blob([humanizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `humanized_${options.tone}_text.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('Downloaded text file');
  };

  // Instant quick typo boost button (+3% typos)
  const handleQuickTypoBoost = () => {
    if (!humanizedText) return;
    const boosted = quickApplyTypos(humanizedText, 4);
    setHumanizedText(boosted);
    triggerToast('Injected extra casual keyboard slips!');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-zinc-100 text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        subscription={subscription}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* SaaS Free Tier Alert / Upgrade Banner */}
        {subscription.tier === 'free' && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                  <span>Free Starter Plan Active</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                    {Math.max(0, PLAN_LIMITS.free.dailyRuns - subscription.runsUsedToday)} / {PLAN_LIMITS.free.dailyRuns} runs remaining today
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Upgrade to GhostWriter Pro to unlock full 2,500-word essays, all 6 voice personas & unlimited runs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Unlock Pro ($19/mo)</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Preset robotic text launcher bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Try a Robotic AI Sample:</span>
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              One-click test sample AI clichés
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setInputText(preset.text);
                  triggerToast(`Loaded: ${preset.title}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition flex items-center gap-1.5 group"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
                <span>{preset.title}</span>
                <span className="text-[10px] text-zinc-500 font-mono">({preset.category})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selector */}
        <ToneSelector
          selectedTone={options.tone}
          onChange={(tone) => setOptions((prev) => ({ ...prev, tone }))}
          unlockedTones={PLAN_LIMITS[subscription.tier].unlockedTones}
          onLockedToneClick={() => {
            setPaywallReason('locked_persona');
            setIsPaywallOpen(true);
          }}
        />

        {/* Imperfection & Humanizer Levers */}
        <ImperfectionControls
          options={options}
          onChange={(newOpts) => setOptions(newOpts)}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-100 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace: Dual Column Text Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: AI Raw Input */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h2 className="text-sm font-bold text-zinc-200">
                  AI-Generated Input (Original)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <AudioTranscriber
                  onTranscriptionComplete={(transcribed) => {
                    setInputText((prev) => (prev.trim() ? prev + ' ' + transcribed : transcribed));
                    triggerToast('🎙️ Transcribed speech with gemini-3.5-transcribe!');
                  }}
                  onError={(err) => setError(err)}
                />
                <FileUploader
                  tier={subscription.tier}
                  onFileLoaded={(content, filename) => {
                    setInputText(content);
                    triggerToast(`Loaded "${filename}"`);
                  }}
                  onLockedClick={() => {
                    setPaywallReason('feature_locked');
                    setIsPaywallOpen(true);
                  }}
                />
                <span className="text-zinc-700">|</span>
                <button
                  onClick={() => setInputText('')}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                >
                  Clear
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) setInputText(text);
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-[11px] text-zinc-400 hover:text-amber-400 transition"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Input Textarea Container */}
            <div className="relative flex-1 min-h-[300px] flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800 focus-within:border-amber-500/50 transition p-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your AI text here (ChatGPT, Claude, Gemini, etc.)..."
                className="w-full flex-1 bg-transparent resize-none focus:outline-hidden text-sm text-zinc-200 placeholder:text-zinc-600 leading-relaxed font-sans"
              />

              {/* Bottom stats of input with plan limit indicator */}
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      subscription.tier === 'free' &&
                      inputAnalysis.wordCount > PLAN_LIMITS.free.maxWordsPerRun
                        ? 'text-rose-400 font-bold'
                        : ''
                    }
                  >
                    {inputAnalysis.wordCount} / {PLAN_LIMITS[subscription.tier].maxWordsPerRun} words
                    {subscription.tier === 'free' &&
                      inputAnalysis.wordCount > PLAN_LIMITS.free.maxWordsPerRun && (
                        <span className="text-rose-400 font-bold ml-1.5">(Free Limit Exceeded)</span>
                      )}
                  </span>
                  <span>{inputAnalysis.sentenceCount} sentences</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">AI Risk:</span>
                  <span
                    className={`font-bold ${
                      inputAnalysis.score > 60 ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {inputAnalysis.score}%
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column Radar analysis */}
            <DetectionRadar
              analysis={inputAnalysis}
              title="Input AI Detector Profile"
            />
          </div>

          {/* Right Column: Humanized Outcome */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <span>Humanized Outcome</span>
                  {humanizedText && (
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Undetectable
                    </span>
                  )}
                </h2>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                <button
                  onClick={() => setActiveTab('clean')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeTab === 'clean'
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setActiveTab('xray')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeTab === 'xray'
                      ? 'bg-zinc-800 text-cyan-300 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Highlights tangents, typos, and shifts"
                >
                  X-Ray
                </button>
                <button
                  onClick={() => setActiveTab('burstiness')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeTab === 'burstiness'
                      ? 'bg-zinc-800 text-sky-300 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Rhythm
                </button>
                <button
                  onClick={() => setActiveTab('jev')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    activeTab === 'jev'
                      ? 'bg-indigo-900/60 text-indigo-300 font-medium border border-indigo-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="TypeSafe AI Jev System One Typed Verdict"
                >
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span>Jev Verdict</span>
                </button>
                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeTab === 'breakdown'
                      ? 'bg-zinc-800 text-amber-300 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Anti-AI Proof
                </button>
              </div>
            </div>

            {/* Output Display Container */}
            <div className="relative flex-1 min-h-[300px] flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800 transition p-3">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-zinc-200">
                      Disrupting Robotic Cadence & Adding Natural Nuances...
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Injecting authentic human tangents, erratic burstiness, and casual keyboard slips
                    </p>
                  </div>
                </div>
              ) : activeTab === 'clean' ? (
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={humanizedText}
                    onChange={(e) => setHumanizedText(e.target.value)}
                    placeholder="Click 'Humanize & Mess It Up' below to generate your organic, undetectable human version..."
                    className="w-full flex-1 bg-transparent resize-none focus:outline-hidden text-sm text-zinc-100 placeholder:text-zinc-600 leading-relaxed font-sans"
                  />
                  {humanizedText && (
                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <div className="flex items-center gap-3">
                        <span>{outputAnalysis.wordCount} words</span>
                        <span>{outputAnalysis.sentenceCount} sentences</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400">AI Risk:</span>
                        <span className="font-bold text-emerald-400">
                          {outputAnalysis.score}% (Clean)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'xray' ? (
                <div className="flex-1 overflow-y-auto">
                  <XRayView text={humanizedText} />
                </div>
              ) : activeTab === 'burstiness' ? (
                <div className="flex-1 overflow-y-auto">
                  <SentenceLengthChart
                    originalDistribution={inputAnalysis.burstiness.distribution}
                    humanizedDistribution={outputAnalysis.burstiness.distribution}
                  />
                </div>
              ) : activeTab === 'jev' ? (
                <div className="flex-1 overflow-y-auto space-y-4">
                  {outputAnalysis.jev ? (
                    <div className="space-y-4">
                      <JevAuditCard jev={outputAnalysis.jev} isHumanized />
                      {inputAnalysis.jev && (
                        <div className="pt-2 border-t border-zinc-800/80">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block mb-2">
                            Original Input Comparison:
                          </span>
                          <JevAuditCard jev={inputAnalysis.jev} title="Original Input Jev Verdict" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                      Click "Humanize & Mess It Up" to generate text and run Jev System One evaluation.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 p-2">
                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Why This Fools Detectors</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      AI detectors (GPTZero, Turnitin, CopyLeaks) analyze 2 primary signals:
                      Perplexity (word unpredictability) and Burstiness (variance of sentence lengths).
                      GhostWriter injects natural colloquial connectors, asymmetric clause lengths,
                      and subtle tangents that shatter synthetic mathematical regularity.
                    </p>
                  </div>

                  {lastResponse && (
                    <div className="space-y-2 text-xs">
                      {lastResponse.tangentsAdded.length > 0 && (
                        <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                          <span className="text-cyan-400 font-medium block mb-1">
                            Injected Human Tangents:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                            {lastResponse.tangentsAdded.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lastResponse.aiPatternsRemoved.length > 0 && (
                        <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                          <span className="text-rose-400 font-medium block mb-1">
                            Eliminated AI Clichés & Patterns:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                            {lastResponse.aiPatternsRemoved.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lastResponse.appliedTypos.length > 0 && (
                        <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                          <span className="text-amber-400 font-medium block mb-1">
                            Natural Keyboard Imperfections:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {lastResponse.appliedTypos.map((typ, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[10px]"
                              >
                                {typ}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Output Right Column Actions & Radar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!humanizedText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!humanizedText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={handleQuickTypoBoost}
                  disabled={!humanizedText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-950/40 text-amber-400/90 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                  title="Add a few more casual typos"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>+ Extra Slips</span>
                </button>
              </div>

              {humanizedText && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{outputAnalysis.label}</span>
                </span>
              )}
            </div>

            {/* Output Radar Analysis */}
            <DetectionRadar
              analysis={outputAnalysis}
              title="Humanized Detection Profile"
              isHumanized
            />
          </div>
        </div>

        {/* Central Master Execution Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                <span>Natural Humanizer Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Rewrites with organic sentence burstiness, authentic tangents & casual keyboard slips
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Custom Banned Words Scrubber Trigger */}
            <button
              onClick={() => setIsCustomWordsOpen(true)}
              className="px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Configure custom trigger words to scrub"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Anti-AI Scrubber</span>
              {subscription.tier === 'free' && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  PRO
                </span>
              )}
            </button>

            <button
              onClick={handleHumanize}
              disabled={loading || !inputText.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 hover:via-orange-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Humanizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {subscription.tier === 'free'
                      ? `Humanize (${Math.max(0, PLAN_LIMITS.free.dailyRuns - subscription.runsUsedToday)} left today)`
                      : 'Humanize & Mess It Up'}
                  </span>
                  <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-white/90">
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Subscription SaaS Pricing & Billing Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(newSub) => setSubscription(newSub)}
      />

      {/* Paywall Limit Alert Prompt */}
      <PaywallPrompt
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onOpenSubscription={() => {
          setIsPaywallOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        reason={paywallReason}
        wordCount={inputAnalysis.wordCount}
        maxWords={PLAN_LIMITS[subscription.tier].maxWordsPerRun}
      />

      {/* Custom Banned Words Scrubber Modal */}
      <CustomBannedWordsModal
        isOpen={isCustomWordsOpen}
        onClose={() => setIsCustomWordsOpen(false)}
        tier={subscription.tier}
        onOpenSubscription={() => {
          setIsCustomWordsOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        customWords={customBannedWords}
        onSaveWords={saveCustomWords}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelect={(item) => {
          setInputText(item.originalText);
          setHumanizedText(item.humanizedText);
          setOptions((prev) => ({ ...prev, tone: item.tone, typoRate: item.typoRate }));
          triggerToast('Restored generation from history');
        }}
        onClear={() => {
          setHistory([]);
          triggerToast('History cleared');
        }}
      />
      {/* Live Voice Conversation Modal (gemini-3.8-live) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        onInsertText={(spoken) => {
          setInputText((prev) => (prev.trim() ? prev + '\n\n' + spoken : spoken));
          triggerToast('Inserted Live Voice suggestion');
        }}
        currentInputText={inputText}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GhostWriterMain />
    </AuthProvider>
  );
}
