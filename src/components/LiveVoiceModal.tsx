import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Radio, ArrowRight, CornerDownLeft, Play } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
  currentInputText?: string;
}

interface TranscriptTurn {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

// Convert Float32 array to 16-bit PCM base64 string
function pcmToBase64(float32Array: Float32Array): string {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const uint8 = new Uint8Array(pcm16.buffer);
  let binary = '';
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

// Decode base64 16-bit PCM to Float32Array for Web Audio API playback
function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
  currentInputText,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [statusText, setStatusText] = useState('Connecting to gemini-3.8-live...');
  const [userTextPrompt, setUserTextPrompt] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      handleDisconnect();
      return;
    }

    startLiveSession();

    return () => {
      handleDisconnect();
    };
  }, [isOpen]);

  const startLiveSession = async () => {
    try {
      setStatusText('Connecting to gemini-3.8-live...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 24kHz AudioContext for Gemini Live output playback
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      ws.onopen = async () => {
        setIsConnected(true);
        setStatusText('Live Audio Connected • Speak into your mic');

        // If there is context in the editor, seed the model
        if (currentInputText && currentInputText.trim().length > 0) {
          ws.send(
            JSON.stringify({
              text: `Here is the current text the user is working on: "${currentInputText.slice(0, 500)}". Acknowledge casually that you are ready to help them humanize or rewrite it.`,
            })
          );
        }

        // Start microphone capture at 16kHz
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = micStream;

          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          inputAudioCtxRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(micStream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          source.connect(processor);
          processor.connect(inputCtx.destination);

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64Audio = pcmToBase64(inputData);
              ws.send(JSON.stringify({ audio: base64Audio }));
            }
          };
        } catch (micErr) {
          console.warn('Microphone stream error, text conversation available:', micErr);
          setStatusText('Microphone unavailable • You can type to Live API below');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.interrupted) {
            // Stop current playback
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
            setIsSpeaking(false);
          }

          if (data.text) {
            setTranscripts((prev) => [
              ...prev,
              {
                role: 'assistant',
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }

          if (data.audio && outputAudioCtxRef.current) {
            setIsSpeaking(true);
            playAudioChunk(outputAudioCtxRef.current, data.audio);
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Live WebSocket error:', err);
        setStatusText('Live API connection error. Check backend server.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsSpeaking(false);
        setStatusText('Live Session Closed');
      };
    } catch (err: any) {
      console.error('Start live session error:', err);
      setStatusText(err.message || 'Failed to start Live session');
    }
  };

  const playAudioChunk = (ctx: AudioContext, base64: string) => {
    try {
      const float32 = base64ToFloat32(base64);
      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = Math.max(now, nextStartTimeRef.current);
      sourceNode.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      sourceNode.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Playback chunk error:', err);
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTextPrompt.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setTranscripts((prev) => [
      ...prev,
      {
        role: 'user',
        text: userTextPrompt.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    wsRef.current.send(JSON.stringify({ text: userTextPrompt.trim() }));
    setUserTextPrompt('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl shadow-black/90 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-amber-500 to-rose-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">GhostWriter Live Voice</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Real-time spoken dialogue with Gemini Live to brainstorm, critique & rewrite text out loud
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Orb & Status */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 my-4">
          {/* Animated Orb */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center ${
                isSpeaking
                  ? 'bg-gradient-to-tr from-amber-500 to-rose-600 shadow-xl shadow-amber-500/40 scale-110 ring-4 ring-amber-400/30 animate-pulse'
                  : isConnected
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-800 shadow-lg shadow-indigo-500/20 scale-100 ring-2 ring-indigo-500/20'
                  : 'bg-zinc-800 scale-95'
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-8 h-8 text-white animate-bounce" />
              ) : isConnected ? (
                <Mic className="w-8 h-8 text-indigo-200" />
              ) : (
                <MicOff className="w-8 h-8 text-zinc-500" />
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? (isSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse') : 'bg-rose-500'
                }`}
              />
              <span>{statusText}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Low-latency 16kHz PCM capture ↔ 24kHz streaming audio output
            </p>
          </div>
        </div>

        {/* Live Transcripts Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[160px] max-h-[240px]">
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs font-mono">
              <Sparkles className="w-5 h-5 text-indigo-400/60 mb-1.5" />
              <span>Say something like: "How can I rewrite this intro so it sounds like a college student talking?"</span>
            </div>
          ) : (
            transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl text-xs space-y-1 ${
                  t.role === 'user'
                    ? 'bg-zinc-900/80 border border-zinc-800 ml-8 text-zinc-200'
                    : 'bg-indigo-950/30 border border-indigo-500/30 mr-8 text-indigo-100'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-semibold">{t.role === 'user' ? 'You' : 'GhostWriter Live'}</span>
                  <span>{t.time}</span>
                </div>
                <p className="leading-relaxed">{t.text}</p>
                {t.role === 'assistant' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onInsertText(t.text)}
                      className="text-[10px] font-mono text-indigo-300 hover:text-indigo-100 flex items-center gap-1 transition underline"
                    >
                      <CornerDownLeft className="w-3 h-3" />
                      <span>Insert into Editor</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Text Input Fallback / Hybrid Input */}
        <form onSubmit={handleSendText} className="pt-3 border-t border-zinc-800/80 flex gap-2">
          <input
            type="text"
            value={userTextPrompt}
            onChange={(e) => setUserTextPrompt(e.target.value)}
            placeholder="Type a message or speak into your microphone..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!userTextPrompt.trim() || !isConnected}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
