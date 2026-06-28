import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { QrShare } from '../components/QrShare';
import { api } from '../api/client';
import type { RoomResponse } from '../types';
import {
  copyToClipboard,
  getPartySession,
  getSavedNickname,
  saveNickname,
  savePartySession,
  shareUrl,
} from '../utils/storage';
import { buildAppUrl } from '../utils/validation';
import { useInvalidCodeRedirect } from '../hooks/useSessionGuard';

export function PartyRoom() {
  const code = useInvalidCodeRedirect();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [nickname, setNickname] = useState(getSavedNickname());
  const [session, setSession] = useState(getPartySession(code!));
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const joinUrl = code ? buildAppUrl(`/party/${code}`) : '';

  const fetchRoom = async () => {
    if (!code) return;
    try {
      const data = await api.getRoom(code);
      setRoom(data);
      if (data.status === 'PLAYING') {
        navigate(`/party/${code}/play`);
      } else if (data.status === 'FINISHED') {
        navigate(`/party/${code}/results`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Room not found');
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [code]);

  const join = async () => {
    if (!code || !nickname.trim()) return;
    setJoining(true);
    setError('');
    try {
      saveNickname(nickname.trim());
      const res = await api.joinRoom(code, nickname.trim());
      const s = { code, playerId: res.playerId, sessionToken: res.sessionToken, nickname: res.nickname };
      savePartySession(s);
      setSession(s);
      await fetchRoom();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const start = async () => {
    if (!code || !session) return;
    setStarting(true);
    try {
      await api.startGame(code, session.playerId, session.sessionToken);
      navigate(`/party/${code}/play`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start');
    } finally {
      setStarting(false);
    }
  };

  const copy = async () => {
    await copyToClipboard(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  if (error && !room) {
    return (
      <div className="text-center">
        <PageHeader title="Room Not Found" subtitle={error} />
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const isHost = session && room && session.playerId === room.hostPlayerId;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={`Room ${code}`}
        subtitle={room ? `${room.players.length} player${room.players.length !== 1 ? 's' : ''} · ${room.difficulty}` : 'Loading...'}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <QrShare url={joinUrl} />
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" className="flex-1" onClick={copy}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => shareUrl(joinUrl, 'Join my Guessify party!')}
            >
              Share
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {!session ? (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">Join this room</h3>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname"
                maxLength={20}
                className="input-field text-lg"
              />
              {error && <p className="text-danger text-sm">{error}</p>}
              <Button size="lg" className="w-full" onClick={join} loading={joining}>
                Join Party
              </Button>
            </div>
          ) : (
            <div className="glass-card p-4 text-center bg-green-50 border-green-200 text-success font-medium">
              Joined as <strong className="text-ink">{session.nickname}</strong>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4 text-ink">Players</h3>
            <ul className="space-y-2">
              {room?.players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border"
                >
                  <span className="text-ink font-medium">{p.nickname}</span>
                  {p.id === room.hostPlayerId && (
                    <span className="text-xs text-accent bg-accent-soft px-2.5 py-0.5 rounded-full font-semibold">
                      Host
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isHost && session && (
            <Button size="xl" className="w-full" onClick={start} loading={starting}>
              Start Game
            </Button>
          )}

          {!isHost && session && (
            <p className="text-center text-ink-muted text-sm">Waiting for host to start...</p>
          )}
        </div>
      </div>
    </div>
  );
}
