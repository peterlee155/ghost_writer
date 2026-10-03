import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles, Volume2 } from 'lucide-react';

interface AudioTranscriberProps {
  onTranscriptionComplete: (text: string) => void;
  onError?: (err: string) => void;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscriptionComplete,
  onError,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        await handleSendAudio(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      onError?.(err.message || 'Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleSendAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: blob.type || 'audio/webm',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Transcription failed');
        }

        if (data.transcription) {
          onTranscriptionComplete(data.transcription);
        } else {
          onError?.('No speech detected in recording.');
        }
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      onError?.(err.message || 'Failed to transcribe audio with gemini-3.5-transcribe');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition text-[11px] font-mono animate-pulse cursor-pointer"
          title="Click to finish dictation"
        >
          <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
          <span>Stop ({recordingSeconds}s)</span>
        </button>
      ) : isProcessing ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px] font-mono">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Transcribing (gemini-3.5-transcribe)...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition text-[11px] cursor-pointer"
          title="Dictate with microphone (transcribed by gemini-3.5-transcribe)"
        >
          <Mic className="w-3 h-3 text-amber-400" />
          <span>Dictate</span>
        </button>
      )}
    </div>
  );
};
