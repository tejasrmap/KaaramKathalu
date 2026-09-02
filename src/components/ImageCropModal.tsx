import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move, Eye, EyeOff, Crop, Sparkles, Smartphone, Monitor, LayoutTemplate } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageName?: string;
  aspectRatioType?: 'desktop-hero' | 'mobile-hero' | 'square' | 'free';
  targetTitle?: string;
  heroTag?: string;
  heroTitle?: string;
  heroTitleFontSize?: number;
  heroDescription?: string;
  heroButtonText?: string;
  heroOverlayOpacity?: string;
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
  heroTag = 'ROOTED IN TRADITION',
  heroTitle = 'Flavours of our Heritage',
  heroTitleFontSize = 48,
  heroDescription = 'From generations of Andhra kitchens to your table, Kaaram Kathalu brings you handcrafted pickles and aromatic podis made with pure ingredients, cold-pressed oils, and time-honored recipes. Every bite carries a little taste of home.',
  heroButtonText = 'EXPLORE OUR FLAVOURS',
  heroOverlayOpacity = '0',
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
  const [previewMode, setPreviewMode] = useState<'framed' | 'storefront'>('framed');
  const [imgNaturalDim, setImgNaturalDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [containerDim, setContainerDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [aspectRatio, setAspectRatio] = useState<'21:9' | '16:9' | '3:4' | '9:16' | '1:1'>(
    aspectRatioType === 'desktop-hero' ? '21:9' :
    aspectRatioType === 'mobile-hero' ? '3:4' :
    aspectRatioType === 'square' ? '1:1' : '21:9'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Measure container dimensions when opened or resized
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDim({ width: rect.width, height: rect.height });
    }
  }, []);

  // Reset state when opening a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setAspectRatio(
        aspectRatioType === 'desktop-hero' ? '21:9' :
        aspectRatioType === 'mobile-hero' ? '3:4' :
        aspectRatioType === 'square' ? '1:1' : '21:9'
      );
    }
  }, [isOpen, imageSrc, aspectRatioType]);

  // Update container dimensions on window resize or ratio change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(updateContainerDimensions, 60);
      window.addEventListener('resize', updateContainerDimensions);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateContainerDimensions);
      };
    }
  }, [isOpen, aspectRatio, updateContainerDimensions]);

  // Read natural image dimensions on load
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setImgNaturalDim({
      width: target.naturalWidth,
      height: target.naturalHeight
    });
    updateContainerDimensions();
  };

  // Compute Base Fit dimensions so image covers the container nicely by default
  const computeBaseImageDimensions = () => {
    if (!containerDim.width || !containerDim.height || !imgNaturalDim.width || !imgNaturalDim.height) {
      return { width: '100%', height: '100%' };
    }

    const containerAspect = containerDim.width / containerDim.height;
    const imgAspect = imgNaturalDim.width / imgNaturalDim.height;

    // object-cover logic
    if (imgAspect > containerAspect) {
      // Image is wider than container: match height, expand width
      const height = containerDim.height;
      const width = height * imgAspect;
      return { width: `${width}px`, height: `${height}px`, rawW: width, rawH: height };
    } else {
      // Image is taller than container: match width, expand height
      const width = containerDim.width;
      const height = width / imgAspect;
      return { width: `${width}px`, height: `${height}px`, rawW: width, rawH: height };
    }
  };

  const baseDims = computeBaseImageDimensions();

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

  // Touch Support
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

  // Perform Pixel-Perfect High-Resolution Canvas Crop
  const handlePerformCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!naturalWidth || !naturalHeight || !imgRect.width || !imgRect.height) return;

    // Scale ratio from screen pixels to natural high-res image pixels
    const scale = naturalWidth / imgRect.width;

    // Visible offset in screen pixels
    const visibleXOnScreen = containerRect.left - imgRect.left;
    const visibleYOnScreen = containerRect.top - imgRect.top;
    const visibleWOnScreen = containerRect.width;
    const visibleHOnScreen = containerRect.height;

    // Exact source coordinates in original image pixel space
    const sx = Math.max(0, visibleXOnScreen * scale);
    const sy = Math.max(0, visibleYOnScreen * scale);
    const sWidth = Math.min(naturalWidth - sx, visibleWOnScreen * scale);
    const sHeight = Math.min(naturalHeight - sy, visibleHOnScreen * scale);

    // Target Canvas Output Dimensions (Ultra-crisp 2.4K HD export)
    let outWidth = 2400;
    let outHeight = Math.round(2400 * (containerRect.height / containerRect.width));

    if (aspectRatio === '3:4') {
      outWidth = 1440;
      outHeight = 1920;
    } else if (aspectRatio === '9:16') {
      outWidth = 1080;
      outHeight = 1920;
    } else if (aspectRatio === '1:1') {
      outWidth = 1600;
      outHeight = 1600;
    }

    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set high image smoothing quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill background with warm off-white tone
    ctx.fillStyle = '#fbf8f2';
    ctx.fillRect(0, 0, outWidth, outHeight);

    // Draw the exact visible portion
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
    }, 'image/jpeg', 0.95);
  };

  if (!isOpen) return null;

  // Aspect ratio styling for the viewfinder box
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '21:9':
        return 'w-full aspect-[21/9] max-w-5xl max-h-[65vh]';
      case '16:9':
        return 'w-full aspect-[16/9] max-w-4xl max-h-[65vh]';
      case '3:4':
        return 'w-full aspect-[3/4] max-w-sm max-h-[65vh]';
      case '9:16':
        return 'w-full aspect-[9/16] max-w-xs max-h-[65vh]';
      case '1:1':
        return 'w-full aspect-square max-w-md max-h-[65vh]';
      default:
        return 'w-full aspect-[21/9] max-w-5xl max-h-[65vh]';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-[#191714] border border-white/10 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden text-warm-bg animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-warm-accent/20 text-warm-accent flex items-center justify-center border border-warm-accent/30 shadow-inner">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Frame & Crop Cover Photo
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-warm-accent/20 text-warm-accent font-sans font-semibold border border-warm-accent/30">
                  {targetTitle}
                </span>
              </h3>
              <p className="text-xs text-white/50 font-serif">
                Drag to reposition, use the zoom slider, and preview how your banner appears on the live website.
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
          className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-center bg-black/60 overflow-hidden relative select-none min-h-[400px]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Ratio Selector & Overlay Toggle Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 z-20">
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setAspectRatio('21:9')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  aspectRatio === '21:9'
                    ? 'bg-warm-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                21:9 (Widescreen Hero)
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-warm-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                16:9 (Desktop Banner)
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('3:4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  aspectRatio === '3:4'
                    ? 'bg-warm-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                3:4 (Mobile Cover)
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-warm-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                9:16 (Tall Mobile)
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-warm-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                1:1 (Square)
              </button>
            </div>

            {/* Toggle Live Text Overlay Guide */}
            <button
              type="button"
              onClick={() => setShowLiveCoverOverlay(!showLiveCoverOverlay)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer border ${
                showLiveCoverOverlay
                  ? 'bg-emerald-600/90 border-emerald-500 text-white shadow-sm'
                  : 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20'
              }`}
              title="Show live homepage text layout overlay"
            >
              {showLiveCoverOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showLiveCoverOverlay ? 'Live Text Guide: ON' : 'Live Text Guide: OFF'}
            </button>
          </div>

          {/* Viewfinder Crop Box - Exact Mirror of Home.tsx Hero Banner */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative ${getAspectClass()} rounded-2xl overflow-hidden shadow-2xl border-2 border-warm-accent/70 bg-warm-bg cursor-grab active:cursor-grabbing flex items-center justify-center transition-all duration-150`}
          >
            {/* Movable & Zoomable Image - Initial Fit-to-Container */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop view"
              onLoad={handleImageLoaded}
              draggable={false}
              crossOrigin="anonymous"
              className="max-w-none transition-transform duration-75 pointer-events-none absolute inset-0 m-auto"
              style={{
                width: baseDims.width,
                height: baseDims.height,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            />

            {/* Grid overlay for rule-of-thirds composition */}
            {!showLiveCoverOverlay && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20 z-[2]">
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div></div>
              </div>
            )}

            {/* Live Homepage Cover Overlay - 100% Exact Replica of Home.tsx */}
            {showLiveCoverOverlay && (
              <>
                {/* Soft overlay matching admin settings */}
                <div 
                  className="absolute inset-0 z-[1] transition-opacity duration-300 pointer-events-none"
                  style={{
                    backgroundColor: Number(heroOverlayOpacity || 0) > 0 
                      ? `rgba(0, 0, 0, ${Number(heroOverlayOpacity) / 100})` 
                      : 'rgba(255, 255, 255, 0.10)'
                  }}
                />

                {/* Content Container Matching Home.tsx max-w-7xl and left padding */}
                <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 relative z-10 w-full pointer-events-none flex items-center justify-start h-full">
                  <div className="max-w-lg flex flex-col items-start text-left md:max-w-md lg:max-w-lg mx-0 drop-shadow-xs">
                    <span className="font-sans tracking-[0.2em] text-[10px] sm:text-xs uppercase font-bold text-warm-accent mb-1.5">
                      {heroTag || 'ROOTED IN TRADITION'}
                    </span>
                    
                    <h1 
                      className="font-serif leading-[1.15] text-warm-accent whitespace-pre-line mb-1 text-left font-bold"
                      style={{
                        fontSize: `clamp(18px, 3.5vw, ${Math.min(heroTitleFontSize, 38)}px)`
                      }}
                    >
                      {heroTitle || 'Flavours of our Heritage'}
                    </h1>
                    
                    {/* Heritage Divider Line */}
                    <div className="heritage-divider text-warm-accent w-full max-w-[100px] !my-0.5 !mx-0 justify-start">✻</div>

                    <p className="font-serif italic text-xs sm:text-sm leading-relaxed text-warm-dark/85 whitespace-pre-line mt-1 mb-3 text-left max-w-sm line-clamp-3">
                      {heroDescription || 'From generations of Andhra kitchens to your table, Kaaram Kathalu brings you handcrafted pickles and aromatic podis made with pure ingredients, cold-pressed oils, and time-honored recipes. Every bite carries a little taste of home.'}
                    </p>

                    <div className="w-fit px-5 sm:px-7 py-2 sm:py-2.5 bg-warm-accent text-white font-sans uppercase text-[10px] sm:text-xs tracking-wider font-bold rounded shadow-md">
                      {heroButtonText || 'EXPLORE OUR FLAVOURS'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Drag Hint badge */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white/80 text-[10px] font-mono px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1 border border-white/10 z-20">
              <Move className="w-3 h-3 text-warm-accent" /> Drag to move
            </div>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Zoom Slider & Reset */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.7, Number((prev - 0.1).toFixed(2))))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 flex-1 sm:w-52">
              <input
                type="range"
                min="0.7"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-warm-accent"
              />
              <span className="font-mono text-xs text-white/70 min-w-[40px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, Number((prev + 0.1).toFixed(2))))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/10"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-mono ml-1 border border-white/10"
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
                Use Full Original
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
