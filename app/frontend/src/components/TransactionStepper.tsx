'use client';
import { motion } from 'framer-motion';

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

interface Step {
  id: string;
  label: string;
  status: StepStatus;
  icon: React.ReactNode;
}

interface TransactionStepperProps {
  steps: Step[];
  currentStep: number;
}

export function TransactionStepper({ steps, currentStep }: TransactionStepperProps) {
  return (
    <div className="w-full">
      {/* Steps Container */}
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-[#e6e9ef] dark:bg-[#2d3748] -z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>

        {/* Individual Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          let bgColor = 'bg-[#e6e9ef] dark:bg-[#2d3748]';
          let textColor = 'text-muted';
          let iconColor = 'text-muted';

          if (isCompleted) {
            bgColor = 'bg-gradient-to-r from-indigo-500 to-purple-500';
            textColor = 'text-body';
            iconColor = 'text-white';
          } else if (isActive) {
            bgColor = 'bg-gradient-to-r from-indigo-500 to-purple-500 ring-4 ring-indigo-200 dark:ring-indigo-900/30';
            textColor = 'text-body';
            iconColor = 'text-white';
          }

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  font-semibold transition-all duration-300 relative z-10
                  ${bgColor}
                `}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {isCompleted ? (
                  <motion.svg
                    className={`w-6 h-6 ${iconColor}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                ) : (
                  <motion.div
                    animate={isActive ? { rotate: 360 } : {}}
                    transition={isActive ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                    className={iconColor}
                  >
                    {step.icon}
                  </motion.div>
                )}
              </motion.div>

              {/* Step Label */}
              <motion.p
                className={`mt-3 text-xs font-semibold uppercase tracking-widest ${textColor} transition-colors duration-300`}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {step.label}
              </motion.p>

              {/* Pulse Ring for Active Step */}
              {isActive && (
                <motion.div
                  className="absolute w-16 h-16 rounded-full border-2 border-indigo-500"
                  animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      <motion.div
        className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentStep}
      >
        <p className="text-sm font-medium text-body">{steps[currentStep].label}</p>
      </motion.div>
    </div>
  );
}
