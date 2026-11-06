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
  Sparkles,
  Move,
  RefreshCw,
  Circle,
  HelpCircle
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  initialAspectRatio?: number; // 1 for 1:1 square, 16/9 for banner, 4/3, 0 for free
  title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
  initialAspectRatio = 1,
  title = 'Crop & Position Photo'
}) => {
  const [aspectRatio, setAspectRatio] = useState<number>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);
  const [showCircleGuide, setShowCircleGuide] = useState<boolean>(true);

  // Natural image dimensions
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Crop box fixed dimensions for viewport
  // Responsive: standard 280px for square on mobile, 300px on desktop
  const cropBoxWidth = 280;
  const cropBoxHeight =
    aspectRatio === 1
      ? 280
      : aspectRatio === 16 / 9
      ? Math.round(280 * (9 / 16)) // 158px
      : aspectRatio === 4 / 3
      ? Math.round(280 * (3 / 4)) // 210px
      : naturalSize.width > 0
      ? Math.round(280 * (naturalSize.height / naturalSize.width))
      : 280;

  // Compute base scale to cover or fit the crop box nicely
  const getBaseScale = useCallback(() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    // Default: Cover the crop box so no empty gaps
    const scaleX = cropBoxWidth / naturalSize.width;
    const scaleY = cropBoxHeight / naturalSize.height;
    return Math.max(scaleX, scaleY);
  }, [cropBoxWidth, cropBoxHeight, naturalSize]);

  // Reset state when modal opens or image changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setAspectRatio(initialAspectRatio);
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
      // Pinch to zoom
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
      setZoom(Math.min(4, Math.max(0.5, initialPinchZoom * factor)));
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
    setZoom((prev) => Math.min(4, Math.max(0.5, prev + delta)));
  };

  // Quick action presets
  const handleFit = () => {
    if (!naturalSize.width || !naturalSize.height) return;
    const scaleX = cropBoxWidth / naturalSize.width;
    const scaleY = cropBoxHeight / naturalSize.height;
    const fitScale = Math.min(scaleX, scaleY);
    setZoom(fitScale / baseScale);
    setPan({ x: 0, y: 0 });
  };

  const handleFill = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
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

    // Determine target output resolution
    // Square 1:1 -> 600x600 (sharp, fast, lightweight ~45KB)
    // 16:9 Banner -> 1200x675
    // 4:3 -> 800x600
    // Free -> up to 1000px proportional
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

    // 1. Fill clean white background (prevents transparent PNGs turning black in JPEGs)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 2. High quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 3. Coordinate transform from crop box screen space to canvas space
    // Scale factor between output canvas and screen crop box
    const canvasScale = targetWidth / cropBoxWidth;

    ctx.save();
    // Move canvas origin to center of output image
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Rotate about the center
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    // Canvas dimensions for the rendered image
    const canvasImgW = displayWidth * canvasScale;
    const canvasImgH = displayHeight * canvasScale;
    const canvasPanX = pan.x * canvasScale;
    const canvasPanY = pan.y * canvasScale;

    // Draw the image centered with pan offset
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
              <p className="text-[11px] text-slate-400">Drag photo to position inside crop frame</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
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
          <button
            type="button"
            onClick={() => setAspectRatio(0)}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
              aspectRatio === 0
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Original</span>
          </button>
        </div>

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

        {/* Zoom & Adjustment Controls */}
        <div className="space-y-2.5 bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-xs">
          {/* Zoom Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0.5"
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

          {/* Action Tools: Fit, Fill, Rotate, Reset */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/60 text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFit}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
              >
                Fit Photo
              </button>
              <button
                type="button"
                onClick={handleFill}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
              >
                Fill Frame
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCw className="w-3 h-3 text-cyan-400" />
                <span>Rotate 90°</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
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
            <span>Apply & Save Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
