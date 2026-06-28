import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { GameBoard } from '../components/GameBoard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { DailyInfo, Difficulty, GuessResponse } from '../types';
import { DIFFICULTIES } from '../types';
import { api } from '../api/client';
import { formatTime, getSavedNickname, saveDailySession, saveNickname } from '../utils/storage';
import { isValidDifficulty } from '../utils/validation';
import { celebrateWin } from '../utils/sound';

type Phase = 'info' | 'playing' | 'done';

export function DailyGame() {
  const { difficulty: rawDifficulty } = useParams<{ difficulty: Difficulty }>();
  const difficulty = isValidDifficulty(rawDifficulty) ? rawDifficulty : null;
  const navigate = useNavigate();
  const [info, setInfo] = useState<DailyInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('info');
  const [nickname, setNickname] = useState(getSavedNickname());
  const [token, setToken] = useState('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [lastResponse, setLastResponse] = useState<GuessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const difficultyLabel = DIFFICULTIES.find((d) => d.key === difficulty)?.label ?? difficulty;
  const rangeLabel =
    info != null ? `${info.minRange} to ${info.maxRange}` : 'loading range';

  useEffect(() => {
    if (!difficulty) return;
    setInfoLoading(true);
    setError('');
    api
      .getDailyInfo(difficulty)
      .then(setInfo)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load puzzle'))
      .finally(() => setInfoLoading(false));
  }, [difficulty]);

  const start = async () => {
    if (!difficulty || !nickname.trim()) {
      setError('Enter your nickname');
      return;
    }
    setLoading(true);
    setError('');
    try {
      saveNickname(nickname.trim());
      const res = await api.startDaily(difficulty, nickname.trim());
      setToken(res.sessionToken);
      saveDailySession(difficulty, {
        resourceId: difficulty,
        playerId: res.playerId,
        sessionToken: res.sessionToken,
        nickname: res.nickname,
      });
      setPhase('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (value: number) => {
    if (!difficulty) throw new Error('No difficulty');
    const res = await api.dailyGuess(difficulty, token, value);
    setGuesses((g) => [...g, value]);
    setLastResponse(res);
    if (res.finished) {
      celebrateWin();
      setPhase('done');
    }
    return res;
  };

  const shareResult = async () => {
    if (!difficulty || !lastResponse) return;
    const text = `Guessify Daily ${difficultyLabel}: ${guesses.length} guesses in ${formatTime(lastResponse.elapsedMs ?? 0)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!difficulty) {
    navigate('/daily');
    return null;
  }

  if (phase === 'info') {
    return (
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Daily Puzzle"
          subtitle={info ? `${difficultyLabel} · ${info.date}` : 'Getting today\'s puzzle ready'}
        />

        <div className="glass-card p-8 space-y-6 text-center">
          {infoLoading ? (
            <LoadingSpinner label="Loading today's puzzle" />
          ) : info?.alreadyPlayed ? (
            <>
              <div className="text-5xl">✅</div>
              <p className="text-ink-muted">You already finished today's {difficultyLabel} puzzle.</p>
              <Button variant="secondary" onClick={() => navigate('/daily')}>
                Try another level
              </Button>
            </>
          ) : (
            <>
              <p className="text-ink-muted leading-relaxed">
                Everyone gets the same number today.
                <br />
                Range: <span className="font-semibold text-ink">{rangeLabel}</span>
              </p>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname"
                maxLength={20}
                className="input-field text-lg"
                onKeyDown={(e) => e.key === 'Enter' && !loading && start()}
              />
              {error && <p className="text-danger text-sm">{error}</p>}
              <Button size="xl" className="w-full" onClick={start} loading={loading} disabled={infoLoading}>
                Play Today's Puzzle
              </Button>
              <Button variant="ghost" onClick={() => navigate('/daily')}>
                Change level
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'done' && lastResponse) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <PageHeader
            title="Daily Complete!"
            subtitle={`${guesses.length} guesses · ${formatTime(lastResponse.elapsedMs ?? 0)}`}
          />
        </motion.div>
        <div className="glass-card p-8 space-y-4">
          <div className="font-display text-5xl font-bold gradient-text">{guesses.length}</div>
          <p className="text-ink-muted">guesses today</p>
          <Button size="lg" onClick={shareResult}>
            {copied ? 'Copied!' : 'Copy Result to Share'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            New Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Daily Puzzle" subtitle={`${difficultyLabel} · ${info?.date ?? ''}`} />
      <GameBoard
        difficulty={difficulty}
        guesses={guesses}
        lastResponse={lastResponse}
        onGuess={handleGuess}
      />
    </div>
  );
}
