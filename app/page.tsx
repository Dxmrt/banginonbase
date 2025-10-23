'use client';

import { useState, useEffect } from 'react';
import { CassettePlayer } from '@/components/CassettePlayer';
import { Leaderboard } from '@/components/Leaderboard';
import { ResultModal } from '@/components/ResultModal';
import { SoundToggle } from '@/components/SoundToggle';
import { FarcasterWallet } from '@/components/FarcasterWallet';
import type { GuessResult } from '@/types/game';

export default function BanginOnBasePage() {
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  const handleGuessResult = (result: GuessResult): void => {
    setGuessResult(result);
    setShowResultModal(true);
  };

  const closeResultModal = (): void => {
    setShowResultModal(false);
    // Keep result for a moment to allow animations to complete
    setTimeout(() => setGuessResult(null), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Sound Toggle - Fixed position */}
      <SoundToggle />

      <div className="relative z-10">
        {/* MOBILE RESPONSIVE: Header */}
        <header className="text-center py-4 sm:py-8 px-2 sm:px-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-b border-cyan-500/30">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <img 
                src="https://i.postimg.cc/L47kHVRs/BANGINONBASEBANN.png"
                alt="BanginOnBase - Retro Music Game"
                className="mx-auto max-w-full h-auto max-h-32 sm:max-h-48 md:max-h-64 object-contain hover:scale-105 transition-transform duration-300 rounded-lg shadow-lg border border-pink-500/20"
                style={{ minHeight: '80px', backgroundColor: '#1a1a2e' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'mx-auto p-4 sm:p-8 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-lg border border-cyan-500/30 min-h-[80px] sm:min-h-[120px] flex items-center justify-center';
                  fallback.innerHTML = '<h1 class="text-2xl sm:text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 font-mono tracking-widest animate-pulse">BANGIN\'ONBASE</h1>';
                  target.parentNode?.replaceChild(fallback, target);
                }}
              />
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-3 sm:mb-4 font-mono px-2">
              🎵 Daily 80s Music Guessing Game 🎵
            </p>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-2xl mx-auto px-2 leading-relaxed">
              Guess today's retro hit using emoji, lyric, and trivia clues! 
              Earn 5 points per correct guess. New song daily at midnight UTC.
            </p>
            
            {/* Wallet connection */}
            <div className="flex justify-center mb-4 sm:mb-8">
              <FarcasterWallet />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Game area */}
            <div>
              <CassettePlayer onGuessResult={handleGuessResult} />
            </div>

            {/* Leaderboard */}
            <div>
              <Leaderboard />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 px-4 border-t border-gray-800">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-500 text-sm font-mono mb-2">
              Built with OnchainKit SDK v0.38.13 • Base Sepolia • Gas-Free Gaming
            </p>
            <p className="text-gray-600 text-xs">
              🎸 Celebrating the greatest decade of music • New songs added regularly 🎸
            </p>
          </div>
        </footer>
      </div>

      {/* Result modal */}
      <ResultModal
        result={guessResult}
        isOpen={showResultModal}
        onClose={closeResultModal}
      />
    </div>
  );
}