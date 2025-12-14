import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface DetectionResult {
  is_fake: boolean;
  confidence: number;
  model_used: string;
  details: Record<string, unknown>;
}

export interface DetectionResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  media_type: 'image' | 'video' | 'audio';
  result: DetectionResult | null;
  created_at: string;
  completed_at: string | null;
  processing_time_ms: number | null;
  error: string | null;
}

export interface ModelInfo {
  name: string;
  type: string;
  is_loaded: boolean;
  is_active: boolean;
}

export interface ModelsResponse {
  image: ModelInfo[];
  video: ModelInfo[];
  audio: ModelInfo[];
}

export const detectMedia = async (
  file: File,
  model?: string
): Promise<DetectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const params = model ? { model } : {};

  const response = await api.post<DetectionResponse>('/detect/', formData, {
    params,
  });
  return response.data;
};

export const detectImage = async (
  file: File,
  model?: string
): Promise<DetectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const params = model ? { model } : {};

  const response = await api.post<DetectionResponse>('/detect/image', formData, {
    params,
  });
  return response.data;
};

export const detectVideo = async (
  file: File,
  model?: string
): Promise<DetectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const params = model ? { model } : {};

  const response = await api.post<DetectionResponse>('/detect/video', formData, {
    params,
  });
  return response.data;
};

export const detectAudio = async (
  file: File,
  model?: string
): Promise<DetectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const params = model ? { model } : {};

  const response = await api.post<DetectionResponse>('/detect/audio', formData, {
    params,
  });
  return response.data;
};

export const getModels = async (): Promise<ModelsResponse> => {
  const response = await api.get<ModelsResponse>('/models/');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};
