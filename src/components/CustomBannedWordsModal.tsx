import React, { useState } from 'react';
import { ShieldCheck, Plus, X, Trash2, Lock, Sparkles } from 'lucide-react';
import { PlanTier } from '../types';

interface CustomBannedWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PlanTier;
  onOpenSubscription: () => void;
  customWords: string[];
  onSaveWords: (words: string[]) => void;
}

export const CustomBannedWordsModal: React.FC<CustomBannedWordsModalProps> = ({
  isOpen,
  onClose,
  tier,
  onOpenSubscription,
  customWords,
  onSaveWords,
}) => {
  const [newWord, setNewWord] = useState('');
  const isLocked = tier === 'free';

  if (!isOpen) return null;

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWord.trim().toLowerCase();
    if (!trimmed || customWords.includes(trimmed)) return;
    onSaveWords([...customWords, trimmed]);
    setNewWord('');
  };

  const handleRemoveWord = (wordToRemove: string) => {
    onSaveWords(customWords.filter((w) => w !== wordToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl shadow-black/90 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Custom Anti-AI Scrubber</span>
                {isLocked && (
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    <Lock className="w-2.5 h-2.5" />
                    <span>PRO</span>
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Specify custom trigger words to automatically scrub from generations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isLocked ? (
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Pro Feature</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Custom banned word lists allow you to define university-specific or company-specific jargon to purge.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenSubscription();
              }}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs transition hover:brightness-110 flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock with GhostWriter Pro</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleAddWord} className="flex gap-2">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Enter word or phrase (e.g. synergistic)"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500/50"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Active Banned Words ({customWords.length}):
              </span>
              <div className="max-h-48 overflow-y-auto flex flex-wrap gap-1.5 p-2 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                {customWords.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic p-2">
                    No custom words added yet. Type a word above to scrub.
                  </span>
                ) : (
                  customWords.map((word) => (
                    <span
                      key={word}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono border border-zinc-700/60"
                    >
                      <span>"{word}"</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(word)}
                        className="text-zinc-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition text-xs font-medium border border-zinc-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
