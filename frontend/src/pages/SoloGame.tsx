import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { GameBoard } from '../components/GameBoard';
import type { Difficulty, GuessResponse } from '../types';
import { api } from '../api/client';
import { copyToClipboard, formatTime, getSavedNickname, saveNickname, saveSoloSession, shareUrl } from '../utils/storage';
import { buildAppUrl } from '../utils/validation';
import { celebrateWin } from '../utils/sound';

type Phase = 'nickname' | 'difficulty' | 'playing' | 'done';

export function SoloGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('nickname');
  const [nickname, setNickname] = useState(getSavedNickname());
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [token, setToken] = useState('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [lastResponse, setLastResponse] = useState<GuessResponse | null>(null);
  const [challengeUrl, setChallengeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const continueToDifficulty = () => {
    if (!nickname.trim()) {
      setError('Enter your nickname');
      return;
    }
    setError('');
    saveNickname(nickname.trim());
    setPhase('difficulty');
  };

  const start = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.startSolo(nickname.trim(), difficulty);
      setToken(res.sessionToken);
      saveSoloSession(res.sessionToken, res.nickname);
      setPhase('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start game');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (value: number) => {
    const res = await api.soloGuess(token, value);
    setGuesses((g) => [...g, value]);
    setLastResponse(res);
    if (res.finished) {
      celebrateWin();
      const challenge = await api.createChallengeFromSolo(token);
      setChallengeUrl(buildAppUrl(`/challenge/${challenge.code}`));
      setPhase('done');
    }
    return res;
  };

  const copy = async () => {
    await copyToClipboard(challengeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === 'nickname' || phase === 'difficulty') {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Solo Play"
          subtitle={phase === 'nickname' ? 'Enter your nickname' : 'Choose your range'}
        />
        <div className="glass-card p-8 space-y-6">
          <AnimatePresence mode="wait">
            {phase === 'nickname' ? (
              <motion.div
                key="nickname"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="space-y-6"
              >
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  maxLength={20}
                  className="input-field text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && continueToDifficulty()}
                />
                {error && <p className="text-danger text-sm text-center">{error}</p>}
                <Button size="xl" className="w-full" onClick={continueToDifficulty}>
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="difficulty"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-6"
              >
                <p className="text-ink-muted text-center text-sm">
                  Playing as <span className="font-semibold text-ink">{nickname.trim()}</span>
                </p>
                <DifficultyPicker value={difficulty} onChange={setDifficulty} large />
                {error && <p className="text-danger text-sm text-center">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" className="flex-1" onClick={() => setPhase('nickname')}>
                    Back
                  </Button>
                  <Button size="lg" className="flex-1" onClick={start} loading={loading}>
                    Start Game
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (phase === 'done' && lastResponse) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <PageHeader
            title="You got it!"
            subtitle={`${guesses.length} guesses in ${formatTime(lastResponse.elapsedMs ?? 0)}`}
          />
        </motion.div>

        <div className="glass-card p-8 space-y-6">
          <p className="text-ink-muted">Challenge your friends to beat your score on the same number.</p>
          <code className="block text-accent text-sm break-all bg-accent-soft border border-accent/20 p-3 rounded-xl font-mono">
            {challengeUrl}
          </code>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={copy}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={() => shareUrl(challengeUrl, 'Can you beat my Guessify score?')}
            >
              Share
            </Button>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            New Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Your Turn" subtitle={`${difficulty} mode`} />
      <GameBoard
        difficulty={difficulty}
        guesses={guesses}
        lastResponse={lastResponse}
        onGuess={handleGuess}
      />
    </div>
  );
}
