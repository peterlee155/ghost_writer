import React from 'react';
import { HistoryItem } from '../types';
import { History, X, Copy, Trash2, ArrowRight, Check } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClear,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-zinc-100">Generation History</h2>
            <span className="text-xs font-mono text-zinc-500">({items.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900 transition"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No saved humanized generations yet. Run a prompt to see history here!
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 capitalize">
                      {item.tone}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400 line-through">{item.originalScore}%</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span className="text-emerald-400 font-bold">{item.humanizedScore}%</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                  {item.humanizedText}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500">
                    Typos: {item.typoRate}%
                  </span>
                  <button
                    onClick={(e) => handleCopy(item.id, item.humanizedText, e)}
                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
