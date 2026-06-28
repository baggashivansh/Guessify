import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { DifficultyPicker } from '../components/DifficultyPicker';
import type { Difficulty } from '../types';
import { api } from '../api/client';
import { getSavedNickname, saveNickname, savePartySession } from '../utils/storage';

export function PartyCreate() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(getSavedNickname());
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    if (!nickname.trim()) {
      setError('Enter your nickname');
      return;
    }
    setLoading(true);
    setError('');
    try {
      saveNickname(nickname.trim());
      const res = await api.createRoom(nickname.trim(), difficulty);
      savePartySession({
        code: res.code,
        playerId: res.playerId,
        sessionToken: res.sessionToken,
        nickname: res.nickname,
      });
      navigate(`/party/${res.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Party Mode" subtitle="Create a room and invite your friends" />

      <div className="glass-card p-8 space-y-6">
        <div>
          <label className="block text-sm text-ink-muted mb-2 font-medium">Your nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname"
            maxLength={20}
            className="input-field text-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-ink-muted mb-3 font-medium">Difficulty</label>
          <DifficultyPicker value={difficulty} onChange={setDifficulty} large />
        </div>

        {error && <p className="text-danger text-sm text-center">{error}</p>}

        <Button size="xl" className="w-full" onClick={create} loading={loading}>
          Create Party Room
        </Button>
      </div>
    </div>
  );
}
