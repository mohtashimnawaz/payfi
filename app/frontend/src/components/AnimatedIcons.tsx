'use client';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function LockIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { rotateZ: [0, -5, 5, 0] } : {}}
      transition={animate ? { duration: 2, repeat: Infinity } : {}}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </motion.svg>
  );
}

export function ShieldIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { scale: [1, 1.05, 1] } : {}}
      transition={animate ? { duration: 2, repeat: Infinity } : {}}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </motion.svg>
  );
}

export function WalletIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { x: [0, 2, -2, 0] } : {}}
      transition={animate ? { duration: 2, repeat: Infinity } : {}}
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <path d="M1 10h22" />
      <circle cx="17" cy="16" r="2" />
    </motion.svg>
  );
}

export function CheckmarkIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={className}
      initial={animate ? { pathLength: 0, opacity: 0 } : {}}
      animate={animate ? { pathLength: 1, opacity: 1 } : {}}
      transition={animate ? { duration: 0.6 } : {}}
    >
      <polyline points="20 6 9 17 4 12" />
    </motion.svg>
  );
}

export function LinkIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { rotate: [0, 10, -10, 0] } : {}}
      transition={animate ? { duration: 2.5, repeat: Infinity } : {}}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </motion.svg>
  );
}

export function PenIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { rotate: [0, 5, -5, 0] } : {}}
      transition={animate ? { duration: 2, repeat: Infinity } : {}}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </motion.svg>
  );
}

export function HourglassIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { rotateZ: [0, 180] } : {}}
      transition={animate ? { duration: 2, repeat: Infinity } : {}}
    >
      <path d="M6 2h12v6H6z" />
      <path d="M12 8l-6 6" />
      <path d="M18 8l-6 6" />
      <path d="M6 16h12v6H6z" />
    </motion.svg>
  );
}

export function SparkleIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        animate={animate ? { scale: [1, 1.2, 1] } : {}}
        transition={animate ? { duration: 1.5, repeat: Infinity } : {}}
      />
      {[0, 90, 180, 270].map((angle) => (
        <motion.circle
          key={angle}
          cx={12 + 6 * Math.cos((angle * Math.PI) / 180)}
          cy={12 + 6 * Math.sin((angle * Math.PI) / 180)}
          r="1.5"
          animate={animate ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={animate ? { duration: 1.5, repeat: Infinity, delay: angle / 360 } : {}}
        />
      ))}
    </motion.svg>
  );
}

export function PlugIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      animate={animate ? { y: [0, -3, 0] } : {}}
      transition={animate ? { duration: 1.5, repeat: Infinity } : {}}
    >
      <circle cx="12" cy="2" r="1" />
      <circle cx="19" cy="2" r="1" />
      <circle cx="5" cy="2" r="1" />
      <path d="M12 8v8" />
      <path d="M5 10a2 2 0 0 0 2-2V4" />
      <path d="M19 10a2 2 0 0 1-2-2V4" />
      <path d="M12 16v2" />
      <path d="M7 22h10" />
    </motion.svg>
  );
}

export function NetworkIcon({ size = 24, className = '', animate = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      {[0, 120, 240].map((angle, idx) => (
        <motion.g key={angle}>
          <circle
            cx={12 + 7 * Math.cos((angle * Math.PI) / 180)}
            cy={12 + 7 * Math.sin((angle * Math.PI) / 180)}
            r="1.5"
            animate={animate ? { r: [1.5, 2.5, 1.5] } : {}}
            transition={animate ? { duration: 2, repeat: Infinity, delay: idx * 0.2 } : {}}
          />
          <line
            x1="12"
            y1="12"
            x2={12 + 7 * Math.cos((angle * Math.PI) / 180)}
            y2={12 + 7 * Math.sin((angle * Math.PI) / 180)}
            opacity="0.5"
          />
        </motion.g>
      ))}
      <circle cx="12" cy="12" r="2" />
    </motion.svg>
  );
}
