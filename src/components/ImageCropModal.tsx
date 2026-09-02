import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move, Eye, EyeOff, Crop, Sparkles } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageName?: string;
  aspectRatioType?: 'desktop-hero' | 'mobile-hero' | 'square' | 'free';
  targetTitle?: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
  onUseOriginal?: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  imageName = 'hero_image.jpg',
  aspectRatioType = 'desktop-hero',
  targetTitle = 'Cover Photo',
  onClose,
  onCropComplete,
  onUseOriginal
}) => {
  // Crop state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLiveCoverOverlay, setShowLiveCoverOverlay] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<'21:9' | '16:9' | '3:4' | '9:16' | '1:1' | 'free'>(
    aspectRatioType === 'desktop-hero' ? '21:9' :
    aspectRatioType === 'mobile-hero' ? '3:4' :
    aspectRatioType === 'square' ? '1:1' : '16:9'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when opening a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setAspectRatio(
        aspectRatioType === 'desktop-hero' ? '21:9' :
        aspectRatioType === 'mobile-hero' ? '3:4' :
        aspectRatioType === 'square' ? '1:1' : '16:9'
      );
    }
  }, [isOpen, imageSrc, aspectRatioType]);

  // Handle Drag / Pan Events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support for Mobile / Touchscreens
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Perform the actual Canvas Crop
  const handlePerformCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Calculate scale factor between natural image and rendered image in the crop box
    const displayedWidth = img.clientWidth * zoom;
    const displayedHeight = img.clientHeight * zoom;

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    // Viewport box width & height
    const viewWidth = containerRect.width;
    const viewHeight = containerRect.height;

    // Output target canvas dimensions (HD export)
    let outWidth = 1920;
    let outHeight = 820;

    if (aspectRatio === '21:9') {
      outWidth = 2100;
      outHeight = 900;
    } else if (aspectRatio === '16:9') {
      outWidth = 1920;
      outHeight = 1080;
    } else if (aspectRatio === '3:4') {
      outWidth = 1200;
      outHeight = 1600;
    } else if (aspectRatio === '9:16') {
      outWidth = 1080;
      outHeight = 1920;
    } else if (aspectRatio === '1:1') {
      outWidth = 1200;
      outHeight = 1200;
    } else {
      outWidth = viewWidth * 2;
      outHeight = viewHeight * 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Fill background with warm off-white in case borders are visible
    ctx.fillStyle = '#fbf8f2';
    ctx.fillRect(0, 0, outWidth, outHeight);

    // Calculate source crop rectangle
    const centerOffsetX = (displayedWidth - viewWidth) / 2 - pan.x;
    const centerOffsetY = (displayedHeight - viewHeight) / 2 - pan.y;

    const sx = Math.max(0, centerOffsetX * scaleX);
    const sy = Math.max(0, centerOffsetY * scaleY);
    const sWidth = Math.min(naturalWidth, viewWidth * scaleX);
    const sHeight = Math.min(naturalHeight, viewHeight * scaleY);

    ctx.drawImage(
      img,
      sx, sy, sWidth, sHeight,
      0, 0, outWidth, outHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(blob, previewUrl);
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  if (!isOpen) return null;

  // Aspect ratio styling for the viewfinder box
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '21:9':
        return 'aspect-[21/9] max-w-4xl';
      case '16:9':
        return 'aspect-[16/9] max-w-3xl';
      case '3:4':
        return 'aspect-[3/4] max-w-md';
      case '9:16':
        return 'aspect-[9/16] max-w-xs';
      case '1:1':
        return 'aspect-square max-w-lg';
      default:
        return 'aspect-[21/9] max-w-4xl';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#1f1d1a] border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-warm-bg">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warm-accent/20 text-warm-accent flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Crop & Position Cover Image
                <span className="text-xs px-2 py-0.5 rounded-full bg-warm-accent/20 text-warm-accent font-sans font-semibold">
                  {targetTitle}
                </span>
              </h3>
              <p className="text-xs text-white/50 font-serif">
                Drag to position image, use zoom slider, and preview how it fits in the homepage banner.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Interactive Viewfinder */}
        <div 
          className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center bg-black/40 overflow-hidden relative select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Ratio Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 z-20">
            <span className="text-xs font-mono uppercase text-white/50 mr-1">Aspect Ratio:</span>
            {(['21:9', '16:9', '3:4', '9:16', '1:1'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-warm-accent text-white shadow-sm'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {ratio === '21:9' ? '21:9 (Widescreen Hero)' :
                 ratio === '16:9' ? '16:9 (Desktop Banner)' :
                 ratio === '3:4' ? '3:4 (Mobile Cover)' :
                 ratio === '9:16' ? '9:16 (Tall Mobile)' : '1:1 (Square)'}
              </button>
            ))}

            {/* Toggle Live Text Overlay Guide */}
            <button
              type="button"
              onClick={() => setShowLiveCoverOverlay(!showLiveCoverOverlay)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ml-2 ${
                showLiveCoverOverlay
                  ? 'bg-emerald-600/80 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title="Show live homepage text positioning preview"
            >
              {showLiveCoverOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showLiveCoverOverlay ? 'Text Guide: ON' : 'Text Guide: OFF'}
            </button>
          </div>

          {/* Viewfinder Crop Box */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-full ${getAspectClass()} rounded-2xl overflow-hidden shadow-2xl border-2 border-warm-accent/60 bg-black/60 cursor-grab active:cursor-grabbing flex items-center justify-center transition-all`}
          >
            {/* Movable & Zoomable Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop view"
              draggable={false}
              crossOrigin="anonymous"
              className="max-w-none transition-transform duration-75 pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            />

            {/* Grid overlay for rule-of-thirds composition */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
              <div className="border-r border-b border-white/15"></div>
              <div className="border-r border-b border-white/15"></div>
              <div className="border-b border-white/15"></div>
              <div className="border-r border-b border-white/15"></div>
              <div className="border-r border-b border-white/15"></div>
              <div className="border-b border-white/15"></div>
              <div className="border-r border-white/15"></div>
              <div className="border-r border-white/15"></div>
              <div></div>
            </div>

            {/* Live Homepage Cover Overlay Mockup */}
            {showLiveCoverOverlay && (
              <div className="absolute inset-0 bg-black/20 pointer-events-none flex flex-col justify-center p-4 sm:p-8 md:p-12">
                <div className="max-w-md bg-black/30 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-left">
                  <div className="text-[10px] sm:text-xs font-serif uppercase tracking-widest text-warm-accent font-bold mb-1">
                    Authentic Andhra Flavours
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-serif italic text-white/95 leading-snug line-clamp-2">
                    "From generations of Andhra kitchens to your table, Kaaram Kathalu brings handcrafted pickles..."
                  </div>
                  <div className="mt-2.5 inline-block px-3 py-1 bg-warm-accent text-white text-[10px] font-bold uppercase rounded tracking-wider">
                    Shop Pickles & Podis
                  </div>
                </div>
              </div>
            )}

            {/* Drag Hint badge */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white/70 text-[10px] font-mono px-2 py-1 rounded-md pointer-events-none flex items-center gap-1">
              <Move className="w-3 h-3 text-warm-accent" /> Drag to position
            </div>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Zoom Slider & Reset */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 flex-1 sm:w-48">
              <input
                type="range"
                min="0.7"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-warm-accent"
              />
              <span className="font-mono text-xs text-white/70 min-w-[36px]">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-mono ml-2"
              title="Reset Position"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onUseOriginal && (
              <button
                type="button"
                onClick={onUseOriginal}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Use Original (Skip Crop)
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePerformCrop}
              className="flex items-center gap-2 px-6 py-2.5 bg-warm-accent hover:bg-warm-accent/90 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Crop & Apply
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
