/**
 * useFaceSwap Hook
 *
 * Combines MediaPipe face detection with FaceSwapEngine for real-time face swapping.
 * Also handles sending frames to the backend for deepfake detection.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceDetection, FACE_OVAL_INDICES, LEFT_EYE_INDICES, RIGHT_EYE_INDICES, LIPS_INDICES, NOSE_TIP_INDEX } from './useMediaPipe';
import { FaceSwapEngine, PresetFace, PRESET_FACES } from '../lib/faceswap/FaceSwapEngine';

export interface DetectionResult {
  is_fake: boolean;
  confidence: number;
  processing_time_ms: number;
  model: string;
  source: 'original' | 'swapped';
}

interface UseFaceSwapOptions {
  onOriginalDetection?: (result: DetectionResult) => void;
  onSwappedDetection?: (result: DetectionResult) => void;
}

interface UseFaceSwapReturn {
  // State
  isLoaded: boolean;
  isStreaming: boolean;
  isFaceSwapEnabled: boolean;
  selectedFace: PresetFace | null;
  currentFace: FaceDetection | null;
  error: string | null;

  // Detection results
  originalResult: DetectionResult | null;
  swappedResult: DetectionResult | null;

  // Actions
  startStream: () => Promise<void>;
  stopStream: () => void;
  selectFace: (face: PresetFace) => Promise<void>;
  clearFace: () => void;
  toggleFaceSwap: () => void;

  // Refs for rendering
  videoRef: React.RefObject<HTMLVideoElement>;
  originalCanvasRef: React.RefObject<HTMLCanvasElement>;
  swappedCanvasRef: React.RefObject<HTMLCanvasElement>;

  // Available faces
  presetFaces: PresetFace[];
}

export function useFaceSwap(options: UseFaceSwapOptions = {}): UseFaceSwapReturn {
  const { onOriginalDetection, onSwappedDetection } = options;

  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFaceSwapEnabled, setIsFaceSwapEnabled] = useState(false);
  const [selectedFace, setSelectedFace] = useState<PresetFace | null>(null);
  const [currentFace, setCurrentFace] = useState<FaceDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalResult, setOriginalResult] = useState<DetectionResult | null>(null);
  const [swappedResult, setSwappedResult] = useState<DetectionResult | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const swappedCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceSwapEngineRef = useRef<FaceSwapEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wsOriginalRef = useRef<WebSocket | null>(null);
  const wsSwappedRef = useRef<WebSocket | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate a simple face detection (assumes face is centered in frame)
  const generateFaceDetection = useCallback((): FaceDetection => {
    // Assume face is roughly centered and takes up ~40% of frame
    const centerX = 0.5;
    const centerY = 0.45;
    const faceWidth = 0.35;
    const faceHeight = 0.45;

    // Generate approximate face oval points
    const ovalPoints: { x: number; y: number; z: number }[] = [];
    const numPoints = 36;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      ovalPoints.push({
        x: centerX + Math.cos(angle) * faceWidth * 0.4,
        y: centerY + Math.sin(angle) * faceHeight * 0.45,
        z: 0,
      });
    }

    // Generate 468 placeholder landmarks
    const landmarks: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < 468; i++) {
      landmarks.push({
        x: centerX + (Math.sin(i * 0.1) * 0.1),
        y: centerY + (Math.cos(i * 0.1) * 0.1),
        z: 0,
      });
    }

    // Set specific landmark positions
    landmarks[NOSE_TIP_INDEX] = { x: centerX, y: centerY + 0.05, z: 0 };

    // Left eye area
    const leftEyeX = centerX - 0.08;
    const leftEyeY = centerY - 0.05;
    LEFT_EYE_INDICES.forEach((idx, i) => {
      landmarks[idx] = {
        x: leftEyeX + (i - 3) * 0.01,
        y: leftEyeY + Math.sin(i) * 0.01,
        z: 0,
      };
    });

    // Right eye area
    const rightEyeX = centerX + 0.08;
    const rightEyeY = centerY - 0.05;
    RIGHT_EYE_INDICES.forEach((idx, i) => {
      landmarks[idx] = {
        x: rightEyeX + (i - 3) * 0.01,
        y: rightEyeY + Math.sin(i) * 0.01,
        z: 0,
      };
    });

    // Lips
    const lipsY = centerY + 0.15;
    LIPS_INDICES.forEach((idx, i) => {
      landmarks[idx] = {
        x: centerX + (i - 5) * 0.015,
        y: lipsY + Math.sin(i * 0.5) * 0.01,
        z: 0,
      };
    });

    // Face oval
    FACE_OVAL_INDICES.forEach((idx, i) => {
      landmarks[idx] = ovalPoints[i % ovalPoints.length];
    });

    return {
      landmarks,
      boundingBox: {
        x: centerX - faceWidth / 2,
        y: centerY - faceHeight / 2,
        width: faceWidth,
        height: faceHeight,
      },
      faceOval: FACE_OVAL_INDICES.map(i => landmarks[i]),
      leftEye: LEFT_EYE_INDICES.map(i => landmarks[i]),
      rightEye: RIGHT_EYE_INDICES.map(i => landmarks[i]),
      lips: LIPS_INDICES.map(i => landmarks[i]),
      noseTip: landmarks[NOSE_TIP_INDEX],
    };
  }, []);

  // Initialize face swap engine
  useEffect(() => {
    faceSwapEngineRef.current = new FaceSwapEngine({
      blendAmount: 0.95,
      featherAmount: 20,
      colorCorrection: false,
    });

    // Mark as loaded after short delay
    const timer = setTimeout(() => setIsLoaded(true), 300);

    return () => {
      clearTimeout(timer);
      faceSwapEngineRef.current?.dispose();
    };
  }, []);

  // Render loop
  useEffect(() => {
    if (!isStreaming) return;

    const render = () => {
      const video = videoRef.current;
      const originalCanvas = originalCanvasRef.current;
      const swappedCanvas = swappedCanvasRef.current;
      const engine = faceSwapEngineRef.current;

      if (!video || !originalCanvas || !swappedCanvas) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      // Set canvas sizes
      originalCanvas.width = width;
      originalCanvas.height = height;
      swappedCanvas.width = width;
      swappedCanvas.height = height;

      const originalCtx = originalCanvas.getContext('2d')!;
      const swappedCtx = swappedCanvas.getContext('2d')!;

      // Draw original frame
      originalCtx.drawImage(video, 0, 0, width, height);

      // Draw swapped frame
      if (isFaceSwapEnabled && engine && engine.hasTargetFace()) {
        // Generate face detection for the center of frame
        const faceDetection = generateFaceDetection();
        setCurrentFace(faceDetection);
        engine.processFrame(video, faceDetection, swappedCanvas);
      } else {
        // Just copy original if no face swap
        swappedCtx.drawImage(video, 0, 0, width, height);
        setCurrentFace(null);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, isFaceSwapEnabled, generateFaceDetection]);

  // Send frame to backend for detection
  const sendToDetection = useCallback((canvas: HTMLCanvasElement, source: 'original' | 'swapped') => {
    const ws = source === 'original' ? wsOriginalRef.current : wsSwappedRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // Try REST API fallback
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          const formData = new FormData();
          formData.append('file', blob, 'frame.jpg');

          const response = await fetch('/api/v1/detect/', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const result: DetectionResult = {
              is_fake: data.result?.is_fake ?? false,
              confidence: data.result?.confidence ?? 0,
              processing_time_ms: data.processing_time_ms ?? 0,
              model: data.result?.model_used ?? 'unknown',
              source,
            };

            if (source === 'original') {
              setOriginalResult(result);
              onOriginalDetection?.(result);
            } else {
              setSwappedResult(result);
              onSwappedDetection?.(result);
            }
          }
        } catch (err) {
          console.debug('Detection request failed:', err);
        }
      }, 'image/jpeg', 0.8);
      return;
    }

    // Send via WebSocket
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const base64Data = dataUrl.split(',')[1];

    ws.send(JSON.stringify({
      type: 'frame',
      data: base64Data,
      timestamp: Date.now(),
    }));
  }, [onOriginalDetection, onSwappedDetection]);

  // Connect WebSockets for detection
  const connectWebSockets = useCallback(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/api/v1/realtime/video`;

    // Original stream WebSocket
    const clientIdOriginal = `demo_original_${Date.now()}`;
    wsOriginalRef.current = new WebSocket(`${wsUrl}/${clientIdOriginal}?interval_ms=1000`);
    wsOriginalRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'detection_result') {
          const result: DetectionResult = {
            is_fake: data.is_fake,
            confidence: data.confidence,
            processing_time_ms: data.processing_time_ms,
            model: data.model,
            source: 'original',
          };
          setOriginalResult(result);
          onOriginalDetection?.(result);
        }
      } catch (e) {
        console.debug('Failed to parse WebSocket message:', e);
      }
    };

    // Swapped stream WebSocket
    const clientIdSwapped = `demo_swapped_${Date.now()}`;
    wsSwappedRef.current = new WebSocket(`${wsUrl}/${clientIdSwapped}?interval_ms=1000`);
    wsSwappedRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'detection_result') {
          const result: DetectionResult = {
            is_fake: data.is_fake,
            confidence: data.confidence,
            processing_time_ms: data.processing_time_ms,
            model: data.model,
            source: 'swapped',
          };
          setSwappedResult(result);
          onSwappedDetection?.(result);
        }
      } catch (e) {
        console.debug('Failed to parse WebSocket message:', e);
      }
    };
  }, [onOriginalDetection, onSwappedDetection]);

  // Disconnect WebSockets
  const disconnectWebSockets = useCallback(() => {
    if (wsOriginalRef.current) {
      wsOriginalRef.current.close();
      wsOriginalRef.current = null;
    }
    if (wsSwappedRef.current) {
      wsSwappedRef.current.close();
      wsSwappedRef.current = null;
    }
  }, []);

  // Start streaming
  const startStream = useCallback(async () => {
    try {
      setError(null);

      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not found');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      video.srcObject = stream;
      await video.play();

      // Connect detection WebSockets
      connectWebSockets();

      setIsStreaming(true);
    } catch (err) {
      console.error('Failed to start stream:', err);
      setError(`Failed to access camera: ${err}`);
    }
  }, [connectWebSockets]);

  // Stop streaming
  const stopStream = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    disconnectWebSockets();

    setIsStreaming(false);
    setCurrentFace(null);
    setOriginalResult(null);
    setSwappedResult(null);
  }, [disconnectWebSockets]);

  // Select a preset face
  const selectFace = useCallback(async (face: PresetFace) => {
    try {
      setError(null);
      await faceSwapEngineRef.current?.loadTargetFace(face);
      setSelectedFace(face);
      setIsFaceSwapEnabled(true);
    } catch (err) {
      console.error('Failed to load face:', err);
      setError(`Failed to load face: ${err}`);
    }
  }, []);

  // Clear selected face
  const clearFace = useCallback(() => {
    faceSwapEngineRef.current?.clearTargetFace();
    setSelectedFace(null);
    setIsFaceSwapEnabled(false);
  }, []);

  // Toggle face swap
  const toggleFaceSwap = useCallback(() => {
    if (!selectedFace) {
      setError('Please select a face first');
      return;
    }
    setIsFaceSwapEnabled((prev) => !prev);
  }, [selectedFace]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    isLoaded,
    isStreaming,
    isFaceSwapEnabled,
    selectedFace,
    currentFace,
    error,
    originalResult,
    swappedResult,
    startStream,
    stopStream,
    selectFace,
    clearFace,
    toggleFaceSwap,
    videoRef,
    originalCanvasRef,
    swappedCanvasRef,
    presetFaces: PRESET_FACES,
  };
}

export default useFaceSwap;
