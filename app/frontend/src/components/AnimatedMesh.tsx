'use client';
import { motion } from 'framer-motion';

export function AnimatedMeshBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="3"
              result="noise"
              seed="2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="120"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <linearGradient id="mesh1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
            <stop offset="50%" stopColor="rgba(168,85,247,0.06)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.04)" />
          </linearGradient>
        </defs>

        {/* Animated mesh grid */}
        <motion.g filter="url(#noise)" opacity={0.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.line
              key={`v-${i}`}
              x1={`${(i + 1) * 250}`}
              y1="0"
              x2={`${(i + 1) * 250}`}
              y2="800"
              stroke="url(#mesh1)"
              strokeWidth="2"
              animate={{
                x: [0, 10, -10, 0],
              }}
              transition={{
                duration: 8 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {Array.from({ length: 3 }).map((_, i) => (
            <motion.line
              key={`h-${i}`}
              x1="0"
              y1={`${(i + 1) * 200}`}
              x2="1200"
              y2={`${(i + 1) * 200}`}
              stroke="url(#mesh1)"
              strokeWidth="2"
              animate={{
                y: [0, 15, -15, 0],
              }}
              transition={{
                duration: 10 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.g>

        {/* Floating gradient blobs */}
        <motion.circle
          cx="300"
          cy="200"
          r="150"
          fill="rgba(99,102,241,0.04)"
          animate={{
            cx: [300, 400, 250, 300],
            cy: [200, 300, 100, 200],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cx="900"
          cy="600"
          r="200"
          fill="rgba(168,85,247,0.03)"
          animate={{
            cx: [900, 800, 950, 900],
            cy: [600, 500, 700, 600],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
