/**
 * FaceSwapEngine
 *
 * Performs real-time face swapping using Canvas 2D.
 * Takes source face landmarks and target face image to create a face swap effect.
 */

import { FaceDetection } from '../../hooks/useMediaPipe';

export interface PresetFace {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  landmarks?: NormalizedLandmark[];
}

interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceSwapOptions {
  blendAmount: number; // 0-1, how much to blend the face
  featherAmount: number; // pixels for edge feathering
  colorCorrection: boolean;
}

export class FaceSwapEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private targetFaceImage: HTMLImageElement | null = null;
  private options: FaceSwapOptions;

  constructor(options: Partial<FaceSwapOptions> = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.options = {
      blendAmount: 0.95, // High blend for visible effect
      featherAmount: 20,
      colorCorrection: false, // Disable for clearer swap visibility
      ...options,
    };
  }

  /**
   * Load a target face image for swapping
   */
  async loadTargetFace(face: PresetFace): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.targetFaceImage = img;
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load face image: ${face.imageUrl}`));
      img.src = face.imageUrl;
    });
  }

  /**
   * Process a video frame and apply face swap
   */
  processFrame(
    sourceVideo: HTMLVideoElement,
    sourceFace: FaceDetection | null,
    outputCanvas: HTMLCanvasElement
  ): void {
    const outCtx = outputCanvas.getContext('2d')!;
    const width = outputCanvas.width;
    const height = outputCanvas.height;

    // Draw original video frame
    outCtx.drawImage(sourceVideo, 0, 0, width, height);

    // If no face detected or no target face loaded, return original
    if (!sourceFace || !this.targetFaceImage) {
      return;
    }

    // Get face region from source - use larger area for more visible swap
    const faceBox = sourceFace.boundingBox;
    const padding = 0.15; // Padding around face

    // Calculate face position and size
    const faceX = (faceBox.x - faceBox.width * padding) * width;
    const faceY = (faceBox.y - faceBox.height * padding) * height;
    const faceW = faceBox.width * (1 + padding * 2) * width;
    const faceH = faceBox.height * (1 + padding * 2) * height;

    // Create face mask based on face oval
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);

    // Draw the target face, scaled and positioned to match source face
    this.ctx.save();

    // Create elliptical clipping mask for face area
    this.ctx.beginPath();
    const centerX = faceX + faceW / 2;
    const centerY = faceY + faceH / 2;
    // Use ellipse for smoother face shape
    this.ctx.ellipse(centerX, centerY, faceW * 0.42, faceH * 0.48, 0, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.clip();

    // Calculate draw dimensions maintaining aspect ratio
    const targetAspect = this.targetFaceImage.width / this.targetFaceImage.height;
    const sourceAspect = faceW / faceH;

    let drawW = faceW * 1.1; // Slightly larger for better coverage
    let drawH = faceH * 1.1;
    let drawX = faceX - faceW * 0.05;
    let drawY = faceY - faceH * 0.05;

    // Adjust for aspect ratio
    if (targetAspect > sourceAspect) {
      drawH = drawW / targetAspect;
      drawY = faceY + (faceH - drawH) / 2;
    } else {
      drawW = drawH * targetAspect;
      drawX = faceX + (faceW - drawW) / 2;
    }

    // Draw target face with high opacity
    this.ctx.globalAlpha = this.options.blendAmount;
    this.ctx.drawImage(
      this.targetFaceImage,
      drawX,
      drawY,
      drawW,
      drawH
    );

    this.ctx.restore();

    // Apply color correction if enabled
    if (this.options.colorCorrection) {
      this.applyColorCorrection(sourceVideo, width, height);
    }

    // Feather the edges for smoother blending
    this.applyFeathering(sourceFace, width, height);

    // Composite the swapped face onto the output
    outCtx.globalCompositeOperation = 'source-over';
    outCtx.drawImage(this.canvas, 0, 0);
  }

  /**
   * Simple color correction to match skin tones
   */
  private applyColorCorrection(
    sourceVideo: HTMLVideoElement,
    width: number,
    height: number
  ): void {
    // Get average color from source face region
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(sourceVideo, 0, 0, width, height);

    // Sample center of frame for skin tone
    const sampleSize = 50;
    const centerX = width / 2 - sampleSize / 2;
    const centerY = height / 2 - sampleSize / 2;

    try {
      const sourceData = tempCtx.getImageData(centerX, centerY, sampleSize, sampleSize);
      const targetData = this.ctx.getImageData(centerX, centerY, sampleSize, sampleSize);

      // Calculate average colors
      let srcR = 0, srcG = 0, srcB = 0;
      let tgtR = 0, tgtG = 0, tgtB = 0;
      let count = 0;

      for (let i = 0; i < sourceData.data.length; i += 4) {
        srcR += sourceData.data[i];
        srcG += sourceData.data[i + 1];
        srcB += sourceData.data[i + 2];
        tgtR += targetData.data[i];
        tgtG += targetData.data[i + 1];
        tgtB += targetData.data[i + 2];
        count++;
      }

      if (count > 0) {
        srcR /= count; srcG /= count; srcB /= count;
        tgtR /= count; tgtG /= count; tgtB /= count;

        // Apply color adjustment
        const rRatio = srcR / (tgtR || 1);
        const gRatio = srcG / (tgtG || 1);
        const bRatio = srcB / (tgtB || 1);

        // Clamp ratios to prevent extreme adjustments
        const clamp = (v: number) => Math.min(1.5, Math.max(0.5, v));
        const rAdj = clamp(rRatio);
        const gAdj = clamp(gRatio);
        const bAdj = clamp(bRatio);

        // Apply to entire canvas
        const imageData = this.ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i + 3] > 0) { // Only adjust non-transparent pixels
            imageData.data[i] = Math.min(255, imageData.data[i] * rAdj);
            imageData.data[i + 1] = Math.min(255, imageData.data[i + 1] * gAdj);
            imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] * bAdj);
          }
        }
        this.ctx.putImageData(imageData, 0, 0);
      }
    } catch (e) {
      // Ignore color correction errors (can happen with cross-origin)
      console.debug('Color correction skipped:', e);
    }
  }

  /**
   * Apply feathering to face edges for smoother blending
   */
  private applyFeathering(
    face: FaceDetection,
    width: number,
    height: number
  ): void {
    const feather = this.options.featherAmount;
    if (feather <= 0) return;

    // Create gradient mask for feathering
    const ovalPoints = face.faceOval;
    if (ovalPoints.length === 0) return;

    // Calculate center of face
    let centerX = 0, centerY = 0;
    ovalPoints.forEach(p => {
      centerX += p.x * width;
      centerY += p.y * height;
    });
    centerX /= ovalPoints.length;
    centerY /= ovalPoints.length;

    // Apply radial gradient for feathering
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Calculate max distance from center to edge
    let maxDist = 0;
    ovalPoints.forEach(p => {
      const dx = p.x * width - centerX;
      const dy = p.y * height - centerY;
      maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy));
    });

    const featherStart = maxDist - feather;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] > 0) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > featherStart) {
            const alpha = 1 - (dist - featherStart) / feather;
            data[i + 3] = Math.max(0, Math.min(255, data[i + 3] * Math.max(0, alpha)));
          }
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Get the processed canvas for preview
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Update engine options
   */
  setOptions(options: Partial<FaceSwapOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Check if a target face is loaded
   */
  hasTargetFace(): boolean {
    return this.targetFaceImage !== null;
  }

  /**
   * Clear the target face
   */
  clearTargetFace(): void {
    this.targetFaceImage = null;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.clearTargetFace();
  }
}

/**
 * Generate a more visible face overlay image
 * Creates a stylized face mask that's clearly visible when swapped
 */
function generateStylizedFace(name: string, hue: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Skin tone background based on hue
  const skinTones = [
    'rgb(255, 224, 189)', // Light
    'rgb(234, 192, 160)', // Medium light
    'rgb(198, 154, 118)', // Medium
    'rgb(141, 85, 36)',   // Dark
  ];
  const skinTone = skinTones[Math.floor(hue / 100) % skinTones.length];

  // Fill background with skin tone
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, 512, 512);

  // Face oval shape
  ctx.beginPath();
  ctx.ellipse(256, 280, 180, 220, 0, 0, Math.PI * 2);

  // Gradient for face depth
  const faceGradient = ctx.createRadialGradient(256, 250, 50, 256, 280, 220);
  faceGradient.addColorStop(0, skinTone);
  faceGradient.addColorStop(0.7, skinTone);
  faceGradient.addColorStop(1, `hsl(${hue}, 30%, 60%)`);
  ctx.fillStyle = faceGradient;
  ctx.fill();

  // Hair (different styles based on name)
  ctx.fillStyle = hue > 200 ? '#2c1810' : '#1a1a2e';
  ctx.beginPath();
  if (hue < 180) {
    // Short hair style
    ctx.ellipse(256, 120, 190, 120, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(66, 120, 380, 60);
  } else {
    // Longer hair style
    ctx.ellipse(256, 140, 200, 140, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(56, 140, 400, 180);
  }

  // Eyebrows
  ctx.fillStyle = hue > 200 ? '#3d2914' : '#2a2a3e';
  ctx.beginPath();
  ctx.ellipse(175, 200, 45, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(337, 200, 45, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - white
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(175, 235, 32, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(337, 235, 32, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - iris
  const eyeColors = ['#4a6741', '#634832', '#2c5282', '#553c2e'];
  ctx.fillStyle = eyeColors[Math.floor(hue / 100) % eyeColors.length];
  ctx.beginPath();
  ctx.ellipse(175, 237, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(337, 237, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - pupil
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(175, 237, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(337, 237, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - highlight
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(180, 232, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(342, 232, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.strokeStyle = `hsl(${hue + 20}, 25%, 55%)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 250);
  ctx.lineTo(248, 320);
  ctx.quadraticCurveTo(240, 335, 235, 330);
  ctx.moveTo(248, 320);
  ctx.quadraticCurveTo(256, 340, 264, 320);
  ctx.quadraticCurveTo(272, 335, 277, 330);
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = `hsl(${hue + 20}, 25%, 45%)`;
  ctx.beginPath();
  ctx.ellipse(243, 328, 8, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(269, 328, 8, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Lips
  ctx.fillStyle = `hsl(0, 45%, 55%)`;
  // Upper lip
  ctx.beginPath();
  ctx.moveTo(200, 380);
  ctx.quadraticCurveTo(230, 365, 256, 375);
  ctx.quadraticCurveTo(282, 365, 312, 380);
  ctx.quadraticCurveTo(282, 385, 256, 380);
  ctx.quadraticCurveTo(230, 385, 200, 380);
  ctx.fill();

  // Lower lip
  ctx.fillStyle = `hsl(0, 50%, 50%)`;
  ctx.beginPath();
  ctx.moveTo(205, 382);
  ctx.quadraticCurveTo(256, 420, 307, 382);
  ctx.quadraticCurveTo(256, 410, 205, 382);
  ctx.fill();

  // Mouth line
  ctx.strokeStyle = `hsl(0, 30%, 35%)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(205, 380);
  ctx.quadraticCurveTo(256, 388, 307, 380);
  ctx.stroke();

  // Ears
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(76, 270, 25, 45, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(436, 270, 25, 45, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Add name at bottom for identification
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 470, 512, 42);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 256, 500);

  return canvas.toDataURL('image/png');
}

// Preset faces configuration with generated placeholders
export const PRESET_FACES: PresetFace[] = [
  {
    id: 'generic-male-1',
    name: 'Alex',
    imageUrl: '', // Will be set dynamically
    thumbnailUrl: '',
  },
  {
    id: 'generic-female-1',
    name: 'Sarah',
    imageUrl: '',
    thumbnailUrl: '',
  },
  {
    id: 'generic-male-2',
    name: 'Marcus',
    imageUrl: '',
    thumbnailUrl: '',
  },
  {
    id: 'generic-female-2',
    name: 'Emma',
    imageUrl: '',
    thumbnailUrl: '',
  },
];

// Initialize face images (runs once when module loads)
if (typeof document !== 'undefined') {
  const hues = [50, 150, 250, 350]; // Different variations for each face
  PRESET_FACES.forEach((face, index) => {
    const dataUrl = generateStylizedFace(face.name, hues[index]);
    face.imageUrl = dataUrl;
    face.thumbnailUrl = dataUrl;
  });
}

export default FaceSwapEngine;
