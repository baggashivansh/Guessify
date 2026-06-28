import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({ label = 'Loading', size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-accent/20 border-t-accent`}
        aria-hidden
      />
      <motion.p
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="text-sm text-ink-muted font-medium"
      >
        {label}
      </motion.p>
    </div>
  );
}
