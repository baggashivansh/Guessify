import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/Layout';
import { Button } from '../components/Button';
import { DifficultyPicker } from '../components/DifficultyPicker';
import type { Difficulty } from '../types';
import { api } from '../api/client';
import { getSavedNickname, saveNickname, savePartySession } from '../utils/storage';

export function PartyCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState(getSavedNickname());
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const continueToDifficulty = () => {
    if (!nickname.trim()) {
      setError('Enter your nickname');
      return;
    }
    setError('');
    saveNickname(nickname.trim());
    setStep(2);
  };

  const create = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.createRoom(nickname.trim(), difficulty);
      savePartySession({
        code: res.code,
        playerId: res.playerId,
        sessionToken: res.sessionToken,
        nickname: res.nickname,
      });
      navigate(`/party/${res.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Party Mode"
        subtitle={step === 1 ? 'Enter your nickname' : 'Choose your range'}
      />

      <div className="glass-card p-8 space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm text-ink-muted mb-2 font-medium">Your nickname</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter nickname"
                  maxLength={20}
                  className="input-field text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && continueToDifficulty()}
                />
              </div>
              {error && <p className="text-danger text-sm text-center">{error}</p>}
              <Button size="xl" className="w-full" onClick={continueToDifficulty}>
                Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
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
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" className="flex-1" onClick={create} loading={loading}>
                  Create Room
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
