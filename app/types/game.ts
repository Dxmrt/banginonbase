// Game types for BanginOnBase
export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  hints: {
    emoji: string;
    lyric: string;
    trivia: string;
  };
}

export interface PlayerScore {
  address: string;
  score: number;
  lastGuessDay: number;
}

export interface GuessResult {
  correct: boolean;
  message: string;
  pointsEarned: number;
  todaysSong?: Song;
  transactionHash?: string; // For on-chain transactions
}

export interface LeaderboardEntry {
  address: string;
  score: number;
  rank: number;
  username?: string;
  displayName?: string;
  avatar?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: string;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerStats {
  totalScore: number;
  totalGuesses: number;
  correctGuesses: number;
  currentStreak: number;
  longestStreak: number;
  daysPlayed: number;
  perfectWeeks: number;
  achievementsUnlocked: number;
  globalRank?: number;
  earlyBirdPlays: number;
  unlockedAchievements?: Achievement[];
}

export interface DetailedStats {
  recentPerformance: Array<{ correct: boolean; points: number; date: string }>;
  bestDecade: string;
  hardestGenre: string;
  bestPlayTime: string;
  playTimeHeatmap: Array<{ hour: number; plays: number; intensity: number }>;
}