'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTodaySong, getTodayClues } from '@/data/songs';
import { hasGuessedToday, getPlayerScore, updatePlayerStats } from '@/utils/gameLogic';
import { readContractPlayerScore, readContractHasGuessedToday } from '@/lib/contractHelpers';
import { TransactionGuess } from './TransactionGuess';
import type { Song, GuessResult } from '@/types/game';
import { useAccount } from 'wagmi';

interface CassettePlayerProps {
  onGuessResult: (result: GuessResult) => void;
}

export function CassettePlayer({ onGuessResult }: CassettePlayerProps) {
  const { address, isConnected } = useAccount();
  const [todaySong, setTodaySong] = useState<Song | null>(null);
  const [hints, setHints] = useState<{ emoji: string; lyric: string; trivia: string } | null>(null);
  const [alreadyGuessed, setAlreadyGuessed] = useState<boolean>(false);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load today's song and hints
    const song = getTodaySong();
    const clues = getTodayClues();
    setTodaySong(song);
    setHints(clues);

    // Load player data (from contract or fallback to local storage)
    loadPlayerData();
  }, [address]);

  const loadPlayerData = async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try to read from contract first, fallback to local storage
      const [score, hasGuessed] = await Promise.all([
        readContractPlayerScore(address).catch(() => getPlayerScore(address)),
        readContractHasGuessedToday(address).catch(() => hasGuessedToday(address))
      ]);

      setPlayerScore(score);
      setAlreadyGuessed(hasGuessed);
    } catch (error) {
      console.error('Error loading player data:', error);
      // Fallback to local storage
      setPlayerScore(getPlayerScore(address));
      setAlreadyGuessed(hasGuessedToday(address));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuessResult = async (result: GuessResult): Promise<void> => {
    // FIXED: Properly update leaderboard and local storage
    if (address && result.transactionHash) {
      // Directly update localStorage scores for leaderboard
      const scores = JSON.parse(localStorage.getItem('banginonbase_scores') || '{}');
      const currentDay = Math.floor((Date.now() / 1000 - 1706745600) / 86400) % 40;
      
      if (!scores[address]) {
        scores[address] = {
          address: address,
          score: 0,
          lastGuessDay: -1
        };
      }
      
      // Update score and guess day
      scores[address].lastGuessDay = currentDay;
      if (result.correct) {
        scores[address].score += result.pointsEarned || 5;
      }
      
      // Save updated scores
      localStorage.setItem('banginonbase_scores', JSON.stringify(scores));
      console.log('🎵 Leaderboard updated:', scores[address]);
      
      // Also update player stats for achievements
      updatePlayerStats(address, result.correct);
      
      // Reload player data after successful transaction
      await loadPlayerData();
    }
    
    // Pass result to parent component
    onGuessResult(result);
  };

  if (!todaySong || !hints || isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <p className="text-pink-400 ml-3 font-mono">
          {isLoading && address ? 'Loading on-chain data...' : 'Loading today\'s track...'}
        </p>
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-pink-500 shadow-2xl shadow-pink-500/20">
      {/* Retro cassette design */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
      
      {/* Neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* MOBILE RESPONSIVE: Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-2 px-2">
            🎵 DAILY BANGIN' TRACK 🎵
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 px-2">
            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500 font-mono text-xs sm:text-sm">
              Your Score: {playerScore} pts
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500 font-mono text-xs sm:text-sm">
              Today's Challenge
            </Badge>
          </div>
        </div>

        {/* MOBILE RESPONSIVE: Cassette tape visual */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-3 sm:p-6 mb-6 sm:mb-8 border border-pink-500/30">
          {/* Mobile optimized cassette reels */}
          <div className="flex justify-center items-center gap-4 sm:gap-8 mb-4 sm:mb-6">
            {/* Left reel - smaller on mobile */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-pink-400 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 animate-spin"></div>
            </div>
            
            {/* Tape label - responsive */}
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-black px-3 py-2 sm:px-6 sm:py-3 rounded transform -rotate-1 shadow-lg min-w-0 flex-1 max-w-[200px] sm:max-w-none">
              <p className="text-xs sm:text-sm font-bold font-mono text-center">80s HITS</p>
              <p className="text-xs text-center hidden sm:block">SIDE A - TRACK ?</p>
            </div>
            
            {/* Right reel - smaller on mobile */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-cyan-400 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-spin"></div>
            </div>
          </div>

          {/* MOBILE RESPONSIVE: Hints section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
              {/* Emoji hint */}
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg p-3 sm:p-4 border border-pink-500/30">
                <h3 className="text-pink-400 font-bold mb-2 text-xs sm:text-sm">HINT #1: EMOJI</h3>
                <div className="text-2xl sm:text-3xl text-center">{hints.emoji}</div>
              </div>
              
              {/* Lyrics hint */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-3 sm:p-4 border border-cyan-500/30">
                <h3 className="text-cyan-400 font-bold mb-2 text-xs sm:text-sm">HINT #2: LYRICS</h3>
                <p className="text-white text-center italic text-xs sm:text-sm leading-relaxed">&ldquo;{hints.lyric}&rdquo;</p>
              </div>
              
              {/* Trivia hint */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-3 sm:p-4 border border-yellow-500/30">
                <h3 className="text-yellow-400 font-bold mb-2 text-xs sm:text-sm">HINT #3: TRIVIA</h3>
                <p className="text-white text-center text-xs sm:text-sm leading-relaxed">{hints.trivia}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction-based Guess Input */}
        <div className="space-y-4">
          <TransactionGuess
            onGuessResult={handleGuessResult}
            playerScore={playerScore}
            alreadyGuessed={alreadyGuessed}
            isWalletConnected={isConnected && !!address}
          />
        </div>

        {/* Attribution */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs font-mono">
            🔗 On-Chain Gaming • Built with OnchainKit SDK v0.38.17 • Base Network
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Every guess is a transaction • Permanent & Verifiable
          </p>
        </div>
      </div>
    </Card>
  );
}