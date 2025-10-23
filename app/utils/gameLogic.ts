import type { Song, PlayerScore, GuessResult, LeaderboardEntry, Achievement, PlayerStats, DetailedStats } from '@/types/game';
import { getTodayIndex, getTodaySong, CONTRACT_CONFIG } from '@/data/songs';
import { batchResolveFarcasterUsernames, getFarcasterUser } from '@/services/farcasterService';

// Local storage keys
const SCORES_KEY = 'banginonbase_scores';
const LAST_GUESS_KEY = 'banginonbase_last_guess';
const STATS_KEY = 'banginonbase_stats';
const ACHIEVEMENTS_KEY = 'banginonbase_achievements';
const DETAILED_STATS_KEY = 'banginonbase_detailed_stats';

// Normalize answer for comparison (remove special chars, lowercase, etc.)
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if two strings match (handles various title formats)
function isAnswerCorrect(userGuess: string, correctAnswer: string): boolean {
  const normalizedGuess = normalizeAnswer(userGuess);
  const normalizedAnswer = normalizeAnswer(correctAnswer);
  
  // Direct match
  if (normalizedGuess === normalizedAnswer) return true;
  
  // Check if guess contains the answer or vice versa
  if (normalizedGuess.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedGuess)) {
    return true;
  }
  
  // Remove common words and check again
  const removeCommonWords = (str: string) => 
    str.replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, '').replace(/\s+/g, ' ').trim();
  
  const cleanGuess = removeCommonWords(normalizedGuess);
  const cleanAnswer = removeCommonWords(normalizedAnswer);
  
  return cleanGuess === cleanAnswer || cleanGuess.includes(cleanAnswer) || cleanAnswer.includes(cleanGuess);
}

// Get current day index for guess tracking
function getCurrentDay(): number {
  return getTodayIndex();
}

// Load player scores from localStorage
function loadScores(): Record<string, PlayerScore> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(SCORES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save player scores to localStorage
function saveScores(scores: Record<string, PlayerScore>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error('Failed to save scores:', error);
  }
}

// Check if player has already guessed today
export function hasGuessedToday(playerAddress: string): boolean {
  const scores = loadScores();
  const playerScore = scores[playerAddress];
  const currentDay = getCurrentDay();
  
  return playerScore?.lastGuessDay === currentDay;
}

// Submit a guess and return the result
export function submitGuess(playerAddress: string, guess: string): GuessResult {
  const currentDay = getCurrentDay();
  const todaySong = getTodaySong();
  
  // Check if already guessed today
  if (hasGuessedToday(playerAddress)) {
    return {
      correct: false,
      message: "You've already guessed today! Come back tomorrow for a new song! 🎵",
      pointsEarned: 0,
      todaysSong: todaySong
    };
  }
  
  // Check if answer is correct
  const isCorrect = isAnswerCorrect(guess, todaySong.title);
  
  // Load current scores
  const scores = loadScores();
  
  // Update player score
  if (!scores[playerAddress]) {
    scores[playerAddress] = {
      address: playerAddress,
      score: 0,
      lastGuessDay: -1
    };
  }
  
  const pointsEarned = isCorrect ? CONTRACT_CONFIG.POINTS_PER_CORRECT_GUESS : 0;
  scores[playerAddress].lastGuessDay = currentDay;
  scores[playerAddress].score += pointsEarned;
  
  // Save updated scores
  saveScores(scores);
  
  return {
    correct: isCorrect,
    message: isCorrect 
      ? `🎉 CORRECT! You earned ${pointsEarned} points! The song was "${todaySong.title}" by ${todaySong.artist}!`
      : `❌ Not quite! The correct answer was "${todaySong.title}" by ${todaySong.artist}. Better luck tomorrow!`,
    pointsEarned,
    todaysSong: todaySong
  };
}

// Get leaderboard (basic version without usernames)
export function getLeaderboard(limit: number = 10): LeaderboardEntry[] {
  const scores = loadScores();
  
  return Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((player, index) => ({
      address: player.address,
      score: player.score,
      rank: index + 1
    }));
}

// Get leaderboard with Farcaster usernames
export async function getLeaderboardWithUsernames(limit: number = 10): Promise<LeaderboardEntry[]> {
  const scores = loadScores();
  
  const basicLeaderboard = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((player, index) => ({
      address: player.address,
      score: player.score,
      rank: index + 1
    }));
  
  // Get all addresses for batch username resolution
  const addresses = basicLeaderboard.map(entry => entry.address);
  
  try {
    // Batch resolve usernames
    const usernames = await batchResolveFarcasterUsernames(addresses);
    
    // Enhance leaderboard with username data
    const enhancedLeaderboard = await Promise.all(
      basicLeaderboard.map(async (entry) => {
        const username = usernames[entry.address];
        
        // If we have a Farcaster username, get full user info
        let displayName: string | undefined;
        let avatar: string | undefined;
        
        if (username && username.startsWith('@')) {
          try {
            const userInfo = await getFarcasterUser(entry.address);
            if (userInfo) {
              displayName = userInfo.displayName;
              avatar = userInfo.avatar;
            }
          } catch (error) {
            console.error('Failed to get user info:', error);
          }
        }
        
        return {
          ...entry,
          username,
          displayName,
          avatar
        };
      })
    );
    
    return enhancedLeaderboard;
  } catch (error) {
    console.error('Failed to resolve usernames:', error);
    // Return basic leaderboard with formatted addresses as fallback
    return basicLeaderboard.map(entry => ({
      ...entry,
      username: formatAddress(entry.address)
    }));
  }
}

// Get player's current score
export function getPlayerScore(playerAddress: string): number {
  const scores = loadScores();
  return scores[playerAddress]?.score || 0;
}

// Format wallet address for display
export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Enhanced stats tracking
export function getPlayerStats(playerAddress: string): PlayerStats {
  if (typeof window === 'undefined') {
    return {
      totalScore: 0,
      totalGuesses: 0,
      correctGuesses: 0,
      currentStreak: 0,
      longestStreak: 0,
      daysPlayed: 0,
      perfectWeeks: 0,
      achievementsUnlocked: 0,
      earlyBirdPlays: 0
    };
  }

  try {
    const stored = localStorage.getItem(`${STATS_KEY}_${playerAddress}`);
    if (!stored) {
      return {
        totalScore: 0,
        totalGuesses: 0,
        correctGuesses: 0,
        currentStreak: 0,
        longestStreak: 0,
        daysPlayed: 0,
        perfectWeeks: 0,
        achievementsUnlocked: 0,
        earlyBirdPlays: 0
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      totalScore: 0,
      totalGuesses: 0,
      correctGuesses: 0,
      currentStreak: 0,
      longestStreak: 0,
      daysPlayed: 0,
      perfectWeeks: 0,
      achievementsUnlocked: 0,
      earlyBirdPlays: 0
    };
  }
}

// Update player stats
export function updatePlayerStats(playerAddress: string, isCorrect: boolean): void {
  if (typeof window === 'undefined') return;

  const stats = getPlayerStats(playerAddress);
  const scores = loadScores();
  const playerScore = scores[playerAddress];

  // Update basic stats
  stats.totalScore = playerScore?.score || 0;
  stats.totalGuesses += 1;
  if (isCorrect) {
    stats.correctGuesses += 1;
    stats.currentStreak += 1;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  // Check if this is their first play today
  const today = new Date().toDateString();
  const lastPlayDate = localStorage.getItem(`${playerAddress}_last_play_date`);
  if (lastPlayDate !== today) {
    stats.daysPlayed += 1;
    localStorage.setItem(`${playerAddress}_last_play_date`, today);
    
    // Check for early bird (within 1 hour of midnight UTC)
    const now = new Date();
    const utcHour = now.getUTCHours();
    if (utcHour === 0) {
      stats.earlyBirdPlays += 1;
    }
  }

  // Check for perfect weeks (7 consecutive correct guesses)
  if (stats.currentStreak >= 7 && stats.currentStreak % 7 === 0) {
    stats.perfectWeeks += 1;
  }

  // Save updated stats
  try {
    localStorage.setItem(`${STATS_KEY}_${playerAddress}`, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

// Get detailed analytics
export function getDetailedStats(playerAddress: string): DetailedStats {
  if (typeof window === 'undefined') {
    return {
      recentPerformance: [],
      bestDecade: '80s',
      hardestGenre: 'Synth-Pop',
      bestPlayTime: 'Evening',
      playTimeHeatmap: Array.from({ length: 24 }, (_, i) => ({ hour: i, plays: 0, intensity: 0 }))
    };
  }

  try {
    const stored = localStorage.getItem(`${DETAILED_STATS_KEY}_${playerAddress}`);
    if (!stored) {
      // Generate sample data for demo
      return {
        recentPerformance: [
          { correct: true, points: 5, date: '2024-01-01' },
          { correct: false, points: 0, date: '2024-01-02' },
          { correct: true, points: 5, date: '2024-01-03' },
          { correct: true, points: 5, date: '2024-01-04' },
          { correct: false, points: 0, date: '2024-01-05' },
          { correct: true, points: 5, date: '2024-01-06' },
          { correct: true, points: 5, date: '2024-01-07' }
        ],
        bestDecade: '80s',
        hardestGenre: 'New Wave',
        bestPlayTime: 'Evening',
        playTimeHeatmap: Array.from({ length: 24 }, (_, i) => ({ 
          hour: i, 
          plays: Math.random() * 10, 
          intensity: i >= 18 && i <= 22 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3
        }))
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      recentPerformance: [],
      bestDecade: '80s',
      hardestGenre: 'Synth-Pop',
      bestPlayTime: 'Evening',
      playTimeHeatmap: Array.from({ length: 24 }, (_, i) => ({ hour: i, plays: 0, intensity: 0 }))
    };
  }
}

// Achievement system
export function unlockAchievement(playerAddress: string, achievement: Achievement): void {
  if (typeof window === 'undefined') return;

  try {
    const stats = getPlayerStats(playerAddress);
    const unlockedKey = `${ACHIEVEMENTS_KEY}_${playerAddress}`;
    const unlocked = JSON.parse(localStorage.getItem(unlockedKey) || '[]');
    
    if (!unlocked.some((a: Achievement) => a.id === achievement.id)) {
      unlocked.push(achievement);
      localStorage.setItem(unlockedKey, JSON.stringify(unlocked));
      
      // Update achievement count in stats
      stats.achievementsUnlocked = unlocked.length;
      stats.unlockedAchievements = unlocked;
      localStorage.setItem(`${STATS_KEY}_${playerAddress}`, JSON.stringify(stats));
    }
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
  }
}