import { motion } from 'framer-motion';
import type { Warmth } from '../types';

const warmthConfig: Record<Warmth, { label: string; color: string; emoji: string }> = {
  COLD: { label: 'Cold', color: 'text-sky-600', emoji: '🧊' },
  WARM: { label: 'Warm', color: 'text-amber-600', emoji: '🌡️' },
  HOT: { label: 'Hot', color: 'text-orange-600', emoji: '🔥' },
  CORRECT: { label: 'Correct!', color: 'text-success', emoji: '🎯' },
};

interface WarmthIndicatorProps {
  warmth: Warmth;
  result: 'HIGHER' | 'LOWER' | 'CORRECT';
}

export function WarmthIndicator({ warmth, result }: WarmthIndicatorProps) {
  const config = warmthConfig[warmth];

  return (
    <div className="text-center space-y-2">
      <motion.div
        key={warmth}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="text-4xl"
      >
        {config.emoji}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className={`text-xl font-semibold ${config.color}`}
      >
        {config.label}
      </motion.div>
      {result !== 'CORRECT' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-ink-muted"
        >
          Go{' '}
          <motion.span
            animate={{ y: result === 'HIGHER' ? [0, -3, 0] : [0, 3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block text-ink font-semibold"
          >
            {result === 'HIGHER' ? 'higher ↑' : 'lower ↓'}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
