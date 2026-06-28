import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { Button } from '../components/Button';
import type { Difficulty } from '../types';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '../utils/motion';

export function DailyPick() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Daily Puzzle" subtitle="Pick your challenge level for today" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="glass-card p-8 space-y-6"
      >
        <motion.p variants={staggerItem} className="text-ink-muted text-center leading-relaxed">
          Everyone gets the same secret number today. Choose how wide the range should be.
        </motion.p>

        <motion.div variants={staggerItem}>
          <DifficultyPicker value={difficulty} onChange={setDifficulty} large />
        </motion.div>

        <motion.div variants={staggerItem}>
          <Button size="xl" className="w-full" onClick={() => navigate(`/daily/${difficulty}`)}>
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
