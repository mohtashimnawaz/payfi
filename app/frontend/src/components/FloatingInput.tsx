'use client';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface FloatingInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  error,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value !== '' && value !== 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || ' '}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pt-6 pb-2
            bg-transparent border rounded-2xl
            text-lg font-medium text-body
            focus:outline-none transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/5'
                : `border-[#e6e9ef] focus:border-indigo-500 focus:bg-indigo-500/5
              dark:border-[#2d3748] dark:focus:border-indigo-400 dark:focus:bg-indigo-400/5`
            }
          `}
        />

        {/* Floating Label */}
        <motion.label
          className="absolute left-4 text-sm font-medium cursor-text pointer-events-none"
          animate={{
            y: isActive ? -20 : 0,
            scale: isActive ? 0.85 : 1,
            color: isActive ? 'rgb(99, 102, 241)' : 'rgb(73, 84, 92)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => inputRef.current?.focus()}
        >
          {label}
        </motion.label>

        {/* Success Checkmark */}
        {!error && hasValue && (
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}

        {/* Error Icon */}
        {error && (
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-500 font-medium"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
