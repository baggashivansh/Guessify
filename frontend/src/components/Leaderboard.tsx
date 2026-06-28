import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../types';
import { formatTime } from '../utils/storage';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  secretNumber?: number;
  loud?: boolean;
}

export function Leaderboard({ entries, secretNumber, loud }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => {
    if (a.rank === -1) return 1;
    if (b.rank === -1) return -1;
    return a.rank - b.rank;
  });

  const podium = sorted.filter((e) => e.rank > 0).slice(0, 3);
  const rest = sorted.filter((e) => e.rank > 3 || e.rank === -1);

  return (
    <div className="space-y-6">
      {secretNumber !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="text-center"
        >
          <div className="text-ink-muted text-sm font-medium">The number was</div>
          <div className={`font-display font-bold gradient-text ${loud ? 'text-6xl' : 'text-4xl'}`}>
            {secretNumber}
          </div>
        </motion.div>
      )}

      {podium.length > 0 && (
        <div className={`grid gap-4 ${loud ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
          {podium.map((entry, i) => (
            <motion.div
              key={entry.nickname}
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: entry.isWinner && loud ? 1.03 : 1 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 300, damping: 22 }}
              className={`glass-card p-6 text-center relative overflow-hidden ${
                entry.isWinner ? 'border-accent shadow-glow ring-1 ring-accent/20' : ''
              } ${loud && entry.isWinner ? 'sm:scale-105' : ''}`}
            >
              {entry.isWinner && (
                <div className="absolute inset-0 bg-gradient-to-b from-accent-soft/80 to-transparent pointer-events-none" />
              )}
              <div className={`text-4xl mb-2 relative ${loud ? 'text-5xl' : ''}`}>
                {entry.rank === 1 ? '🏆' : entry.rank === 2 ? '🥈' : '🥉'}
              </div>
              <div className={`font-display font-bold text-ink relative ${loud ? 'text-2xl' : 'text-xl'}`}>
                {entry.nickname}
              </div>
              <div className="text-accent mt-2 text-lg font-semibold relative">
                {entry.guessCount} guess{entry.guessCount !== 1 ? 'es' : ''}
              </div>
              <div className="text-ink-muted text-sm mt-1 relative">{formatTime(entry.elapsedMs)}</div>
              {entry.isWinner && loud && (
                <div className="mt-3 text-success font-bold text-lg animate-pulse relative">WINNER!</div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="glass-card divide-y divide-surface-border overflow-hidden">
          {rest.map((entry) => (
            <div key={entry.nickname} className="flex items-center justify-between px-4 py-3 bg-white">
              <span className="font-medium text-ink">{entry.nickname}</span>
              <span className="text-ink-muted text-sm">
                {entry.rank === -1
                  ? `Still playing (${entry.guessCount} guesses)`
                  : `${entry.guessCount} guesses · ${formatTime(entry.elapsedMs)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
