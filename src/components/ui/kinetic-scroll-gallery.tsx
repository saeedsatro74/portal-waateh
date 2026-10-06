import React from "react";
import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion";

export interface KineticScrollGalleryProps {
  images?: string[];
  title?: string;
  subtitle?: string;
  className?: string;
  onItemClick?: (index: number) => void;
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
];

interface KineticGridItemProps {
  image: string;
  scrollVelocity: MotionValue<number>;
  onClick?: () => void;
}

const KineticGridItem: React.FC<KineticGridItemProps> = ({ image, scrollVelocity, onClick }) => {
  // Smooth the velocity value for a more gradual effect
  const smoothedVelocity = useSpring(scrollVelocity, {
    mass: 0.1,
    stiffness: 80,
    damping: 40,
  });

  // Transform the smoothed velocity into a skew value.
  // The faster the scroll, the more it skews.
  const skew = useTransform(smoothedVelocity, [-1500, 0, 1500], [-15, 0, 15]);

  return (
    <motion.div
      onClick={onClick}
      className="w-full h-80 relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
      style={{ skewX: skew }}
    >
      <img
        src={image}
        alt="Gallery preview"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        style={{
          transform: "scale(1.15)", // Slight zoom to prevent edges showing on skew
        }}
        loading="lazy"
      />
    </motion.div>
  );
};

export default function KineticScrollGallery({
  images = DEFAULT_IMAGES,
  title,
  subtitle,
  className = "",
  onItemClick,
}: KineticScrollGalleryProps) {
  const { scrollYProgress } = useScroll();

  // Framer Motion's useScroll provides scroll progress to calculate velocity
  const scrollYVelocity = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 1000],
    { clamp: false }
  );

  return (
    <div className={`w-full min-h-screen ${className}`}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-3 text-base sm:text-lg opacity-80">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <KineticGridItem
              key={index}
              image={img}
              scrollVelocity={scrollYVelocity}
              onClick={() => onItemClick?.(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
