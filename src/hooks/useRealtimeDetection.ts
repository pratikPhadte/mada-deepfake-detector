import { useState, useCallback, useRef, useEffect } from 'react';

interface DetectionResult {
  is_fake: boolean;
  confidence: number;
  timestamp: number;
  processing_time_ms: number;
  model: string;
}

interface UseRealtimeDetectionOptions {
  type: 'video' | 'audio';
  model?: string;
  intervalMs?: number;
  onResult?: (result: DetectionResult) => void;
  onError?: (error: string) => void;
}

interface UseRealtimeDetectionReturn {
  isConnected: boolean;
  isStreaming: boolean;
  lastResult: DetectionResult | null;
  results: DetectionResult[];
  connect: () => Promise<void>;
  disconnect: () => void;
  startStream: () => Promise<void>;
  stopStream: () => void;
  error: string | null;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/api/v1`;

export function useRealtimeDetection(
  options: UseRealtimeDetectionOptions
): UseRealtimeDetectionReturn {
  const { type, model, intervalMs = 500, onResult, onError } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const clientId = useRef(`client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const connect = useCallback(async () => {
    const endpoint = type === 'video' ? 'video' : 'audio';
    const params = new URLSearchParams();
    if (model) params.set('model', model);
    if (type === 'video') params.set('interval_ms', intervalMs.toString());
    if (type === 'audio') params.set('chunk_duration_ms', '2000');

    const wsUrl = `${WS_BASE_URL}/realtime/${endpoint}/${clientId.current}?${params}`;

    return new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);

          if (message.type === 'connected') {
            resolve();
          } else if (message.type === 'detection_result') {
            const result: DetectionResult = {
              is_fake: message.is_fake,
              confidence: message.confidence,
              timestamp: message.timestamp,
              processing_time_ms: message.processing_time_ms,
              model: message.model,
            };
            setLastResult(result);
            setResults((prev) => [...prev.slice(-49), result]); // Keep last 50
            onResult?.(result);
          } else if (message.type === 'error') {
            setError(message.message);
            onError?.(message.message);
          }
        };

        ws.onerror = () => {
          setError('WebSocket connection error');
          reject(new Error('WebSocket connection error'));
        };

        ws.onclose = () => {
          setIsConnected(false);
          setIsStreaming(false);
        };

        wsRef.current = ws;
      } catch (err) {
        reject(err);
      }
    });
  }, [type, model, intervalMs, onResult, onError]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    stopStream();
  }, []);

  const startVideoStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      // Create video element for capturing frames
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      videoRef.current = video;

      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      canvasRef.current = canvas;

      // Start sending frames
      intervalRef.current = window.setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN && videoRef.current) {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx && canvasRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, 640, 480);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7);
            const base64Data = dataUrl.split(',')[1];

            wsRef.current.send(JSON.stringify({
              type: 'frame',
              data: base64Data,
              timestamp: Date.now(),
            }));
          }
        }
      }, intervalMs);

      setIsStreaming(true);
    } catch (err) {
      setError('Failed to access camera');
      throw err;
    }
  }, [intervalMs]);

  const startAudioStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for capturing audio data
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          // Convert float32 to int16
          const int16Data = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }

          // Convert to base64
          const uint8Data = new Uint8Array(int16Data.buffer);
          const base64Data = btoa(String.fromCharCode(...uint8Data));

          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            data: base64Data,
            sample_rate: 16000,
            timestamp: Date.now(),
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsStreaming(true);
    } catch (err) {
      setError('Failed to access microphone');
      throw err;
    }
  }, []);

  const startStream = useCallback(async () => {
    if (!isConnected) {
      await connect();
    }

    if (type === 'video') {
      await startVideoStream();
    } else {
      await startAudioStream();
    }
  }, [type, isConnected, connect, startVideoStream, startAudioStream]);

  const stopStream = useCallback(() => {
    // Stop interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Cleanup audio context
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isStreaming,
    lastResult,
    results,
    connect,
    disconnect,
    startStream,
    stopStream,
    error,
  };
}
