import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Clock, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DetectionResponse } from '../utils/api';

interface ResultCardProps {
  result: DetectionResponse;
  onReset: () => void;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isFake = result.result?.is_fake ?? false;
  const confidence = result.result?.confidence ?? 0;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={`
        card overflow-hidden
        ${isFake ? 'ring-2 ring-mada-red/20' : 'ring-2 ring-emerald-500/20'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isFake ? (
              <div className="p-3 bg-mada-red-light rounded-xl">
                <ShieldAlert className="w-6 h-6 text-mada-red" />
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-mada-gray-900">
                {isFake ? 'AI-Generated Detected' : 'Appears Authentic'}
              </h3>
              <p className="text-sm text-mada-gray-500">
                Analysis completed
              </p>
            </div>
          </div>
          <span className={`badge ${isFake ? 'badge-fake' : 'badge-real'}`}>
            {isFake ? 'FAKE' : 'REAL'}
          </span>
        </div>

        {/* Confidence meter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-mada-gray-700">
              Confidence
            </span>
            <span className={`text-2xl font-bold ${isFake ? 'text-mada-red' : 'text-emerald-600'}`}>
              {confidencePercent}%
            </span>
          </div>
          <div className="h-3 bg-mada-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${isFake ? 'bg-mada-red' : 'bg-emerald-500'}`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-mada-gray-50 rounded-xl">
            <Clock className="w-5 h-5 text-mada-gray-400" />
            <div>
              <p className="text-xs text-mada-gray-500">Processing Time</p>
              <p className="font-medium text-mada-gray-900">
                {result.processing_time_ms}ms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-mada-gray-50 rounded-xl">
            <Cpu className="w-5 h-5 text-mada-gray-400" />
            <div>
              <p className="text-xs text-mada-gray-500">Model</p>
              <p className="font-medium text-mada-gray-900 truncate text-sm">
                {result.result?.model_used?.split(':')[0] || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Details toggle */}
        {result.result?.details && Object.keys(result.result.details).length > 0 && (
          <div className="border-t border-mada-gray-100 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-mada-gray-600 hover:text-mada-gray-900 transition-colors"
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>{showDetails ? 'Hide' : 'Show'} technical details</span>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <pre className="p-4 bg-mada-gray-900 text-mada-gray-100 rounded-xl text-xs font-mono overflow-x-auto">
                  {JSON.stringify(result.result.details, null, 2)}
                </pre>
              </motion.div>
            )}
          </div>
        )}

        {/* Action */}
        <div className="mt-6">
          <button onClick={onReset} className="btn-secondary w-full">
            Analyze Another File
          </button>
        </div>
      </div>
    </motion.div>
  );
}
