import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConnectionStatus,
  AssistantState,
  ToolCallItem,
  TranscriptItem,
  ActiveTimer,
  QuickNote,
  AppTheme,
} from '../types';
import {
  floatTo16BitPCM,
  arrayBufferToBase64,
  base64ToInt16Array,
  pcm16ToAudioBuffer,
  playUiSound,
} from '../utils/audio';

interface UseLiveVoiceOptions {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export function useLiveVoice({ setTheme }: UseLiveVoiceOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPushToTalk, setIsPushToTalk] = useState<boolean>(false);
  const [isHoldingPTT, setIsHoldingPTT] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio levels (0 to 1) for visualization
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [outputVolume, setOutputVolume] = useState<number>(0);

  // Transcripts & Tool executions
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentLiveUserText, setCurrentLiveUserText] = useState<string>('');
  const [currentLiveModelText, setCurrentLiveModelText] = useState<string>('');
  const [toolCalls, setToolCalls] = useState<ToolCallItem[]>([]);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  // References for WebSocket and Web Audio
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  // Playback queue & scheduling tracking
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef<boolean>(false);
  const isPushToTalkRef = useRef<boolean>(false);
  const isHoldingPTTRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  // Sync ref values
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isPushToTalkRef.current = isPushToTalk;
  }, [isPushToTalk]);

  useEffect(() => {
    isHoldingPTTRef.current = isHoldingPTT;
  }, [isHoldingPTT]);

  // Stop and clear all currently playing model audio on interruption
  const stopAllAudioOutput = useCallback(() => {
    activeSourceNodesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source already stopped
      }
    });
    activeSourceNodesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    } else {
      nextPlayTimeRef.current = 0;
    }
    setAssistantState('idle');
  }, []);

  // Execute client-side tool actions
  const handleClientToolExecution = useCallback(
    (toolName: string, args: Record<string, any>, callId: string) => {
      let description = '';

      if (toolName === 'openWebsite') {
        const rawUrl = args?.url || '';
        let validUrl = rawUrl;
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
          validUrl = `https://${validUrl}`;
        }
        description = `Opened ${args?.title || validUrl}`;
        setLastActionResult(`Opened website: ${args?.title || validUrl}`);
        playUiSound('action');

        // Safe window.open attempt
        try {
          const opened = window.open(validUrl, '_blank', 'noopener,noreferrer');
          if (!opened) {
            console.log('[TOOL] Popup blocked, link ready in action feed.');
          }
        } catch (e) {
          console.warn('[TOOL] Unable to open window directly:', e);
        }
      } else if (toolName === 'searchWeb') {
        const query = args?.query || '';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        description = `Searched for "${query}"`;
        setLastActionResult(`Searched web for: "${query}"`);
        playUiSound('action');

        try {
          window.open(searchUrl, '_blank', 'noopener,noreferrer');
        } catch {
          // Handled via action feed
        }
      } else if (toolName === 'triggerAction') {
        const actionType = args?.actionType;
        const payload = args?.payload || '';

        if (actionType === 'change_theme') {
          const validThemes: AppTheme[] = ['neon_rose', 'midnight_velvet', 'cyber_lavender', 'emerald_glow'];
          const matched = validThemes.find((t) => payload.toLowerCase().includes(t.replace('_', '')) || payload.toLowerCase().includes(t));
          const newTheme = matched || 'neon_rose';
          setTheme(newTheme);
          description = `Switched theme to ${newTheme.replace('_', ' ').toUpperCase()}`;
          setLastActionResult(description);
          playUiSound('action');
        } else if (actionType === 'set_timer') {
          const seconds = parseInt(payload, 10) || 60;
          const newTimer: ActiveTimer = {
            id: `timer-${Date.now()}`,
            label: `Timer (${seconds}s)`,
            totalSeconds: seconds,
            remainingSeconds: seconds,
            isRunning: true,
          };
          setActiveTimers((prev) => [...prev, newTimer]);
          description = `Started ${seconds}s timer`;
          setLastActionResult(description);
          playUiSound('ding');
        } else if (actionType === 'save_note') {
          const newNote: QuickNote = {
            id: `note-${Date.now()}`,
            text: payload,
            timestamp: new Date(),
          };
          setNotes((prev) => [newNote, ...prev]);
          description = `Saved note: "${payload}"`;
          setLastActionResult(description);
          playUiSound('action');
        } else if (actionType === 'flip_coin') {
          const outcome = Math.random() > 0.5 ? 'Heads' : 'Tails';
          description = `Flipped Coin: It's ${outcome}!`;
          setLastActionResult(description);
          playUiSound('action');
        } else if (actionType === 'roll_dice') {
          const roll = Math.floor(Math.random() * 6) + 1;
          description = `Rolled a die: ${roll}!`;
          setLastActionResult(description);
          playUiSound('action');
        } else {
          description = `Action ${actionType}: ${payload}`;
          setLastActionResult(description);
          playUiSound('action');
        }
      }

      const toolItem: ToolCallItem = {
        id: callId || `call-${Date.now()}`,
        name: toolName,
        args,
        timestamp: new Date(),
        status: 'executed',
        resultDescription: description,
      };

      setToolCalls((prev) => [toolItem, ...prev.slice(0, 19)]);
    },
    [setTheme]
  );

  // Playback an incoming 24kHz PCM audio chunk from Gemini Live
  const playAudioChunk = useCallback((base64Data: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const int16Array = base64ToInt16Array(base64Data);
      const audioBuffer = pcm16ToAudioBuffer(int16Array, ctx, 24000);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect to output analyser then to speaker destination
      if (outputAnalyserRef.current) {
        source.connect(outputAnalyserRef.current);
      } else {
        source.connect(ctx.destination);
      }

      const currentTime = ctx.currentTime;
      // Gapless scheduling
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      activeSourceNodesRef.current.push(source);
      setAssistantState('speaking');

      source.onended = () => {
        // Remove ended source
        activeSourceNodesRef.current = activeSourceNodesRef.current.filter((s) => s !== source);
        if (activeSourceNodesRef.current.length === 0) {
          setAssistantState('idle');
        }
      };
    } catch (err) {
      console.error('[AUDIO] Error decoding or scheduling audio chunk:', err);
    }
  }, []);

  // Initialize Visualizer Loop
  useEffect(() => {
    const updateVolumes = () => {
      // 1. Input mic volume
      if (inputAnalyserRef.current) {
        const inputData = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
        inputAnalyserRef.current.getByteFrequencyData(inputData);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i];
        }
        const avg = sum / inputData.length / 255;
        setInputVolume(avg);

        if (avg > 0.08 && activeSourceNodesRef.current.length === 0) {
          setAssistantState('listening');
        }
      }

      // 2. Output speaker volume
      if (outputAnalyserRef.current && activeSourceNodesRef.current.length > 0) {
        const outputData = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
        outputAnalyserRef.current.getByteFrequencyData(outputData);
        let sum = 0;
        for (let i = 0; i < outputData.length; i++) {
          sum += outputData[i];
        }
        const avg = sum / outputData.length / 255;
        setOutputVolume(avg);
      } else {
        setOutputVolume(0);
      }

      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    };

    animationFrameRef.current = requestAnimationFrame(updateVolumes);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Timer Tick Interval
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setActiveTimers((prev) =>
        prev
          .map((t) => {
            if (!t.isRunning) return t;
            const remaining = t.remainingSeconds - 1;
            if (remaining <= 0) {
              playUiSound('ding');
              setLastActionResult(`⏰ Timer "${t.label}" completed!`);
              return { ...t, remainingSeconds: 0, isRunning: false };
            }
            return { ...t, remainingSeconds: remaining };
          })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Connect to Gemini Live Voice Session
  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setErrorMessage(null);

      // 1. Initialize Web Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });

      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      // 2. Setup Output Analyser
      const outAnalyser = outputCtx.createAnalyser();
      outAnalyser.fftSize = 256;
      outAnalyser.connect(outputCtx.destination);
      outputAnalyserRef.current = outAnalyser;

      // 3. Capture Microphone (16kHz PCM stream)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const sourceNode = inputCtx.createMediaStreamSource(stream);
      const inAnalyser = inputCtx.createAnalyser();
      inAnalyser.fftSize = 256;
      sourceNode.connect(inAnalyser);
      inputAnalyserRef.current = inAnalyser;

      // Script processor node to read raw Float32 samples and stream PCM16 chunks
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      sourceNode.connect(processor);
      processor.connect(inputCtx.destination);

      // 4. Open WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        // Check mute / push-to-talk states
        if (isMutedRef.current) return;
        if (isPushToTalkRef.current && !isHoldingPTTRef.current) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);
        const pcm16Buffer = floatTo16BitPCM(inputChannelData);
        const base64Audio = arrayBufferToBase64(pcm16Buffer);

        ws.send(
          JSON.stringify({
            type: 'audio',
            data: base64Audio,
          })
        );
      };

      ws.onopen = () => {
        console.log('[CLIENT] WebSocket connected to server');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'session_ready') {
            setStatus('connected');
            playUiSound('connect');
          } else if (msg.type === 'audio' && msg.data) {
            playAudioChunk(msg.data);
          } else if (msg.type === 'interrupted') {
            console.log('[CLIENT] Interrupted by user voice');
            stopAllAudioOutput();
            playUiSound('interrupt');
          } else if (msg.type === 'user_transcript') {
            const text = msg.text;
            setCurrentLiveUserText(text);
            setTranscripts((prev) => {
              const last = prev[0];
              if (last && last.speaker === 'user' && !last.isFinal) {
                return [{ ...last, text: `${last.text} ${text}` }, ...prev.slice(1)];
              }
              return [{ id: `usr-${Date.now()}`, speaker: 'user', text, timestamp: new Date() }, ...prev];
            });
          } else if (msg.type === 'model_transcript') {
            const text = msg.text;
            setCurrentLiveModelText(text);
            setTranscripts((prev) => {
              const last = prev[0];
              if (last && last.speaker === 'assistant' && !last.isFinal) {
                return [{ ...last, text: `${last.text} ${text}` }, ...prev.slice(1)];
              }
              return [{ id: `ast-${Date.now()}`, speaker: 'assistant', text, timestamp: new Date() }, ...prev];
            });
          } else if (msg.type === 'tool_call') {
            setAssistantState('tool_executing');
            handleClientToolExecution(msg.tool, msg.args, msg.callId);
          } else if (msg.type === 'turn_complete') {
            setCurrentLiveUserText('');
            setCurrentLiveModelText('');
            setTranscripts((prev) =>
              prev.map((t, idx) => (idx < 2 ? { ...t, isFinal: true } : t))
            );
          } else if (msg.type === 'error') {
            console.error('[CLIENT] WebSocket error message:', msg.message);
            setErrorMessage(msg.message);
            setStatus('error');
          }
        } catch (err) {
          console.error('[CLIENT] Error handling ws message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[CLIENT] WebSocket error:', err);
        setStatus('error');
        setErrorMessage('WebSocket connection failed. Please check network or API key configuration.');
      };

      ws.onclose = () => {
        console.log('[CLIENT] WebSocket closed');
        setStatus('disconnected');
        setAssistantState('idle');
      };
    } catch (err: any) {
      console.error('[CLIENT] Connect failed:', err);
      setStatus('error');
      setErrorMessage(
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : err?.message || 'Failed to start Live Voice session.'
      );
    }
  }, [playAudioChunk, stopAllAudioOutput, handleClientToolExecution]);

  // Disconnect & Cleanup
  const disconnect = useCallback(() => {
    playUiSound('disconnect');
    stopAllAudioOutput();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    setStatus('disconnected');
    setAssistantState('idle');
  }, [stopAllAudioOutput]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const interrupt = useCallback(() => {
    stopAllAudioOutput();
  }, [stopAllAudioOutput]);

  const dismissTimer = useCallback((timerId: string) => {
    setActiveTimers((prev) => prev.filter((t) => t.id !== timerId));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  return {
    status,
    assistantState,
    isMuted,
    isPushToTalk,
    isHoldingPTT,
    errorMessage,
    inputVolume,
    outputVolume,
    transcripts,
    currentLiveUserText,
    currentLiveModelText,
    toolCalls,
    activeTimers,
    notes,
    lastActionResult,
    connect,
    disconnect,
    toggleMute,
    interrupt,
    setIsPushToTalk,
    setIsHoldingPTT,
    dismissTimer,
    deleteNote,
    setLastActionResult,
  };
}
