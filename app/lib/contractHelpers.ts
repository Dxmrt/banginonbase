// Contract Helper Functions for BanginOnBase
import { encodeFunctionData, type Address } from 'viem';
import { BANGINONBASE_CONTRACT_CONFIG } from '@/lib/contracts';
import { getTodayIndex, getTodaySong } from '@/data/songs';

// Generate transaction call data for submitting a guess
export function generateGuessTransactionCalls(guess: string, userAddress: Address) {
  const dayIndex = getTodayIndex();
  
  return [
    {
      to: BANGINONBASE_CONTRACT_CONFIG.address,
      data: encodeFunctionData({
        abi: BANGINONBASE_CONTRACT_CONFIG.abi,
        functionName: 'submitGuess',
        args: [guess.trim(), BigInt(dayIndex)]
      }),
    }
  ];
}

// Parse transaction receipt to extract guess result
export function parseGuessResult(receipt: any, guess: string) {
  // In a real implementation, this would parse the GuessSubmitted event from the transaction logs
  // For now, we'll use the existing game logic as a fallback
  
  const todaySong = getTodaySong();
  const isCorrect = isAnswerCorrect(guess, todaySong.title);
  const pointsEarned = isCorrect ? 5 : 0;
  
  return {
    correct: isCorrect,
    message: isCorrect 
      ? `🎉 CORRECT ON-CHAIN! You earned ${pointsEarned} points! The song was "${todaySong.title}" by ${todaySong.artist}!`
      : `❌ Not quite! The correct answer was "${todaySong.title}" by ${todaySong.artist}. Your guess is recorded on-chain!`,
    pointsEarned,
    todaysSong: todaySong,
    transactionHash: receipt?.transactionHash
  };
}

// Check if answer is correct (same logic as existing game)
function isAnswerCorrect(userGuess: string, correctAnswer: string): boolean {
  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

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

// Format transaction status messages
export function getTransactionStatusMessage(statusName: string): string {
  switch (statusName) {
    case 'init':
      return '🎵 Ready to submit your guess on-chain!';
    case 'buildingTransaction':
      return '🔨 Building your on-chain transaction...';
    case 'transactionPending':
      return '⏳ Your guess is being recorded on Base...';
    case 'success':
      return '✅ Your guess has been recorded on-chain!';
    case 'error':
      return '❌ Transaction failed. Please try again!';
    default:
      return '🎵 Processing...';
  }
}

// Mock contract read functions (in production these would be real contract calls)
export async function readContractPlayerScore(playerAddress: Address): Promise<number> {
  // This would be a real contract read in production
  // For now, return from localStorage as fallback
  try {
    const scores = JSON.parse(localStorage.getItem('banginonbase_scores') || '{}');
    return scores[playerAddress]?.score || 0;
  } catch {
    return 0;
  }
}

export async function readContractHasGuessedToday(playerAddress: Address): Promise<boolean> {
  // This would be a real contract read in production
  // For now, return from localStorage as fallback
  try {
    const scores = JSON.parse(localStorage.getItem('banginonbase_scores') || '{}');
    const playerScore = scores[playerAddress];
    const currentDay = getTodayIndex();
    return playerScore?.lastGuessDay === currentDay;
  } catch {
    return false;
  }
}

export async function readContractLeaderboard(limit: number = 10): Promise<{ address: Address; score: number; rank: number }[]> {
  // This would be a real contract read in production
  // For now, return from localStorage as fallback
  try {
    const scores = JSON.parse(localStorage.getItem('banginonbase_scores') || '{}');
    return Object.values(scores)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)
      .map((player: any, index: number) => ({
        address: player.address,
        score: player.score,
        rank: index + 1
      }));
  } catch {
    return [];
  }
}

// Contract deployment configuration
export const CONTRACT_DEPLOYMENT_CONFIG = {
  // In production, this would contain the deployment parameters
  constructorArgs: {
    startTimestamp: Math.floor(Date.now() / 1000), // Current timestamp
    pointsPerCorrectGuess: 5,
    songsData: [], // Would contain encoded song data
  },
  gasLimit: 3000000,
  gasPrice: '20000000000', // 20 gwei
};