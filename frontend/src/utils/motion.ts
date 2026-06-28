import type { Variants } from 'framer-motion';

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.22, ease: easeOut },
  },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: easeOut },
  },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 22 },
  },
};

export const floatVariants: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

export function feedbackSlide(result: 'HIGHER' | 'LOWER' | 'CORRECT') {
  if (result === 'CORRECT') {
    return {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    };
  }
  return {
    initial: { opacity: 0, x: result === 'HIGHER' ? 24 : -24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: result === 'HIGHER' ? -16 : 16 },
  };
}
