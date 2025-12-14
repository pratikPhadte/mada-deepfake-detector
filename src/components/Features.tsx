import { motion } from 'framer-motion';
import { Image, Video, Music, Zap, Shield, Code, RefreshCw, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Image,
    title: 'Image Detection',
    description: 'Detect AI-generated images from DALL-E, Midjourney, Stable Diffusion, and more.',
  },
  {
    icon: Video,
    title: 'Video Analysis',
    description: 'Frame-by-frame analysis to identify deepfake videos and face swaps.',
  },
  {
    icon: Music,
    title: 'Audio Verification',
    description: 'Detect AI-synthesized voices and cloned audio content.',
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Get results in milliseconds with our optimized inference pipeline.',
  },
  {
    icon: Shield,
    title: 'High Accuracy',
    description: 'State-of-the-art models trained on millions of samples.',
  },
  {
    icon: Code,
    title: 'Simple API',
    description: 'RESTful API with SDKs for Python, JavaScript, and more.',
  },
  {
    icon: RefreshCw,
    title: 'Model Swapping',
    description: 'Switch between detection models on-the-fly for A/B testing.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track detection metrics and model performance over time.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-mada-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white uppercase tracking-wide">
            Capabilities
          </h2>
          <p className="mt-4 text-lg text-mada-gray-500 max-w-2xl mx-auto">
            Comprehensive detection for images, videos, and audio with enterprise-grade reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-dark group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 group-hover:bg-mada-red/20 transition-colors">
                <feature.icon className="w-6 h-6 text-mada-gray-500 group-hover:text-mada-red transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-mada-gray-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
