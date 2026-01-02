'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from './useWindowSize';

export function SuccessAnimation({ isActive }: { isActive: boolean }) {
  const { width = 0, height = 0 } = useWindowSize();

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {width > 0 && height > 0 && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}

          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Outer glow rings */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: '120px', height: '120px', left: '-60px', top: '-60px' }}
                animate={{ scale: [1, 1.3, 0.8] }}
                transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                initial={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
              />

              {/* Checkmark circle */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 flex items-center justify-center shadow-2xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                  <motion.svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
              </div>

              {/* Success text */}
              <motion.div
                className="absolute top-full mt-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Success!</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Transaction completed</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CheckMark({ animated = true }: { animated?: boolean }) {
  return (
    <motion.svg
      className="w-6 h-6 text-green-500"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      stroke="currentColor"
      initial={animated ? { pathLength: 0, opacity: 0 } : {}}
      animate={animated ? { pathLength: 1, opacity: 1 } : {}}
      transition={animated ? { duration: 0.6 } : {}}
    >
      <path d="M5 13l4 4L19 7" />
    </motion.svg>
  );
}
