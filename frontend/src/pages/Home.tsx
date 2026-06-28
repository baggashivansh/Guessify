import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/motion';
import { IconParty, IconSolo, IconDaily, IconChevron } from '../components/Icons';
import type { ReactNode } from 'react';

const modes: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}[] = [
  {
    to: '/party/create',
    icon: <IconParty className="h-5 w-5 text-accent" />,
    title: 'Party Mode',
    description: 'Play live with friends. Share a link or QR code and compete in real time.',
  },
  {
    to: '/async/play',
    icon: <IconSolo className="h-5 w-5 text-accent" />,
    title: 'Solo Play',
    description: 'Play on your own, then share a challenge link so friends can beat your score.',
  },
  {
    to: '/daily',
    icon: <IconDaily className="h-5 w-5 text-accent" />,
    title: 'Daily Puzzle',
    description: 'One puzzle per level each day. Same number for everyone. Quick and fun.',
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
        <motion.h1
          variants={staggerItem}
          className="font-display text-5xl md:text-6xl font-bold mb-4 tracking-tight"
        >
          <span className="gradient-text">Guessify</span>
        </motion.h1>
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
        className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto"
      >
        {modes.map((mode) => (
          <motion.div key={mode.to} variants={staggerItem}>
            <Link
              to={mode.to}
              className="block glass-card-hover p-6 group h-full transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="h-10 w-10 rounded-xl bg-accent/8 border border-accent/10 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-accent/12">
                {mode.icon}
              </div>
              <h2 className="font-display text-lg font-semibold text-ink mb-2 group-hover:text-accent transition-colors duration-300">
                {mode.title}
              </h2>
              <p className="text-ink-muted text-sm leading-relaxed">{mode.description}</p>
              <div className="mt-4 flex items-center gap-1 text-accent text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                Play
                <IconChevron className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
