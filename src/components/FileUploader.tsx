import React, { useRef } from 'react';
import { Upload, FileText, Lock, Sparkles } from 'lucide-react';
import { PlanTier } from '../types';

interface FileUploaderProps {
  onFileLoaded: (content: string, filename: string) => void;
  tier: PlanTier;
  onLockedClick: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileLoaded,
  tier,
  onLockedClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLocked = tier === 'free';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onFileLoaded(text, file.name);
      }
    };
    reader.readAsText(file);

    // Reset input so user can re-upload same file if desired
    e.target.value = '';
  };

  const handleClick = () => {
    if (isLocked) {
      onLockedClick();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.rtf"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition text-[11px]"
        title={isLocked ? 'Document Upload (Pro Feature)' : 'Import Document (.txt, .md)'}
      >
        <Upload className="w-3 h-3 text-zinc-400" />
        <span>Import File</span>
        {isLocked && (
          <span className="flex items-center gap-0.5 text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold ml-0.5">
            <Lock className="w-2 h-2" />
            <span>PRO</span>
          </span>
        )}
      </button>
    </div>
  );
};
