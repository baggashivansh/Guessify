import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogoMark } from './LogoMark';

interface AppSplashProps {
  onDone: () => void;
}

export function AppSplash({ onDone }: AppSplashProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1200);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LogoMark className="h-14 w-14" />
        </motion.div>

        <div className="text-center">
          <p className="font-display font-semibold text-xl tracking-tight text-ink">Guessify</p>
          <p className="text-sm text-ink-muted mt-1">Guess the number</p>
        </div>

        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-accent/70"
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
