import type { Difficulty } from '../types';
import { buildAppUrl, normalizeResourceCode } from './validation';

const CLIENT_ID_KEY = 'guessify_client_id';
const NICKNAME_KEY = 'guessify_nickname';

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getSavedNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) ?? '';
}

export function saveNickname(nickname: string) {
  localStorage.setItem(NICKNAME_KEY, nickname.trim());
}

export interface PartySession {
  code: string;
  playerId: string;
  sessionToken: string;
  nickname: string;
}

export function savePartySession(session: PartySession) {
  const code = normalizeResourceCode(session.code);
  if (!code) return;
  sessionStorage.setItem(`guessify_party_${code}`, JSON.stringify({ ...session, code }));
}

export function getPartySession(code: string): PartySession | null {
  const normalized = normalizeResourceCode(code);
  if (!normalized) return null;
  const raw = sessionStorage.getItem(`guessify_party_${normalized}`);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as PartySession;
    if (session.code !== normalized) {
      clearPartySession(normalized);
      return null;
    }
    return session;
  } catch {
    clearPartySession(normalized);
    return null;
  }
}

export function clearPartySession(code: string) {
  const normalized = normalizeResourceCode(code);
  if (normalized) {
    sessionStorage.removeItem(`guessify_party_${normalized}`);
  }
}

export interface GameSession {
  resourceId: string;
  playerId: string;
  sessionToken: string;
  nickname: string;
}

export function saveGameSession(scope: string, session: GameSession) {
  sessionStorage.setItem(`guessify_${scope}_${session.resourceId}`, JSON.stringify(session));
}

export function getGameSession(scope: string, resourceId: string): GameSession | null {
  const raw = sessionStorage.getItem(`guessify_${scope}_${resourceId}`);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as GameSession;
    if (session.resourceId !== resourceId) {
      clearGameSession(scope, resourceId);
      return null;
    }
    return session;
  } catch {
    clearGameSession(scope, resourceId);
    return null;
  }
}

export function clearGameSession(scope: string, resourceId: string) {
  sessionStorage.removeItem(`guessify_${scope}_${resourceId}`);
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function shareUrl(url: string, title: string) {
  const safe = url.startsWith(window.location.origin)
    ? url
    : buildAppUrl(new URL(url, window.location.origin).pathname);
  if (navigator.share) {
    return navigator.share({ title, url: safe });
  }
  return copyToClipboard(safe);
}

export function saveSoloSession(token: string, nickname: string) {
  saveGameSession('solo', { resourceId: 'solo', playerId: token, sessionToken: token, nickname });
}

export function getSoloSession(): GameSession | null {
  return getGameSession('solo', 'solo');
}

export function saveChallengeSession(code: string, session: GameSession) {
  const normalized = normalizeResourceCode(code);
  if (!normalized) return;
  saveGameSession('challenge', { ...session, resourceId: normalized });
}

export function getChallengeSession(code: string): GameSession | null {
  const normalized = normalizeResourceCode(code);
  if (!normalized) return null;
  return getGameSession('challenge', normalized);
}

export function saveDailySession(difficulty: Difficulty, session: GameSession) {
  saveGameSession('daily', { ...session, resourceId: difficulty });
}

export function getDailySession(difficulty: Difficulty): GameSession | null {
  return getGameSession('daily', difficulty);
}
