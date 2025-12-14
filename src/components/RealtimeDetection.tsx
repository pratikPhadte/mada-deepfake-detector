import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Shield,
  ShieldAlert,
  Activity,
  Wifi,
  WifiOff,
  Settings,
  X,
} from 'lucide-react';
import { useRealtimeDetection } from '../hooks/useRealtimeDetection';

type DetectionMode = 'video' | 'audio';

interface RealtimeDetectionProps {
  onClose?: () => void;
}

export function RealtimeDetection({ onClose }: RealtimeDetectionProps) {
  const [mode, setMode] = useState<DetectionMode>('video');
  const [showSettings, setShowSettings] = useState(false);
  const [intervalMs, setIntervalMs] = useState(500);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const {
    isConnected,
    isStreaming,
    lastResult,
    results,
    startStream,
    stopStream,
    disconnect,
    error,
  } = useRealtimeDetection({
    type: mode,
    intervalMs,
    onResult: (result) => {
      console.log('Detection result:', result);
    },
  });

  // Update video preview when streaming starts
  useEffect(() => {
    if (isStreaming && mode === 'video' && videoPreviewRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }

    return () => {
      if (videoPreviewRef.current?.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isStreaming, mode]);

  const handleToggleStream = async () => {
    if (isStreaming) {
      stopStream();
      disconnect();
    } else {
      await startStream();
    }
  };

  const handleModeChange = (newMode: DetectionMode) => {
    if (isStreaming) {
      stopStream();
      disconnect();
    }
    setMode(newMode);
  };

  // Calculate stats
  const recentResults = results.slice(-20);
  const fakeCount = recentResults.filter((r) => r.is_fake).length;
  const avgConfidence =
    recentResults.length > 0
      ? recentResults.reduce((sum, r) => sum + r.confidence, 0) / recentResults.length
      : 0;
  const avgProcessingTime =
    recentResults.length > 0
      ? recentResults.reduce((sum, r) => sum + r.processing_time_ms, 0) / recentResults.length
      : 0;

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mada-red/10 rounded-lg">
            <Activity className="w-5 h-5 text-mada-red" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-mada-gray-900">
              Real-time Detection
            </h2>
            <p className="text-sm text-mada-gray-500">
              Detect deepfakes in live video or audio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-mada-gray-400 hover:text-mada-gray-600 hover:bg-mada-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-mada-gray-400 hover:text-mada-gray-600 hover:bg-mada-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-mada-gray-50 rounded-xl"
          >
            <h3 className="text-sm font-medium text-mada-gray-700 mb-3">
              Detection Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-mada-gray-500 mb-1">
                  Detection Interval
                </label>
                <select
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                  disabled={isStreaming}
                  className="input text-sm py-2"
                >
                  <option value={250}>250ms (Fast)</option>
                  <option value={500}>500ms (Balanced)</option>
                  <option value={1000}>1000ms (Efficient)</option>
                  <option value={2000}>2000ms (Battery Saver)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-mada-gray-500 mb-1">
                  Detection Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModeChange('video')}
                    disabled={isStreaming}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      mode === 'video'
                        ? 'bg-mada-red text-white'
                        : 'bg-white text-mada-gray-600 border border-mada-gray-200'
                    } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => handleModeChange('audio')}
                    disabled={isStreaming}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      mode === 'audio'
                        ? 'bg-mada-red text-white'
                        : 'bg-white text-mada-gray-600 border border-mada-gray-200'
                    } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Audio
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview / Visualization */}
        <div className="relative aspect-video bg-mada-gray-900 rounded-xl overflow-hidden">
          {mode === 'video' ? (
            <>
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="w-12 h-12 text-mada-gray-600 mx-auto mb-2" />
                    <p className="text-mada-gray-400 text-sm">Camera off</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isStreaming ? (
                <div className="text-center">
                  <div className="relative">
                    <Mic className="w-16 h-16 text-mada-red mx-auto" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 border-4 border-mada-red/30 rounded-full"
                    />
                  </div>
                  <p className="text-mada-gray-300 text-sm mt-4">Listening...</p>
                </div>
              ) : (
                <div className="text-center">
                  <MicOff className="w-12 h-12 text-mada-gray-600 mx-auto mb-2" />
                  <p className="text-mada-gray-400 text-sm">Microphone off</p>
                </div>
              )}
            </div>
          )}

          {/* Live indicator */}
          {isStreaming && (
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/50 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-medium">LIVE</span>
            </div>
          )}

          {/* Real-time result overlay */}
          {isStreaming && lastResult && (
            <div className="absolute bottom-3 left-3 right-3">
              <div
                className={`flex items-center justify-between p-3 rounded-lg backdrop-blur-sm ${
                  lastResult.is_fake
                    ? 'bg-red-500/80 text-white'
                    : 'bg-emerald-500/80 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {lastResult.is_fake ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {lastResult.is_fake ? 'Deepfake Detected' : 'Authentic'}
                  </span>
                </div>
                <span className="text-sm font-mono">
                  {Math.round(lastResult.confidence * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats and controls */}
        <div className="flex flex-col">
          {/* Connection status */}
          <div className="flex items-center gap-2 mb-4">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-mada-gray-400" />
                <span className="text-sm text-mada-gray-500">Disconnected</span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-mada-gray-50 rounded-xl">
              <p className="text-xs text-mada-gray-500 mb-1">Detections</p>
              <p className="text-xl font-semibold text-mada-gray-900">
                {results.length}
              </p>
            </div>
            <div className="p-3 bg-mada-gray-50 rounded-xl">
              <p className="text-xs text-mada-gray-500 mb-1">Fake Alerts</p>
              <p className={`text-xl font-semibold ${fakeCount > 0 ? 'text-mada-red' : 'text-mada-gray-900'}`}>
                {fakeCount}
              </p>
            </div>
            <div className="p-3 bg-mada-gray-50 rounded-xl">
              <p className="text-xs text-mada-gray-500 mb-1">Avg Confidence</p>
              <p className="text-xl font-semibold text-mada-gray-900">
                {Math.round(avgConfidence * 100)}%
              </p>
            </div>
            <div className="p-3 bg-mada-gray-50 rounded-xl">
              <p className="text-xs text-mada-gray-500 mb-1">Avg Latency</p>
              <p className="text-xl font-semibold text-mada-gray-900">
                {Math.round(avgProcessingTime)}ms
              </p>
            </div>
          </div>

          {/* Detection history mini chart */}
          <div className="flex-1 mb-6">
            <p className="text-xs text-mada-gray-500 mb-2">Recent Detections</p>
            <div className="flex items-end gap-1 h-16">
              {recentResults.slice(-20).map((result, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all ${
                    result.is_fake ? 'bg-mada-red' : 'bg-emerald-500'
                  }`}
                  style={{ height: `${result.confidence * 100}%` }}
                  title={`${result.is_fake ? 'Fake' : 'Real'}: ${Math.round(result.confidence * 100)}%`}
                />
              ))}
              {recentResults.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-mada-gray-400 text-xs">
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-mada-red-light text-mada-red-dark text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Control button */}
          <button
            onClick={handleToggleStream}
            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              isStreaming
                ? 'bg-mada-gray-900 text-white hover:bg-mada-gray-800'
                : 'bg-mada-red text-white hover:bg-mada-red-dark'
            }`}
          >
            {mode === 'video' ? (
              isStreaming ? (
                <>
                  <VideoOff className="w-5 h-5" />
                  Stop Detection
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Start Video Detection
                </>
              )
            ) : isStreaming ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Detection
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Audio Detection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
