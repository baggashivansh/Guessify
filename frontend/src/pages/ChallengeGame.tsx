import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { GameBoard } from '../components/GameBoard';
import { Leaderboard } from '../components/Leaderboard';
import type { ChallengeInfo, GuessResponse } from '../types';
import { api } from '../api/client';
import { formatTime, getSavedNickname, saveChallengeSession, saveNickname } from '../utils/storage';
import { useInvalidCodeRedirect } from '../hooks/useSessionGuard';
import { celebrateWin } from '../utils/sound';

type Phase = 'info' | 'playing' | 'done';

export function ChallengeGame() {
  const code = useInvalidCodeRedirect();
  const navigate = useNavigate();
  const [info, setInfo] = useState<ChallengeInfo | null>(null);
  const [phase, setPhase] = useState<Phase>('info');
  const [nickname, setNickname] = useState(getSavedNickname());
  const [token, setToken] = useState('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [lastResponse, setLastResponse] = useState<GuessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    api.getChallenge(code).then(setInfo).catch((e) => setError(e.message));
  }, [code]);

  const start = async () => {
    if (!code || !nickname.trim()) return;
    setLoading(true);
    try {
      saveNickname(nickname.trim());
      const res = await api.startChallenge(code, nickname.trim());
      setToken(res.sessionToken);
      saveChallengeSession(code, {
        resourceId: code,
        playerId: res.playerId,
        sessionToken: res.sessionToken,
        nickname: res.nickname,
      });
      setPhase('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (value: number) => {
    if (!code) throw new Error('No code');
    const res = await api.challengeGuess(code, token, value);
    setGuesses((g) => [...g, value]);
    setLastResponse(res);
    if (res.finished) {
      celebrateWin();
      setPhase('done');
    }
    return res;
  };

  if (!code) return null;

  if (error && !info) {
    return (
      <div className="text-center">
        <PageHeader title="Challenge Not Found" subtitle={error} />
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (phase === 'info' && info) {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader title="Challenge Accepted?" subtitle={`From ${info.creatorNickname}`} />
        <div className="glass-card p-8 space-y-6 text-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-subtle border border-surface-border rounded-xl p-4">
              <div className="text-ink-muted text-sm font-medium">Their score</div>
              <div className="font-display text-2xl font-bold text-accent">
                {info.creatorGuesses} guesses
              </div>
              <div className="text-ink-faint text-sm">{formatTime(info.creatorTimeMs)}</div>
            </div>
            <div className="bg-surface-subtle border border-surface-border rounded-xl p-4">
              <div className="text-ink-muted text-sm font-medium">Difficulty</div>
              <div className="font-display text-2xl font-bold text-ink">{info.difficulty}</div>
            </div>
          </div>
          <p className="text-ink-muted">Same secret number. Can you beat them?</p>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname"
            maxLength={20}
            className="input-field text-lg"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button size="xl" className="w-full" onClick={start} loading={loading}>
            Accept Challenge
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'done' && info && lastResponse) {
    const beatCreator =
      guesses.length < info.creatorGuesses ||
      (guesses.length === info.creatorGuesses &&
        (lastResponse.elapsedMs ?? 0) < info.creatorTimeMs);

    return (
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <PageHeader
            title={beatCreator ? '🏆 You Win!' : '😤 Close one!'}
            subtitle={beatCreator ? 'You beat the challenge!' : `${info.creatorNickname} still holds the crown`}
          />
        </motion.div>
        <Leaderboard
          entries={[
            {
              nickname: info.creatorNickname,
              guessCount: info.creatorGuesses,
              elapsedMs: info.creatorTimeMs,
              rank: beatCreator ? 2 : 1,
              isWinner: !beatCreator,
            },
            {
              nickname: nickname,
              guessCount: guesses.length,
              elapsedMs: lastResponse.elapsedMs ?? 0,
              rank: beatCreator ? 1 : 2,
              isWinner: beatCreator,
            },
          ]}
          secretNumber={lastResponse.secretNumber ?? undefined}
          loud
        />
        <div className="flex justify-center mt-8">
          <Button size="lg" variant="secondary" onClick={() => navigate('/async/play')}>
            Create Your Own Challenge
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Challenge Mode" subtitle={info ? `Beat ${info.creatorNickname}` : ''} />
      {info && (
        <GameBoard
          difficulty={info.difficulty}
          guesses={guesses}
          lastResponse={lastResponse}
          onGuess={handleGuess}
        />
      )}
    </div>
  );
}
