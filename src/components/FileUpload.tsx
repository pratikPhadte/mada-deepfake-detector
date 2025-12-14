import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, Music, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  accept?: Record<string, string[]>;
}

const defaultAccept = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  'audio/*': ['.mp3', '.wav', '.flac', '.ogg', '.m4a'],
};

function getMediaIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  return Upload;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUpload({
  onFileSelect,
  isLoading,
  accept = defaultAccept,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const MediaIcon = selectedFile ? getMediaIcon(selectedFile.type) : Upload;

  const rootProps = getRootProps();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              {...rootProps}
              className={`
                relative border border-dashed rounded-lg p-12
                transition-all duration-200 cursor-pointer
                ${isDragActive
                  ? 'border-mada-red bg-mada-red/5'
                  : 'border-white/20 hover:border-white/40 bg-white/5'
                }
              `}
            >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
              <div className={`
                p-4 rounded-lg transition-colors
                ${isDragActive ? 'bg-mada-red/20' : 'bg-white/10'}
              `}>
                <Upload className={`
                  w-8 h-8 transition-colors
                  ${isDragActive ? 'text-mada-red' : 'text-mada-gray-500'}
                `} />
              </div>

              <div className="text-center">
                <p className="text-lg font-medium text-white">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
                </p>
                <p className="mt-1 text-sm text-mada-gray-500">
                  or click to browse
                </p>
              </div>

              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2 text-xs text-mada-gray-500">
                  <Image className="w-4 h-4" />
                  <span>Images</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-mada-gray-500">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-mada-gray-500">
                  <Music className="w-4 h-4" />
                  <span>Audio</span>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-mada-gray-50/30 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MediaIcon className="w-8 h-8 text-mada-gray-500" />
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">
                  {selectedFile.name}
                </h3>
                <p className="mt-1 text-sm text-mada-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p className="mt-0.5 text-xs text-mada-gray-500 uppercase">
                  {selectedFile.type || 'Unknown type'}
                </p>
              </div>

              {/* Remove button */}
              {!isLoading && (
                <button
                  onClick={clearFile}
                  className="p-2 text-mada-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Analyze button */}
            <div className="mt-6">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="btn-primary w-full uppercase tracking-wider"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
