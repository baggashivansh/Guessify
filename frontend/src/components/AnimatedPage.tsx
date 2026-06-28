import { motion } from 'framer-motion';
import { pageVariants } from '../utils/motion';

interface AnimatedPageProps {
  children: React.ReactNode;
}

export function AnimatedPage({ children }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
