import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';
import { SimulatedSystemDashboard } from '../SimulatedSystemDashboard';

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Define the type for a single gallery item
export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string; 
    text: string;
    pos?: string;
    by: string;
  };
  system?: any;
}

// Define the props for the CircularGallery component
export interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  onItemClick?: (item: GalleryItem, index: number) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed = 0.016, onItemClick, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const targetRotationRef = useRef(0);
    const currentRotationRef = useRef(0);
    const isInteractingRef = useRef(false);
    const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isDraggingRef = useRef(false);
    const lastXRef = useRef(0);
    const dragDistanceRef = useRef(0);

    // Provide balanced 8-slot 3D ring so cards have optimal spacing
    const ringItems = React.useMemo(() => {
      if (items.length === 0) return [];
      if (items.length >= 8) return items;
      if (items.length >= 4) return [...items, ...items]; // 8 items
      if (items.length === 3) return [...items, ...items, ...items]; // 9 items
      if (items.length === 2) return [...items, ...items, ...items, ...items]; // 8 items
      return [...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items];
    }, [items]);

    const totalCount = Math.max(ringItems.length, 1);
    const anglePerItem = 360 / totalCount;

    // Smooth physics loop with responsive easing
    useEffect(() => {
      let animationFrameId: number;

      const loop = () => {
        // Auto rotate gently if not actively scrolling/dragging
        if (!isInteractingRef.current && !isDraggingRef.current) {
          targetRotationRef.current += autoRotateSpeed;
        }

        // Smooth spring lerp
        const diff = targetRotationRef.current - currentRotationRef.current;
        currentRotationRef.current += diff * 0.09;

        setRotation(currentRotationRef.current);
        animationFrameId = requestAnimationFrame(loop);
      };

      animationFrameId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animationFrameId);
    }, [autoRotateSpeed]);

    // Handle Wheel event directly on container to rotate items cleanly
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        isInteractingRef.current = true;
        if (interactionTimeoutRef.current) {
          clearTimeout(interactionTimeoutRef.current);
        }

        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        
        // Responsive wheel sensitivity
        const wheelSensitivity = 0.075;
        targetRotationRef.current += delta * wheelSensitivity;

        interactionTimeoutRef.current = setTimeout(() => {
          isInteractingRef.current = false;
        }, 400);
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
        if (interactionTimeoutRef.current) {
          clearTimeout(interactionTimeoutRef.current);
        }
      };
    }, []);

    // Pointer / Mouse Drag Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      isInteractingRef.current = true;
      lastXRef.current = e.clientX;
      dragDistanceRef.current = 0;

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      dragDistanceRef.current += Math.abs(deltaX);

      const dragSensitivity = 0.2;
      targetRotationRef.current += deltaX * dragSensitivity;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (containerRef.current) {
        try {
          containerRef.current.releasePointerCapture(e.pointerId);
        } catch {
          // ignore if already released
        }
      }

      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      interactionTimeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
      }, 500);
    };

    const handleCardClick = (item: GalleryItem, index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragDistanceRef.current < 10) {
        onItemClick?.(item, index);
      }
    };

    return (
      <div
        ref={(node) => {
          (containerRef as any).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        role="region"
        aria-label="Circular 3D Gallery"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-none cursor-grab active:cursor-grabbing",
          className
        )}
        style={{ perspective: '2000px' }}
        {...props}
      >
        {/* 3D Circular Ring Stage */}
        <div
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {ringItems.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.35, 1 - (normalizedAngle / 160));

            return (
              <div
                key={(item.system?.id || item.photo.url) + i}
                role="group"
                aria-label={item.common}
                onClick={(e) => handleCardClick(item, i, e)}
                className="absolute w-[300px] h-[400px] cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-105"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-150px',
                  marginTop: '-200px',
                  opacity: opacity,
                  transformStyle: 'preserve-3d',
                  transition: 'opacity 0.2s linear',
                }}
              >
                {/* Card Container without orange halo - clean dark border and shadow */}
                <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden group border border-white/10 bg-slate-900/95 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
                  
                  {/* Live Website / Virtual Dashboard Area */}
                  <div className="absolute inset-0 overflow-hidden bg-slate-950 pointer-events-none select-none">
                    <div
                      style={{
                        width: '1200px',
                        height: '1600px',
                        transform: 'scale(0.25)',
                        transformOrigin: 'top left',
                      }}
                    >
                      {item.system?.url ? (
                        <iframe
                          src={item.system.url}
                          title={item.common}
                          className="w-full h-full border-0 bg-white pointer-events-none"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                      ) : (
                        <SimulatedSystemDashboard
                          systemCode={item.system?.system_code}
                          title={item.system?.title || item.common}
                        />
                      )}
                    </div>
                  </div>

                  {/* Clean Gradient Bottom Overlay with Typography */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-5 text-white select-none pointer-events-none">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-md truncate text-white">
                      {item.common}
                    </h2>
                    <em className="text-xs not-italic font-mono text-amber-400 font-bold block mt-0.5 tracking-wider opacity-90 truncate">
                      {item.binomial}
                    </em>
                    {item.system?.subtitle ? (
                      <p className="text-[11px] mt-1 opacity-80 line-clamp-2 leading-relaxed text-slate-300">
                        {item.system.subtitle}
                      </p>
                    ) : item.photo?.text ? (
                      <p className="text-[11px] mt-1 opacity-80 line-clamp-2 leading-relaxed text-slate-300">
                        {item.photo.text}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
export default CircularGallery;
