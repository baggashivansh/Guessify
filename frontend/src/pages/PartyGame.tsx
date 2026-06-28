import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { GameBoard } from '../components/GameBoard';
import { api } from '../api/client';
import type { GuessResponse, PlayerSummary, RoomResponse } from '../types';
import { celebrateWin } from '../utils/sound';
import { usePartySessionGuard } from '../hooks/useSessionGuard';

export function PartyGame() {
  const guard = usePartySessionGuard('lobby');
  const navigate = useNavigate();
  const code = guard?.code;
  const session = guard?.session;
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [lastResponse, setLastResponse] = useState<GuessResponse | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!session || !code) return;
    const poll = async () => {
      const data = await api.getRoom(code!);
      setRoom(data);
      if (data.status === 'FINISHED') {
        navigate(`/party/${code}/results`);
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [code, session]);

  const handleGuess = async (value: number) => {
    if (!session || !code) throw new Error('No session');
    const res = await api.partyGuess(code, session.playerId, session.sessionToken, value);
    setGuesses((g) => [...g, value]);
    setLastResponse(res);
    if (res.finished) {
      setFinished(true);
      celebrateWin();
      setTimeout(() => navigate(`/party/${code}/results`), 2000);
    }
    return res;
  };

  if (!session) return null;

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Party Game"
        subtitle={room ? `Round ${room.round} · ${room.difficulty}` : ''}
      />

      {room && (
        <div className="glass-card p-4 mb-6">
          <div className="text-ink-muted text-sm mb-2 font-medium">Live standings</div>
          <div className="space-y-1.5">
            {[...room.players]
              .sort((a, b) => a.guessCount - b.guessCount)
              .map((p: PlayerSummary) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className={p.id === session.playerId ? 'text-accent font-semibold' : 'text-ink'}>
                    {p.nickname} {p.finished && '✓'}
                  </span>
                  <span className="text-ink-muted">{p.guessCount} guesses</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <GameBoard
        difficulty={room?.difficulty ?? 'EASY'}
        guesses={guesses}
        lastResponse={lastResponse}
        onGuess={handleGuess}
        disabled={finished}
        large
      />
    </div>
  );
}
