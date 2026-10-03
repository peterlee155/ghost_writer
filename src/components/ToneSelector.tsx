import React from 'react';
import { ToneType } from '../types';
import { MessageSquare, Coffee, GraduationCap, Flame, MessageCircle, Briefcase } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: ToneType;
  onChange: (tone: ToneType) => void;
}

interface ToneConfig {
  id: ToneType;
  title: string;
  badge: string;
  desc: string;
  icon: React.ReactNode;
}

const TONES: ToneConfig[] = [
  {
    id: 'bro',
    title: 'Casual Bro',
    badge: 'Most Popular',
    desc: 'Informal, effortless, real conversational transitions & mild slang',
    icon: <Flame className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'college',
    title: 'Exhausted Student',
    badge: 'Late Night',
    desc: 'Zero template fluff, wild sentence length bursts, gritty substance',
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'coffee',
    title: 'Coffee Chat',
    badge: 'Warm & Natural',
    desc: 'Thoughtful breath pauses, personal observations, genuine flow',
    icon: <Coffee className="w-4 h-4 text-orange-400" />,
  },
  {
    id: 'reddit',
    title: 'Reddit Poster',
    badge: 'Candid Talk',
    desc: 'Parenthetical detours, grounded analogies, healthy skepticism',
    icon: <MessageSquare className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 'quick_dm',
    title: 'Quick DM / Text',
    badge: 'Snappy',
    desc: 'Rapid conversational bursts, skips filler, hyper-authentic',
    icon: <MessageCircle className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'work',
    title: 'Pragmatic Colleague',
    badge: 'Real Work',
    desc: 'Kills corporate sycophancy, direct, human workplace efficiency',
    icon: <Briefcase className="w-4 h-4 text-purple-400" />,
  },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <span>Human Persona & Voice</span>
        </label>
        <span className="text-[11px] text-zinc-500">Pick the speaking vibe</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {TONES.map(tone => {
          const isSelected = selectedTone === tone.id;
          return (
            <button
              key={tone.id}
              onClick={() => onChange(tone.id)}
              className={`text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="p-1 rounded-lg bg-zinc-800/80">{tone.icon}</div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-medium'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tone.badge}
                  </span>
                </div>
                <div className="font-semibold text-xs leading-snug text-zinc-100">{tone.title}</div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {tone.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
