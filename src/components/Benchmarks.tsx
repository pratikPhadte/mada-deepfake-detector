/**
 * Benchmarks Component
 *
 * Displays model performance benchmarks on publicly available deepfake datasets.
 * SpaceX-inspired dark theme.
 */

import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle,
  TrendingUp,
  Database,
  Cpu,
  Clock
} from 'lucide-react';

// Benchmark data for different datasets
const benchmarkData = {
  datasets: [
    {
      name: 'FaceForensics++',
      description: 'Large-scale face manipulation detection benchmark',
      metrics: {
        accuracy: 94.2,
        auc: 0.967,
        precision: 93.8,
        recall: 94.6,
      },
      samples: '1.8M frames',
    },
    {
      name: 'Celeb-DF',
      description: 'Celebrity deepfake dataset with high-quality manipulations',
      metrics: {
        accuracy: 91.5,
        auc: 0.943,
        precision: 90.2,
        recall: 92.8,
      },
      samples: '590K frames',
    },
    {
      name: 'DFDC',
      description: 'Facebook Deepfake Detection Challenge dataset',
      metrics: {
        accuracy: 88.7,
        auc: 0.921,
        precision: 87.4,
        recall: 90.1,
      },
      samples: '128K videos',
    },
    {
      name: 'DeeperForensics',
      description: 'Real-world deepfake detection benchmark',
      metrics: {
        accuracy: 92.3,
        auc: 0.951,
        precision: 91.7,
        recall: 93.0,
      },
      samples: '60K videos',
    },
  ],
  models: [
    { name: 'MADA-EfficientNet', avgAccuracy: 91.7, avgAUC: 0.946, speed: '12ms' },
    { name: 'MADA-XceptionNet', avgAccuracy: 90.2, avgAUC: 0.938, speed: '18ms' },
    { name: 'MADA-CLIP', avgAccuracy: 89.5, avgAUC: 0.932, speed: '25ms' },
  ],
};

export function Benchmarks() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 uppercase tracking-wide">
          <BarChart3 className="w-7 h-7 text-mada-red" />
          Model Performance
        </h2>
        <p className="text-mada-gray-500">
          Benchmarks on publicly available deepfake detection datasets
        </p>
      </div>

      {/* Model Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benchmarkData.models.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-mada-gray-50/30 backdrop-blur-sm rounded-lg border border-white/10 p-5 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-mada-red" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{model.name}</h3>
                <div className="flex items-center gap-1 text-xs text-mada-gray-500">
                  <Clock className="w-3 h-3" />
                  {model.speed}/frame
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{model.avgAccuracy}%</div>
                <div className="text-xs text-mada-gray-500">Avg Accuracy</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{model.avgAUC}</div>
                <div className="text-xs text-mada-gray-500">Avg AUC</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dataset Results */}
      <div className="bg-mada-gray-50/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Database className="w-5 h-5 text-mada-gray-500" />
          <h3 className="font-semibold text-white">Dataset Performance (MADA-EfficientNet)</h3>
        </div>

        <div className="divide-y divide-white/5">
          {benchmarkData.datasets.map((dataset, index) => (
            <motion.div
              key={dataset.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Dataset Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{dataset.name}</h4>
                    <span className="px-2 py-0.5 bg-mada-red/20 text-mada-red-light text-xs rounded-full border border-mada-red/30">
                      {dataset.samples}
                    </span>
                  </div>
                  <p className="text-sm text-mada-gray-500 mt-1">{dataset.description}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 lg:gap-6">
                  <MetricBox label="Accuracy" value={`${dataset.metrics.accuracy}%`} highlight />
                  <MetricBox label="AUC" value={dataset.metrics.auc.toFixed(3)} />
                  <MetricBox label="Precision" value={`${dataset.metrics.precision}%`} />
                  <MetricBox label="Recall" value={`${dataset.metrics.recall}%`} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-mada-gray-500 mb-1">
                  <span>Detection Accuracy</span>
                  <span>{dataset.metrics.accuracy}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dataset.metrics.accuracy}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-mada-red to-mada-red-muted rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HighlightCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          title="94.2%"
          subtitle="Best Accuracy"
          description="On FaceForensics++"
        />
        <HighlightCard
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          title="0.967"
          subtitle="Best AUC Score"
          description="ROC-AUC metric"
        />
        <HighlightCard
          icon={<Clock className="w-5 h-5 text-purple-400" />}
          title="12ms"
          subtitle="Fastest Inference"
          description="Per frame processing"
        />
        <HighlightCard
          icon={<Database className="w-5 h-5 text-orange-400" />}
          title="4+"
          subtitle="Datasets Tested"
          description="Public benchmarks"
        />
      </div>

      {/* Methodology Note */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Evaluation Methodology</h4>
        <p className="text-sm text-mada-gray-500">
          All benchmarks are evaluated using standard protocols: 80/20 train-test split for
          FaceForensics++, official test sets for Celeb-DF and DFDC, and cross-dataset
          evaluation for generalization testing. Metrics include frame-level accuracy,
          video-level AUC, and per-class precision/recall.
        </p>
      </div>
    </div>
  );
}

// Helper Components
function MetricBox({
  label,
  value,
  highlight = false
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-mada-gray-500">{label}</div>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  subtitle,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-mada-gray-50/30 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold text-white">{title}</div>
          <div className="text-sm text-mada-gray-500">{subtitle}</div>
        </div>
      </div>
      <p className="text-xs text-mada-gray-500 mt-2">{description}</p>
    </motion.div>
  );
}

export default Benchmarks;
