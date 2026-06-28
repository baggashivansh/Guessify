import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Difficulty } from '../types';
import { DIFFICULTIES } from '../types';
import { Button } from './Button';
import { WarmthIndicator } from './WarmthIndicator';
import { WinReveal } from './WinReveal';
import type { GuessResponse } from '../types';
import { sounds } from '../utils/sound';
import { feedbackSlide, popIn } from '../utils/motion';

interface GameBoardProps {
  difficulty: Difficulty;
  guesses: number[];
  lastResponse: GuessResponse | null;
  onGuess: (value: number) => Promise<GuessResponse>;
  disabled?: boolean;
  large?: boolean;
}

export function GameBoard({
  difficulty,
  guesses,
  lastResponse,
  onGuess,
  disabled,
  large,
}: GameBoardProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const diff = DIFFICULTIES.find((d) => d.key === difficulty)!;

  const submit = async () => {
    const value = parseInt(input, 10);
    if (isNaN(value) || value < diff.min || value > diff.max) {
      setError(`Enter a number between ${diff.min} and ${diff.max}`);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await onGuess(value);
      if (res.result === 'HIGHER') sounds.higher();
      else if (res.result === 'LOWER') sounds.lower();
      else sounds.correct();
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit guess');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        variants={popIn}
        initial="initial"
        animate="animate"
        className="glass-card p-6 text-center"
      >
        <div className="text-ink-faint text-sm mb-1 uppercase tracking-wider font-medium">Range</div>
        <div className={`font-display font-bold text-ink ${large ? 'text-3xl' : 'text-2xl'}`}>
          {diff.min} — {diff.max}
        </div>
        <div className="text-accent mt-1 font-medium">{diff.label}</div>
      </motion.div>

      <AnimatePresence mode="wait">
        {lastResponse?.finished && lastResponse.secretNumber != null ? (
          <WinReveal
            key="win"
            secretNumber={lastResponse.secretNumber}
            guessCount={lastResponse.guessCount}
          />
        ) : lastResponse ? (
          <motion.div
            key={lastResponse.guessCount}
            {...feedbackSlide(lastResponse.result)}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass-card p-8 bg-accent-soft/30"
          >
            <WarmthIndicator warmth={lastResponse.warmth} result={lastResponse.result} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!disabled && !lastResponse?.finished && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <motion.input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={`${diff.min} – ${diff.max}`}
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={`w-full bg-white border border-surface-border rounded-2xl px-6 text-center font-display font-bold text-ink placeholder:text-ink-faint shadow-input focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-colors ${
              large ? 'py-5 text-3xl' : 'py-4 text-2xl'
            }`}
            autoFocus
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-danger text-sm text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <Button size={large ? 'xl' : 'lg'} className="w-full" onClick={submit} loading={loading}>
            Guess
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {guesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-4 overflow-hidden"
          >
            <div className="text-ink-muted text-sm mb-3 font-medium">
              Your guesses ({guesses.length})
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {guesses.map((g, i) => (
                <motion.span
                  key={`${g}-${i}`}
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-sm font-mono text-ink"
                >
                  {g}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
