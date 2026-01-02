'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  format?: (value: number) => string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  suffix = '',
  prefix = '',
  format,
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        const currentCount = from + (to - from) * progress;
        setCount(currentCount);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [from, to, duration]);

  const displayValue = format
    ? format(count)
    : `${prefix}${count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${suffix}`;

  return (
    <motion.span
      className={className}
      key={to}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue}
    </motion.span>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  color?: 'indigo' | 'purple' | 'pink' | 'green' | 'blue';
}

export function StatCard({ label, value, suffix, prefix, icon, color = 'indigo' }: StatCardProps) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
  };

  return (
    <motion.div
      className={`p-6 rounded-2xl border ${colorMap[color]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted uppercase tracking-widest">{label}</p>
        {icon && <div className="text-xl">{icon}</div>}
      </div>
      <p className="text-3xl font-bold">
        <AnimatedCounter to={value} prefix={prefix} suffix={suffix} duration={1.5} decimals={0} />
      </p>
    </motion.div>
  );
}
