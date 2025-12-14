import { useState, useCallback } from 'react';
import { detectMedia, DetectionResponse } from '../utils/api';

interface UseDetectionReturn {
  detect: (file: File, model?: string) => Promise<void>;
  result: DetectionResponse | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useDetection(): UseDetectionReturn {
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (file: File, model?: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await detectMedia(file, model);
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Detection failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { detect, result, isLoading, error, reset };
}
