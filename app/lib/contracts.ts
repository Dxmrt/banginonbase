// Smart Contract Types for BanginOnBase Game
import type { Address } from 'viem';

// Smart Contract ABI for the BanginOnBase game contract
export const BANGINONBASE_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'submitGuess',
    inputs: [
      { name: '_guess', type: 'string' },
      { name: '_dayIndex', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPlayerScore',
    inputs: [{ name: '_player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasGuessedToday',
    inputs: [
      { name: '_player', type: 'address' },
      { name: '_dayIndex', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTodaysSong',
    inputs: [{ name: '_dayIndex', type: 'uint256' }],
    outputs: [
      { name: 'title', type: 'string' },
      { name: 'artist', type: 'string' },
      { name: 'emoji', type: 'string' },
      { name: 'lyric', type: 'string' },
      { name: 'trivia', type: 'string' }
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLeaderboard',
    inputs: [{ name: '_limit', type: 'uint256' }],
    outputs: [
      { name: 'players', type: 'address[]' },
      { name: 'scores', type: 'uint256[]' }
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'GuessSubmitted',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'dayIndex', type: 'uint256', indexed: true },
      { name: 'guess', type: 'string', indexed: false },
      { name: 'isCorrect', type: 'bool', indexed: false },
      { name: 'pointsEarned', type: 'uint256', indexed: false }
    ]
  }
] as const;

// Contract Configuration
export const BANGINONBASE_CONTRACT_CONFIG = {
  // This would be the deployed contract address on Base Mainnet
  // For now, we'll use a placeholder - in production, this would be the real deployed address
  address: '0x3f9B873aC41E33054e6aF55221aA0e5aFf8d72EC' as Address,
  abi: BANGINONBASE_CONTRACT_ABI,
  chainId: 8453, // Base Mainnet
} as const;

// Transaction Types
export interface GuessTransactionData {
  guess: string;
  dayIndex: number;
}

export interface GuessResult {
  correct: boolean;
  message: string;
  pointsEarned: number;
  todaysSong: {
    title: string;
    artist: string;
    emoji: string;
    lyric: string;
    trivia: string;
  };
  transactionHash?: string;
}