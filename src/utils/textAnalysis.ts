import { AnalysisResult, JevSystemOneResult } from '../types';

export const AI_BUZZWORDS = [
  'delve', 'delves', 'delving', 'tapestry', 'crucial', 'pivotal', 'moreover', 'furthermore',
  'in conclusion', 'it is important to note', 'it is crucial to remember', 'testament',
  'beacon', 'realm', 'revolutionized', 'synergy', 'synergistic', 'paradigm shift',
  'holistic', 'multifaceted', 'intricate', 'paramount', 'unwavering', 'contemporary',
  'ubiquitous', 'foster', 'fostering', 'embarks', 'embarking', 'landscape', 'underscores'
];

export function computeJevSystemOne(rawText: string, score: number, detectedBuzzwordsCount: number, variance: number): JevSystemOneResult {
  const isHuman = score < 45;
  const humanProb = Math.min(0.99, Math.max(0.01, (100 - score) / 100));
  const aiProb = Math.min(0.99, Math.max(0.01, score / 100));

  let scoreIndex = 2;
  if (score >= 80) scoreIndex = 0;
  else if (score >= 60) scoreIndex = 1;
  else if (score >= 40) scoreIndex = 2;
  else if (score >= 20) scoreIndex = 3;
  else scoreIndex = 4;

  const scoreLabels = [
    '0: Formulaic AI prose',
    '1: Mostly AI with minor edits',
    '2: Mixed / ambiguous',
    '3: Very natural human cadence',
    '4: 100% authentic human with natural imperfections',
  ];

  // Distribute probabilities centered around scoreIndex
  const probs = [0.03, 0.05, 0.12, 0.28, 0.52];
  const shiftedProbs = [0.02, 0.02, 0.02, 0.02, 0.02];
  shiftedProbs[scoreIndex] = 0.60;
  const adjacent = scoreIndex > 0 ? scoreIndex - 1 : scoreIndex + 1;
  shiftedProbs[adjacent] = 0.26;
  const remaining = (1 - (0.60 + 0.26)) / 3;
  for (let i = 0; i < 5; i++) {
    if (i !== scoreIndex && i !== adjacent) shiftedProbs[i] = Math.round(remaining * 100) / 100;
  }

  const confidence = Math.min(0.98, Math.max(0.72, 0.84 + Math.abs(score - 50) / 250));

  return {
    model: 'TypeSafe AI Jev (System One)',
    system: 'System One',
    latencyMs: Math.floor(Math.random() * 35) + 65,
    answers: {
      origin: {
        choice: isHuman ? 'human' : 'ai',
        probabilities: {
          human: Math.round(humanProb * 1000) / 1000,
          ai: Math.round(aiProb * 1000) / 1000,
        },
        confidence: Math.round(confidence * 100) / 100,
      },
      humanAuthenticity: {
        score: scoreIndex,
        label: scoreLabels[scoreIndex],
        probabilities: shiftedProbs,
        confidence: Math.round((confidence - 0.03) * 100) / 100,
      },
      hasAiMarkers: {
        noul: detectedBuzzwordsCount > 0 || variance < 15,
        probabilities: {
          yes: Math.round(aiProb * 1000) / 1000,
          no: Math.round(humanProb * 1000) / 1000,
        },
        confidence: Math.round(confidence * 100) / 100,
      },
    },
  };
}

export function clientAnalyzeText(rawText: string): AnalysisResult {
  if (!rawText || rawText.trim().length === 0) {
    return {
      score: 50,
      label: 'Uncertain / Mixed',
      burstiness: { meanLength: 0, variance: 0, distribution: [] },
      perplexityEstimate: 'Moderate',
      detectedBuzzwords: [],
      sentenceCount: 0,
      wordCount: 0,
      tangentCount: 0,
      typoCount: 0,
      reasons: ['No text provided'],
    };
  }

  const clean = rawText.trim();
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);

  const lengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
  const meanLength = lengths.reduce((acc, l) => acc + l, 0) / lengths.length;
  const variance = lengths.reduce((acc, l) => acc + Math.pow(l - meanLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  const lowerText = clean.toLowerCase();
  const buzzwordMatches: { word: string; count: number }[] = [];
  let totalBuzzwords = 0;

  for (const bw of AI_BUZZWORDS) {
    const regex = new RegExp(`\\b${bw}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      buzzwordMatches.push({ word: bw, count: matches.length });
      totalBuzzwords += matches.length;
    }
  }

  const tangentMatches = clean.match(/\([^)]+\)|—[^—]+—|\b(wait|honestly|tbh|i mean|lowkey|prolly|ngl|anyway|kinda|sorta|dunno)\b/gi) || [];
  const tangentCount = tangentMatches.length;

  const typoMatches = clean.match(/\b(dont|cant|wont|didnt|isnt|arent|youre|im|ive|id|thats|whats|teh|thier|wierd|definetly|seperate|alot)\b/gi) || [];
  const typoCount = typoMatches.length;

  const semicolonCount = (clean.match(/;/g) || []).length;
  const ellipsisCount = (clean.match(/\.{3}/g) || []).length;

  let score = 50;

  const buzzwordDensity = (totalBuzzwords / Math.max(1, wordCount)) * 100;
  if (buzzwordDensity > 3) score += 30;
  else if (buzzwordDensity > 1) score += 18;
  else if (buzzwordDensity === 0) score -= 12;

  if (stdDev < 3.5) score += 20;
  else if (stdDev > 8) score -= 24;
  else if (stdDev > 5) score -= 14;

  if (semicolonCount >= 2) score += 10;
  if (tangentCount >= 2) score -= 18;
  else if (tangentCount === 0) score += 8;

  if (typoCount >= 2) score -= 25;
  else if (typoCount === 1) score -= 12;

  if (ellipsisCount >= 1) score -= 8;

  score = Math.max(2, Math.min(98, Math.round(score)));

  let label: AnalysisResult['label'] = 'Uncertain / Mixed';
  if (score >= 80) label = 'Highly Likely AI';
  else if (score >= 60) label = 'Likely AI';
  else if (score >= 40) label = 'Uncertain / Mixed';
  else if (score >= 20) label = 'Likely Human';
  else label = 'Authentically Human';

  let perplexityEstimate: AnalysisResult['perplexityEstimate'] = 'Moderate';
  if (score >= 70) perplexityEstimate = 'Very Low (Predictable)';
  else if (score <= 35) perplexityEstimate = 'High (Unpredictable / Natural)';

  const reasons: string[] = [];
  if (totalBuzzwords > 0) {
    reasons.push(`Detected ${totalBuzzwords} AI transition words (${buzzwordMatches.slice(0, 3).map(b => `"${b.word}"`).join(', ')})`);
  }
  if (stdDev < 4) {
    reasons.push(`Uniform sentence lengths (std dev ${stdDev.toFixed(1)}). Machine-like cadence.`);
  } else {
    reasons.push(`Strong sentence burstiness (std dev ${stdDev.toFixed(1)}). Matches human erratic thinking.`);
  }
  if (tangentCount > 0) {
    reasons.push(`Contains ${tangentCount} conversational tangents/shifts.`);
  }
  if (typoCount > 0) {
    reasons.push(`Contains ${typoCount} organic slips or relaxed contractions.`);
  }

  return {
    score,
    label,
    burstiness: {
      meanLength: Math.round(meanLength * 10) / 10,
      variance: Math.round(variance * 10) / 10,
      distribution: lengths,
    },
    perplexityEstimate,
    detectedBuzzwords: buzzwordMatches,
    sentenceCount,
    wordCount,
    tangentCount,
    typoCount,
    reasons,
    jev: computeJevSystemOne(clean, score, totalBuzzwords, variance),
  };
}

// Client-side quick typo injector if user wants to dial up messiness on any text instantly!
export function quickApplyTypos(text: string, typoRate: number): string {
  if (typoRate <= 0) return text;

  const words = text.split(/(\s+)/);
  const slipMap: Record<string, string> = {
    'the': 'teh',
    'their': 'thier',
    'there': 'thier',
    'weird': 'wierd',
    'definitely': 'definetly',
    'separate': 'seperate',
    'because': 'becuase',
    'received': 'recieved',
    'probably': 'prolly',
    'going to': 'gonna',
    'kind of': 'kinda',
    'a lot': 'alot',
    'until': 'untill',
    'truly': 'truely',
  };

  const contractionDrops: Record<string, string> = {
    "don't": "dont",
    "can't": "cant",
    "won't": "wont",
    "didn't": "didnt",
    "isn't": "isnt",
    "it's": "its",
    "you're": "youre",
    "I'm": "im",
    "i'm": "im",
    "I've": "ive",
    "that's": "thats",
  };

  const targetCount = Math.max(1, Math.round((words.length / 2) * (typoRate / 100)));
  let applied = 0;

  for (let i = 0; i < words.length && applied < targetCount; i++) {
    if (!words[i] || /^\s+$/.test(words[i])) continue;
    if (Math.random() > 0.5) continue;

    const rawWord = words[i];
    const punctMatch = rawWord.match(/([.,!?;:'")]+)$/);
    const punct = punctMatch ? punctMatch[1] : '';
    const cleanWord = punctMatch ? rawWord.slice(0, -punct.length) : rawWord;
    const lowerClean = cleanWord.toLowerCase();

    if (contractionDrops[lowerClean]) {
      const isCap = /^[A-Z]/.test(cleanWord);
      let replaced = contractionDrops[lowerClean];
      if (isCap) replaced = replaced.charAt(0).toUpperCase() + replaced.slice(1);
      words[i] = replaced + punct;
      applied++;
      continue;
    }

    if (slipMap[lowerClean]) {
      const isCap = /^[A-Z]/.test(cleanWord);
      let replaced = slipMap[lowerClean];
      if (isCap) replaced = replaced.charAt(0).toUpperCase() + replaced.slice(1);
      words[i] = replaced + punct;
      applied++;
      continue;
    }

    if (cleanWord.length > 5 && Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * (cleanWord.length - 3)) + 1;
      const chars = cleanWord.split('');
      const tmp = chars[idx];
      chars[idx] = chars[idx + 1];
      chars[idx + 1] = tmp;
      words[i] = chars.join('') + punct;
      applied++;
    }
  }

  return words.join('');
}
