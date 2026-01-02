'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  color = '#6366f1',
}: CircularProgressProps) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center justify-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <span className="text-2xl font-bold" style={{ color }}>
            {inView ? Math.round(percentage) : 0}%
          </span>
        </motion.div>
      </div>
      {label && <p className="text-sm font-medium text-muted mt-2">{label}</p>}
    </motion.div>
  );
}

interface PercentageBarProps {
  percentage: number;
  label?: string;
  color?: string;
  animated?: boolean;
}

export function PercentageBar({
  percentage,
  label,
  color = 'indigo',
  animated = true,
}: PercentageBarProps) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {label && <p className="text-sm font-medium text-body mb-2">{label}</p>}
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorMap[color as keyof typeof colorMap]}`}
          initial={{ width: 0 }}
          animate={inView && animated ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <p className="text-xs text-muted mt-1 font-medium">{percentage}%</p>
    </motion.div>
  );
}

interface ComparisonBarProps {
  yourValue: number;
  averageValue: number;
  label?: string;
  maxValue?: number;
}

export function ComparisonBar({
  yourValue,
  averageValue,
  label,
  maxValue = 100,
}: ComparisonBarProps) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const yourPercent = (yourValue / maxValue) * 100;
  const avgPercent = (averageValue / maxValue) * 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {label && <p className="text-sm font-medium text-body">{label}</p>}

      <div>
        <p className="text-xs text-muted mb-1">Your Balance</p>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={inView ? { width: `${yourPercent}%` } : {}}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-muted mt-1">{yourValue}</p>
      </div>

      <div>
        <p className="text-xs text-muted mb-1">Network Average</p>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-orange-500"
            initial={{ width: 0 }}
            animate={inView ? { width: `${avgPercent}%` } : {}}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
        <p className="text-xs text-muted mt-1">{averageValue}</p>
      </div>
    </motion.div>
  );
}

interface VaultVisualizerProps {
  filled: number;
  total: number;
  label?: string;
}

export function VaultVisualizer({ filled, total, label }: VaultVisualizerProps) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const fillPercentage = (filled / total) * 100;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Vault Container */}
      <div className="relative w-24 h-32 rounded-lg border-4 border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {/* Lock Icon */}
        <motion.div
          className="absolute top-1 right-1 text-sm"
          animate={inView ? { rotateZ: [0, -5, 5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔒
        </motion.div>

        {/* Fill Level */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-purple-400"
          initial={{ height: 0 }}
          animate={inView ? { height: `${fillPercentage}%` } : {}}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          {/* Liquid Animation */}
          {fillPercentage > 0 && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-2 bg-white/20"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="text-center">
        {label && <p className="text-sm font-medium text-muted">{label}</p>}
        <p className="text-lg font-bold text-body">
          {filled} / {total}
        </p>
        <p className="text-xs text-muted">{fillPercentage.toFixed(1)}% Full</p>
      </div>
    </motion.div>
  );
}
