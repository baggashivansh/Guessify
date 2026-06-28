import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { floatVariants, staggerContainer, staggerItem } from '../utils/motion';

export function Home() {
  return (
    <div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="text-center mb-12 pt-4"
      >
      <motion.div
        variants={staggerItem}
        initial="initial"
        animate="animate"
        className="inline-block"
      >
          <motion.div variants={floatVariants} animate="animate" className="inline-block">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Guessify</span>
            </h1>
          </motion.div>
        </motion.div>
        <motion.p
          variants={staggerItem}
          initial="initial"
          animate="animate"
          className="text-xl text-ink-muted max-w-lg mx-auto leading-relaxed"
        >
          Guess the number. Fewest guesses wins.
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
      >
        <motion.div variants={staggerItem} initial="initial" animate="animate">
          <Link to="/party/create" className="block glass-card-hover p-8 group h-full">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center text-3xl mb-5"
            >
              🎉
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-ink mb-2 group-hover:text-accent transition-colors">
              Party Mode
            </h2>
            <p className="text-ink-muted leading-relaxed">
              Play live with friends. Share a link or QR code. Big screen energy, loud wins.
            </p>
            <div className="mt-5 text-accent text-sm font-semibold">Create a room →</div>
          </Link>
        </motion.div>

        <motion.div variants={staggerItem} initial="initial" animate="animate">
          <Link to="/async" className="block glass-card-hover p-8 group h-full">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center text-3xl mb-5"
            >
              ⚡
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-ink mb-2 group-hover:text-accent transition-colors">
              Async Challenge
            </h2>
            <p className="text-ink-muted leading-relaxed">
              Play solo, share your score, challenge friends. Plus a daily puzzle — no waiting.
            </p>
            <div className="mt-5 text-accent text-sm font-semibold">Start playing →</div>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-ink-faint bg-white/60 border border-surface-border rounded-full px-6 py-3">
          <span>Easy: 1–100</span>
          <span className="text-surface-border">·</span>
          <span>Medium: 1–500</span>
          <span className="text-surface-border">·</span>
          <span>Hard: 1–1000</span>
        </div>
      </motion.div>
    </div>
  );
}
