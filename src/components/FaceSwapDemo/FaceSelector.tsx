/**
 * FaceSelector Component
 *
 * Displays preset faces for selection in the face swap demo.
 */

import { motion } from 'framer-motion';
import { Check, User } from 'lucide-react';
import { PresetFace } from '../../lib/faceswap/FaceSwapEngine';

interface FaceSelectorProps {
  faces: PresetFace[];
  selectedFace: PresetFace | null;
  onSelect: (face: PresetFace) => void;
  disabled?: boolean;
}

export function FaceSelector({
  faces,
  selectedFace,
  onSelect,
  disabled = false,
}: FaceSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Select a Face to Swap</h3>
      <div className="flex flex-wrap gap-3">
        {faces.map((face) => {
          const isSelected = selectedFace?.id === face.id;

          return (
            <motion.button
              key={face.id}
              onClick={() => onSelect(face)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center p-2 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={disabled ? {} : { scale: 1.05 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
            >
              {/* Face thumbnail */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <FaceThumbnail face={face} />
                {isSelected && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-red-600" />
                  </div>
                )}
              </div>

              {/* Face name */}
              <span className={`mt-1 text-xs font-medium ${isSelected ? 'text-red-600' : 'text-gray-600'}`}>
                {face.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Thumbnail component with fallback
function FaceThumbnail({ face }: { face: PresetFace }) {
  if (face.thumbnailUrl) {
    return (
      <img
        src={face.thumbnailUrl}
        alt={face.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to placeholder
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `
            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <span class="text-2xl font-bold text-gray-400">${face.name[0]}</span>
            </div>
          `;
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
      <div className="text-center">
        <User className="w-8 h-8 text-gray-400 mx-auto" />
        <span className="text-[8px] text-gray-400">{face.name[0]}</span>
      </div>
    </div>
  );
}

export default FaceSelector;
