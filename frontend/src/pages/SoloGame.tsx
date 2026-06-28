import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { GameBoard } from '../components/GameBoard';
import type { Difficulty, GuessResponse } from '../types';
import { api } from '../api/client';
import { copyToClipboard, formatTime, getSavedNickname, saveNickname, saveSoloSession, shareUrl } from '../utils/storage';
import { buildAppUrl } from '../utils/validation';
import { celebrateWin } from '../utils/sound';

type Phase = 'setup' | 'playing' | 'done';

export function SoloGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('setup');
  const [nickname, setNickname] = useState(getSavedNickname());
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [token, setToken] = useState('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [lastResponse, setLastResponse] = useState<GuessResponse | null>(null);
  const [challengeUrl, setChallengeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const start = async () => {
    if (!nickname.trim()) {
      setError('Enter your nickname');
      return;
    }
    setLoading(true);
    setError('');
    try {
      saveNickname(nickname.trim());
      const res = await api.startSolo(nickname.trim(), difficulty);
      setToken(res.sessionToken);
      saveSoloSession(res.sessionToken, res.nickname);
      setPhase('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start');
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

  if (phase === 'setup') {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader title="Play & Challenge" subtitle="Beat the number, then dare your friends" />
        <div className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm text-ink-muted mb-2 font-medium">Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-field text-lg"
              maxLength={20}
            />
          </div>
          <DifficultyPicker value={difficulty} onChange={setDifficulty} large />
          {error && <p className="text-danger text-sm text-center">{error}</p>}
          <Button size="xl" className="w-full" onClick={start} loading={loading}>
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'done' && lastResponse) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <PageHeader title="🎯 You got it!" subtitle={`${guesses.length} guesses in ${formatTime(lastResponse.elapsedMs ?? 0)}`} />
        </motion.div>

        <div className="glass-card p-8 space-y-6">
          <p className="text-ink-muted">Challenge your friends to beat your score on the same number:</p>
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
          <Button variant="ghost" onClick={() => navigate('/async')}>
            Back to Async
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
