export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED';
export type GuessResult = 'HIGHER' | 'LOWER' | 'CORRECT';
export type Warmth = 'COLD' | 'WARM' | 'HOT' | 'CORRECT';

export interface DifficultyInfo {
  key: Difficulty;
  label: string;
  range: string;
  min: number;
  max: number;
  description: string;
}

export const DIFFICULTIES: DifficultyInfo[] = [
  { key: 'EASY', label: 'Easy', range: '1–100', min: 1, max: 100, description: 'Quick & casual' },
  { key: 'MEDIUM', label: 'Medium', range: '1–500', min: 1, max: 500, description: 'Balanced challenge' },
  { key: 'HARD', label: 'Hard', range: '1–1000', min: 1, max: 1000, description: 'For the bold' },
];

export interface PlayerSummary {
  id: string;
  nickname: string;
  guessCount: number;
  finished: boolean;
  elapsedMs: number | null;
  rank: number | null;
}

export interface RoomResponse {
  code: string;
  difficulty: Difficulty;
  status: RoomStatus;
  round: number;
  hostPlayerId: string;
  players: PlayerSummary[];
  joinUrl: string;
  canStart: boolean;
  maxPlayers: number;
}

export interface GuessResponse {
  result: GuessResult;
  warmth: Warmth;
  guessCount: number;
  finished: boolean;
  elapsedMs: number | null;
  secretNumber: number | null;
}

export interface LeaderboardEntry {
  nickname: string;
  guessCount: number;
  elapsedMs: number;
  rank: number;
  isWinner: boolean;
}

export interface GameResultResponse {
  leaderboard: LeaderboardEntry[];
  secretNumber: number;
  allFinished: boolean;
}

export interface ChallengeInfo {
  code: string;
  difficulty: Difficulty;
  creatorNickname: string;
  creatorGuesses: number;
  creatorTimeMs: number;
  challengeUrl: string;
  attemptCount: number;
}

export interface DailyInfo {
  difficulty: Difficulty;
  date: string;
  alreadyPlayed: boolean;
  minRange: number;
  maxRange: number;
}

export interface ApiError {
  code: string;
  message: string;
}
