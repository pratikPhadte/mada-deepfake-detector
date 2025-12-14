/**
 * FaceSwapDemo Component
 *
 * Main component for the face swap demonstration.
 * Shows side-by-side view of original and face-swapped video,
 * with real-time deepfake detection results.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Shield,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useFaceSwap, DetectionResult } from '../../hooks/useFaceSwap';
import { FaceSelector } from './FaceSelector';

export function FaceSwapDemo() {
  const {
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
    toggleFaceSwap,
    videoRef,
    originalCanvasRef,
    swappedCanvasRef,
    presetFaces,
  } = useFaceSwap();

  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-red-500" />
          Face Swap Detection Demo
        </h2>
        <p className="text-gray-600">
          See how our AI detects face-swapped (deepfake) video in real-time
        </p>
      </div>

      {/* Info Banner */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">How it works</h4>
                <ol className="mt-1 text-sm text-blue-800 space-y-1">
                  <li>1. Click "Start Camera" to enable your webcam</li>
                  <li>2. Select a face from the options below to swap with</li>
                  <li>3. Watch as our AI detects the swapped face as a deepfake!</li>
                </ol>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Face Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <FaceSelector
          faces={presetFaces}
          selectedFace={selectedFace}
          onSelect={selectFace}
          disabled={!isStreaming}
        />
      </div>

      {/* Video Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Stream */}
        <VideoPanel
          title="Original Feed"
          subtitle="Your actual webcam"
          canvasRef={originalCanvasRef}
          isStreaming={isStreaming}
          result={originalResult}
          showFaceIndicator={!!currentFace}
        />

        {/* Swapped Stream */}
        <VideoPanel
          title="Face-Swapped Feed"
          subtitle={isFaceSwapEnabled ? `Swapped with ${selectedFace?.name}` : 'Select a face to swap'}
          canvasRef={swappedCanvasRef}
          isStreaming={isStreaming}
          result={swappedResult}
          isSwapped={isFaceSwapEnabled}
          showFaceIndicator={!!currentFace && isFaceSwapEnabled}
        />
      </div>

      {/* Hidden video element for capture */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {!isStreaming ? (
          <motion.button
            onClick={startStream}
            disabled={!isLoaded}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!isLoaded ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Start Camera
              </>
            )}
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={stopStream}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Square className="w-5 h-5" />
              Stop Camera
            </motion.button>

            {selectedFace && (
              <motion.button
                onClick={toggleFaceSwap}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                  isFaceSwapEnabled
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                {isFaceSwapEnabled ? 'Disable Swap' : 'Enable Swap'}
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Results Summary */}
      {isStreaming && (originalResult || swappedResult) && (
        <ResultsSummary
          originalResult={originalResult}
          swappedResult={swappedResult}
        />
      )}
    </div>
  );
}

// Video Panel Component
interface VideoPanelProps {
  title: string;
  subtitle: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  result: DetectionResult | null;
  isSwapped?: boolean;
  showFaceIndicator?: boolean;
}

function VideoPanel({
  title,
  subtitle,
  canvasRef,
  isStreaming,
  result,
  isSwapped = false,
  showFaceIndicator = false,
}: VideoPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-red-600">LIVE</span>
          </div>
        )}
      </div>

      {/* Video Canvas */}
      <div className="relative aspect-video bg-gray-900">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          width={640}
          height={480}
        />

        {/* Placeholder when not streaming */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <CameraOff className="w-12 h-12 mb-2" />
            <span className="text-sm">Camera not active</span>
          </div>
        )}

        {/* Face indicator */}
        {showFaceIndicator && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/80 rounded text-white text-xs font-medium">
            Face Detected
          </div>
        )}

        {/* Swap indicator */}
        {isSwapped && isStreaming && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/80 rounded text-white text-xs font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Swapped
          </div>
        )}

        {/* Detection result overlay */}
        {result && isStreaming && (
          <div className={`absolute bottom-0 left-0 right-0 p-3 ${
            result.is_fake
              ? 'bg-gradient-to-t from-red-900/90 to-transparent'
              : 'bg-gradient-to-t from-green-900/90 to-transparent'
          }`}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {result.is_fake ? (
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                ) : (
                  <Shield className="w-5 h-5 text-green-400" />
                )}
                <span className="font-semibold">
                  {result.is_fake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {(result.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs opacity-75">
                  {result.processing_time_ms}ms
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Results Summary Component
interface ResultsSummaryProps {
  originalResult: DetectionResult | null;
  swappedResult: DetectionResult | null;
}

function ResultsSummary({ originalResult, swappedResult }: ResultsSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Detection Summary
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Original */}
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Original Feed</div>
          {originalResult ? (
            <div className={`flex items-center gap-2 ${
              originalResult.is_fake ? 'text-red-400' : 'text-green-400'
            }`}>
              {originalResult.is_fake ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">
                {originalResult.is_fake ? 'Fake' : 'Authentic'}
              </span>
              <span className="text-gray-400">
                ({(originalResult.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          ) : (
            <div className="text-gray-500">Waiting for detection...</div>
          )}
        </div>

        {/* Swapped */}
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Face-Swapped Feed</div>
          {swappedResult ? (
            <div className={`flex items-center gap-2 ${
              swappedResult.is_fake ? 'text-red-400' : 'text-green-400'
            }`}>
              {swappedResult.is_fake ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">
                {swappedResult.is_fake ? 'Fake Detected!' : 'Authentic'}
              </span>
              <span className="text-gray-400">
                ({(swappedResult.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          ) : (
            <div className="text-gray-500">Enable face swap to test...</div>
          )}
        </div>
      </div>

      {/* Explanation */}
      {swappedResult?.is_fake && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-300">
          <strong>How it works:</strong> Our AI model analyzes subtle artifacts and inconsistencies
          introduced by face-swapping algorithms, such as blending boundaries, skin texture
          mismatches, and lighting inconsistencies that are invisible to the human eye.
        </div>
      )}
    </motion.div>
  );
}

export default FaceSwapDemo;
