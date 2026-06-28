import { motion } from 'framer-motion';
import { popIn } from '../utils/motion';

interface WinRevealProps {
  secretNumber: number;
  guessCount: number;
}

export function WinReveal({ secretNumber, guessCount }: WinRevealProps) {
  return (
    <motion.div
      variants={popIn}
      initial="initial"
      animate="animate"
      className="glass-card p-10 text-center bg-gradient-to-b from-accent-soft/60 to-white border-accent/30 shadow-glow"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
        className="text-5xl mb-4"
      >
        🎯
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-ink-muted text-sm font-medium uppercase tracking-wider"
      >
        Correct!
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.25 }}
        className="font-display text-6xl font-bold gradient-text my-3"
      >
        {secretNumber}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-ink-muted"
      >
        in <span className="text-ink font-semibold">{guessCount}</span> guess
        {guessCount !== 1 ? 'es' : ''}
      </motion.div>
    </motion.div>
  );
}
