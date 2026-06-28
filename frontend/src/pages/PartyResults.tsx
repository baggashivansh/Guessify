import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { Leaderboard } from '../components/Leaderboard';
import { api } from '../api/client';
import type { GameResultResponse, RoomResponse } from '../types';
import { usePartySessionGuard } from '../hooks/useSessionGuard';
import { celebrateWin } from '../utils/sound';

export function PartyResults() {
  const guard = usePartySessionGuard('lobby');
  const navigate = useNavigate();
  const code = guard?.code;
  const session = guard?.session;
  const [results, setResults] = useState<GameResultResponse | null>(null);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [rematching, setRematching] = useState(false);

  useEffect(() => {
    if (!code || !session) return;
    api.partyResults(code, session.playerId, session.sessionToken).then(setResults);
    api.getRoom(code).then(setRoom);
    celebrateWin();
  }, [code, session]);

  const rematch = async () => {
    if (!code || !session) return;
    setRematching(true);
    try {
      await api.rematch(code, session.playerId, session.sessionToken);
      navigate(`/party/${code}/play`);
    } catch {
      setRematching(false);
    }
  };

  const isHost = session && room && session.playerId === room.hostPlayerId;

  if (!code || !session) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <PageHeader title="🎉 Game Over!" subtitle="Fewest guesses wins" />
      </motion.div>

      {results && (
        <Leaderboard entries={results.leaderboard} secretNumber={results.secretNumber} loud />
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        {isHost && (
          <Button size="xl" onClick={rematch} loading={rematching}>
            Rematch
          </Button>
        )}
        <Button size="xl" variant="secondary" onClick={() => navigate('/')}>
          Home
        </Button>
      </div>
    </div>
  );
}
