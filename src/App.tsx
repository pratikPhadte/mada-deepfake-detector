import { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { Benchmarks } from './components/Benchmarks';
import { Footer } from './components/Footer';
import { useDetection } from './hooks/useDetection';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function App() {
  const [showDemo, setShowDemo] = useState(false);
  const { detect, result, isLoading, error, reset } = useDetection();

  const handleFileSelect = async (file: File) => {
    await detect(file);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section - Full screen like Starlink */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background artifacts */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/5 rounded-full blur-3xl" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-none">
              Detect Deepfakes
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-white/50 font-light max-w-xl mx-auto">
              State-of-the-art AI detection for synthetic media.
              Protect your platform with enterprise-grade accuracy.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => setShowDemo(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-medium rounded-full transition-all hover:bg-white/90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                href="#results"
                className="flex items-center gap-3 px-8 py-4 text-white/70 font-medium hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                View Results
              </motion.a>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-20 flex items-center justify-center gap-12 sm:gap-20"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-light text-white">94.2%</div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">Accuracy</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-light text-white">12ms</div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">Latency</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-light text-white">4+</div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">Datasets</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1, y: { repeat: Infinity, duration: 2 } }}
        >
          <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => { setShowDemo(false); reset(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-white">Upload Media</h2>
                <button
                  onClick={() => { setShowDemo(false); reset(); }}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              {result ? (
                <ResultCard result={result} onReset={reset} />
              ) : (
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <section id="results" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              Benchmark Results
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Performance metrics on industry-standard deepfake detection datasets
            </p>
          </motion.div>

          <Benchmarks />
        </div>
      </section>

      {/* Simple Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-lg font-medium text-white mb-2">Images</h3>
              <p className="text-sm text-white/40">Detect AI-generated images from DALL-E, Midjourney, Stable Diffusion</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-white mb-2">Videos</h3>
              <p className="text-sm text-white/40">Frame-by-frame analysis for deepfake videos and face swaps</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-medium text-white mb-2">Audio</h3>
              <p className="text-sm text-white/40">Identify AI-synthesized voices and cloned audio content</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-white/50 mb-8">
            Access our API and start detecting deepfakes in minutes.
          </p>
          <button className="px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors">
            Get API Access
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
