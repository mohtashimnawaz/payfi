'use client';
import { motion } from 'framer-motion';

export function SkeletonLoader({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <motion.div
      className={`${width} ${height} bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg`}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader key={i} height={i === lines - 1 ? 'h-3' : 'h-4'} width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <SkeletonLoader height="h-8" width="w-1/2" />
      <SkeletonText lines={4} />
    </div>
  );
}
