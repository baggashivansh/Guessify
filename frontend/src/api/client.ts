import type {
  ChallengeInfo,
  DailyInfo,
  Difficulty,
  GameResultResponse,
  GuessResponse,
  RoomResponse,
} from '../types';
import { getClientId } from '../utils/storage';
import { isValidDifficulty, normalizeResourceCode } from '../utils/validation';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

function assertApiPath(path: string) {
  if (!path.startsWith('/api/')) {
    throw new Error('Invalid API path');
  }
}

function friendlyFetchError(): Error {
  return new Error('Cannot reach the game server. It may be waking up. Wait 30 seconds and try again.');
}

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    assertApiPath(path);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const clientId = getClientId();
    headers['X-Client-Id'] = clientId;

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'same-origin',
        mode: 'cors',
        cache: 'no-store',
      });
    } catch {
      throw friendlyFetchError();
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
      const message = error.message ?? 'Something went wrong';
      if (response.status === 403 && message.toLowerCase().includes('origin')) {
        throw new Error('Server blocked this site. Add your Vercel URL to CORS on Render.');
      }
      throw new Error(message);
    }

    return response.json();
  }

  private normalizeCode(code: string): string {
    const normalized = normalizeResourceCode(code);
    if (!normalized) {
      throw new Error('Invalid room or challenge code');
    }
    return normalized;
  }

  private normalizeDifficulty(difficulty: Difficulty): Difficulty {
    if (!isValidDifficulty(difficulty)) {
      throw new Error('Invalid difficulty');
    }
    return difficulty;
  }

  // Party
  createRoom(nickname: string, difficulty: Difficulty) {
    return this.request<{
      code: string;
      playerId: string;
      sessionToken: string;
      nickname: string;
      joinUrl: string;
    }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ nickname: nickname.trim(), difficulty }),
    });
  }

  getRoom(code: string) {
    return this.request<RoomResponse>(`/api/rooms/${this.normalizeCode(code)}`);
  }

  joinRoom(code: string, nickname: string) {
    const normalized = this.normalizeCode(code);
    return this.request<{ playerId: string; sessionToken: string; nickname: string }>(
      `/api/rooms/${normalized}/join`,
      { method: 'POST', body: JSON.stringify({ nickname: nickname.trim() }) }
    );
  }

  startGame(code: string, playerId: string, token: string) {
    const normalized = this.normalizeCode(code);
    return this.request<RoomResponse>(`/api/rooms/${normalized}/start`, {
      method: 'POST',
      headers: { 'X-Player-Id': playerId, 'X-Player-Token': token },
    });
  }

  partyGuess(code: string, playerId: string, token: string, value: number) {
    const normalized = this.normalizeCode(code);
    if (!Number.isInteger(value)) throw new Error('Invalid guess');
    return this.request<GuessResponse>(`/api/rooms/${normalized}/guess`, {
      method: 'POST',
      headers: { 'X-Player-Id': playerId, 'X-Player-Token': token },
      body: JSON.stringify({ value }),
    });
  }

  partyResults(code: string, playerId: string, token: string) {
    const normalized = this.normalizeCode(code);
    return this.request<GameResultResponse>(`/api/rooms/${normalized}/results`, {
      headers: { 'X-Player-Id': playerId, 'X-Player-Token': token },
    });
  }

  rematch(code: string, playerId: string, token: string) {
    const normalized = this.normalizeCode(code);
    return this.request<RoomResponse>(`/api/rooms/${normalized}/rematch`, {
      method: 'POST',
      headers: { 'X-Player-Id': playerId, 'X-Player-Token': token },
    });
  }

  // Solo / Challenge
  startSolo(nickname: string, difficulty: Difficulty) {
    return this.request<{ playerId: string; sessionToken: string; nickname: string }>(
      '/api/solo/start',
      { method: 'POST', body: JSON.stringify({ nickname: nickname.trim(), difficulty }) }
    );
  }

  soloGuess(token: string, value: number) {
    if (!Number.isInteger(value)) throw new Error('Invalid guess');
    return this.request<GuessResponse>('/api/solo/guess', {
      method: 'POST',
      headers: { 'X-Player-Token': token },
      body: JSON.stringify({ value }),
    });
  }

  createChallengeFromSolo(sessionToken: string) {
    return this.request<{ code: string; challengeUrl: string }>('/api/solo/challenge', {
      method: 'POST',
      headers: { 'X-Player-Token': sessionToken },
    });
  }

  getChallenge(code: string) {
    return this.request<ChallengeInfo>(`/api/challenges/${this.normalizeCode(code)}`);
  }

  startChallenge(code: string, nickname: string) {
    const normalized = this.normalizeCode(code);
    return this.request<{ playerId: string; sessionToken: string; nickname: string }>(
      `/api/challenges/${normalized}/start`,
      { method: 'POST', body: JSON.stringify({ nickname: nickname.trim() }) }
    );
  }

  challengeGuess(code: string, token: string, value: number) {
    const normalized = this.normalizeCode(code);
    if (!Number.isInteger(value)) throw new Error('Invalid guess');
    return this.request<GuessResponse>(`/api/challenges/${normalized}/guess`, {
      method: 'POST',
      headers: { 'X-Player-Token': token },
      body: JSON.stringify({ value }),
    });
  }

  challengeResult(code: string, token: string) {
    const normalized = this.normalizeCode(code);
    return this.request<GameResultResponse>(`/api/challenges/${normalized}/result`, {
      headers: { 'X-Player-Token': token },
    });
  }

  // Daily
  getDailyInfo(difficulty: Difficulty) {
    const d = this.normalizeDifficulty(difficulty);
    return this.request<DailyInfo>(`/api/daily/${d}`);
  }

  startDaily(difficulty: Difficulty, nickname: string) {
    const d = this.normalizeDifficulty(difficulty);
    return this.request<{ playerId: string; sessionToken: string; nickname: string }>(
      `/api/daily/${d}/start`,
      { method: 'POST', body: JSON.stringify({ nickname: nickname.trim() }) }
    );
  }

  dailyGuess(difficulty: Difficulty, token: string, value: number) {
    const d = this.normalizeDifficulty(difficulty);
    if (!Number.isInteger(value)) throw new Error('Invalid guess');
    return this.request<GuessResponse>(`/api/daily/${d}/guess`, {
      method: 'POST',
      headers: { 'X-Player-Token': token },
      body: JSON.stringify({ value }),
    });
  }
}

export const api = new ApiClient();
