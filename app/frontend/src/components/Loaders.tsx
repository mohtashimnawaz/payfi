'use client';
import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`${sizeMap[size]} border-2 border-transparent border-t-indigo-500 border-r-indigo-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export function ButtonLoader() {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span className="text-sm font-medium">Processing...</span>
    </div>
  );
}

export function PulseButton({
  children,
  isLoading = false,
  onClick,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn-primary px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {isLoading ? <ButtonLoader /> : children}
    </motion.button>
  );
}
