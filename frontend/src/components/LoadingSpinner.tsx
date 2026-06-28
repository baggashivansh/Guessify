import { motion } from 'framer-motion';
import { LogoMark } from './LogoMark';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <LogoMark className="h-10 w-10 opacity-80" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-sm text-ink-muted font-medium"
      >
        {label}
      </motion.p>
    </div>
  );
}
