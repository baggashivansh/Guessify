import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { floatVariants, staggerContainer, staggerItem } from '../utils/motion';

const modes = [
  {
    to: '/party/create',
    emoji: '🎉',
    title: 'Party Mode',
    description: 'Play live with friends. Share a link or QR code and compete in real time.',
    cta: 'Create a room',
    rotate: 4,
  },
  {
    to: '/async/play',
    emoji: '🎯',
    title: 'Solo Play',
    description: 'Play on your own, then share a challenge link so friends can beat your score.',
    cta: 'Start solo',
    rotate: -3,
  },
  {
    to: '/daily',
    emoji: '☀️',
    title: 'Daily Puzzle',
    description: 'One puzzle per level each day. Same number for everyone. Quick and fun.',
    cta: 'Play today',
    rotate: 2,
  },
];

export function Home() {
  return (
    <div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="text-center mb-12 pt-2"
      >
        <motion.div variants={staggerItem} className="inline-block">
          <motion.div variants={floatVariants} animate="animate" className="inline-block">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Guessify</span>
            </h1>
          </motion.div>
        </motion.div>
        <motion.p
          variants={staggerItem}
          className="text-xl text-ink-muted max-w-lg mx-auto leading-relaxed"
        >
          Guess the number. Fewest guesses wins.
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
      >
        {modes.map((mode) => (
          <motion.div key={mode.to} variants={staggerItem}>
            <Link to={mode.to} className="block glass-card-hover p-7 group h-full">
              <motion.div
                whileHover={{ scale: 1.08, rotate: mode.rotate }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                className="w-13 h-13 w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center text-3xl mb-5"
              >
                {mode.emoji}
              </motion.div>
              <h2 className="font-display text-xl font-bold text-ink mb-2 group-hover:text-accent transition-colors">
                {mode.title}
              </h2>
              <p className="text-ink-muted text-sm leading-relaxed">{mode.description}</p>
              <div className="mt-5 text-accent text-sm font-semibold">{mode.cta} →</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
