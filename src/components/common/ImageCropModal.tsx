import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Maximize2,
  Square,
  Lock,
  Move,
  RefreshCw,
  Circle,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  initialAspectRatio?: number; // 1 for 1:1 square, 16/9 for banner, 4/3, 0 for free
  lockAspectRatio?: boolean; // When true, locks to this ratio and hides conflicting selectors
  title?: string;
  subtitle?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
  initialAspectRatio = 1,
  lockAspectRatio = true,
  title = 'Crop & Position Photo',
  subtitle
}) => {
  const [aspectRatio, setAspectRatio] = useState<number>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);
  const [showCircleGuide, setShowCircleGuide] = useState<boolean>(aspectRatio === 1);
  const [fitMode, setFitMode] = useState<'fill' | 'fit'>('fill');

  // Natural image dimensions
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Responsive crop box dimensions
  // For 1:1 square: 280x280 px
  // For 16:9 banner: 340x191 px (wider, clear view)
  // For 4:3 standard: 300x225 px
  const cropBoxWidth =
    aspectRatio === 16 / 9
      ? 340
      : aspectRatio === 4 / 3
      ? 300
      : 280;

  const cropBoxHeight =
    aspectRatio === 1
      ? 280
      : aspectRatio === 16 / 9
      ? Math.round(cropBoxWidth * (9 / 16)) // 191px
      : aspectRatio === 4 / 3
      ? Math.round(cropBoxWidth * (3 / 4)) // 225px
      : naturalSize.width > 0
      ? Math.round(cropBoxWidth * (naturalSize.height / naturalSize.width))
      : 280;

  // Compute base scale to cover or fit the crop box nicely
  const getBaseScale = useCallback(() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    const scaleX = cropBoxWidth / naturalSize.width;
    const scaleY = cropBoxHeight / naturalSize.height;
    // Default: 'fill' covers the crop box; 'fit' contains entire image with white padding
    return fitMode === 'fit' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  }, [cropBoxWidth, cropBoxHeight, naturalSize, fitMode]);

  // Reset state whenever modal opens or initialAspectRatio changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setAspectRatio(initialAspectRatio);
      setFitMode('fill');
      setShowCircleGuide(initialAspectRatio === 1);
      setImageLoaded(false);

      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc, initialAspectRatio]);

  if (!isOpen || !imageSrc) return null;

  const baseScale = getBaseScale();
  const effectiveScale = baseScale * zoom;
  const displayWidth = naturalSize.width ? naturalSize.width * effectiveScale : cropBoxWidth;
  const displayHeight = naturalSize.height ? naturalSize.height * effectiveScale : cropBoxHeight;

  // Mouse handlers for dragging / panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
      setInitialPinchZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && initialPinchDist) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialPinchDist;
      setZoom(Math.min(4, Math.max(0.4, initialPinchZoom * factor)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialPinchDist(null);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(4, Math.max(0.4, prev + delta)));
  };

  // Quick preset fit handlers
  const handleFillMode = () => {
    setFitMode('fill');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitMode = () => {
    setFitMode('fit');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setFitMode('fill');
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Descriptive label for the locked size
  const getFixedSizeLabel = () => {
    if (aspectRatio === 1) return 'Fixed Size: 1:1 Square (600 × 600 px for Logo & QR Center)';
    if (aspectRatio === 16 / 9) return 'Fixed Size: 16:9 Landscape (1200 × 675 px for Cover Banner)';
    if (aspectRatio === 4 / 3) return 'Fixed Size: 4:3 Standard (800 × 600 px for Photo)';
    return 'Free Aspect Ratio';
  };

  // Generate cropped output canvas with 100% WYSIWYG fidelity
  const handleApplyCrop = () => {
    if (!imageRef.current || !naturalSize.width || !naturalSize.height) {
      onCropComplete(imageSrc);
      return;
    }

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onCropComplete(imageSrc);
      return;
    }

    // Exact output dimensions
    let targetWidth = 600;
    let targetHeight = 600;

    if (aspectRatio === 16 / 9) {
      targetWidth = 1200;
      targetHeight = 675;
    } else if (aspectRatio === 4 / 3) {
      targetWidth = 800;
      targetHeight = 600;
    } else if (aspectRatio === 0) {
      targetWidth = 1000;
      targetHeight = Math.round(1000 * (naturalSize.height / naturalSize.width));
    } else {
      targetWidth = 600;
      targetHeight = 600;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // 1. Fill clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 2. High quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 3. Coordinate transform from crop box screen space to canvas space
    const canvasScale = targetWidth / cropBoxWidth;

    ctx.save();
    // Center canvas origin
    ctx.translate(targetWidth / 2, targetHeight / 2);

    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    const canvasImgW = displayWidth * canvasScale;
    const canvasImgH = displayHeight * canvasScale;
    const canvasPanX = pan.x * canvasScale;
    const canvasPanY = pan.y * canvasScale;

    ctx.drawImage(
      img,
      -canvasImgW / 2 + canvasPanX,
      -canvasImgH / 2 + canvasPanY,
      canvasImgW,
      canvasImgH
    );

    ctx.restore();

    try {
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
      onCropComplete(croppedDataUrl);
    } catch (err) {
      console.error('Canvas export error:', err);
      onCropComplete(imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 text-white my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                {subtitle || 'Auto-scaled & fitted to the exact required size'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fixed Size Notification Bar or Ratio Selector */}
        {lockAspectRatio ? (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs">
            <div className="flex items-center gap-2 text-brand-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{getFixedSizeLabel()}</span>
            </div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
              Auto Fixed
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setAspectRatio(1)}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                aspectRatio === 1
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Square 1:1</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio(16 / 9)}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                aspectRatio === 16 / 9
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Banner 16:9</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio(4 / 3)}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                aspectRatio === 4 / 3
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>4:3 Standard</span>
            </button>
          </div>
        )}

        {/* Cropping Viewport */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center cursor-move"
        >
          {/* Active Crop Box with shadow backdrop */}
          <div
            ref={cropBoxRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: `${cropBoxWidth}px`,
              height: `${cropBoxHeight}px`,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.78)',
            }}
            className="relative z-10 overflow-hidden border-2 border-brand-500 rounded-2xl flex items-center justify-center transition-all duration-150"
          >
            {/* Rule of Thirds Grid Lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-20 opacity-25">
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>

            {/* Corner Framing Handles */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none z-20"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none z-20"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none z-20"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none z-20"></div>

            {/* Optional Circular Profile Guide for Square Logo */}
            {aspectRatio === 1 && showCircleGuide && (
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/60 pointer-events-none z-20"></div>
            )}

            {/* The Image Itself */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                maxWidth: 'none',
                maxHeight: 'none',
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
              }}
              className="pointer-events-none select-none"
            />
          </div>

          {/* Quick pan hint badge */}
          <div className="absolute bottom-2 left-3 z-30 pointer-events-none flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800 backdrop-blur-sm">
            <Move className="w-3 h-3 text-brand-400" />
            <span>Drag photo • Scroll to zoom</span>
          </div>

          {/* Circle guide toggle for 1:1 */}
          {aspectRatio === 1 && (
            <button
              type="button"
              onClick={() => setShowCircleGuide(!showCircleGuide)}
              className="absolute top-2 right-3 z-30 flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 transition-colors"
            >
              <Circle className="w-3 h-3 text-cyan-400" />
              <span>{showCircleGuide ? 'Circle Guide On' : 'Circle Guide Off'}</span>
            </button>
          )}
        </div>

        {/* Fit Presets & Zoom Controls */}
        <div className="space-y-2.5 bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-xs">
          {/* Fit Preset Buttons */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400">Positioning:</span>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <button
                type="button"
                onClick={handleFillMode}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  fitMode === 'fill'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="Scale to fill entire frame without borders"
              >
                <span>Fill Entire Frame</span>
              </button>
              <button
                type="button"
                onClick={handleFitMode}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  fitMode === 'fit'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="Fit whole photo with white padding (keeps text uncut)"
              >
                <span>Fit Whole Photo</span>
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0.4"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-brand-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-300 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Action Tools: Rotate, Reset */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/60 text-[11px]">
            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotate 90° Clockwise</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Confirm & Fix Photo Size</span>
          </button>
        </div>
      </div>
    </div>
  );
};
