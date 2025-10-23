'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuessResult } from '@/types/game';
import { playCorrect, playIncorrect, playClick, playStreak } from '@/lib/soundEffects';

import { getPlayerStats } from '@/utils/gameLogic';
import { useAccount } from 'wagmi';

interface ResultModalProps {
  result: GuessResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResultModal({ result, isOpen, onClose }: ResultModalProps) {
  const { address } = useAccount();
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [hasPlayedSound, setHasPlayedSound] = useState<boolean>(false);

  // Play sound when modal opens
  useEffect(() => {
    if (isOpen && result && !hasPlayedSound) {
      setTimeout(() => {
        if (result.correct) {
          playCorrect();
          
          // Check for streak and play streak sound if applicable
          if (address) {
            const stats = getPlayerStats(address);
            if (stats.currentStreak >= 3) {
              setTimeout(() => playStreak(stats.currentStreak), 800);
            }
          }
        } else {
          playIncorrect();
        }
        setHasPlayedSound(true);
      }, 200);
    }
    
    if (!isOpen) {
      setHasPlayedSound(false);
    }
  }, [isOpen, result, hasPlayedSound, address]);

  if (!result) return null;

  const handleShare = async (): Promise<void> => {
    setIsSharing(true);
    
    try {
      const shareText = result.correct
        ? `🎵 I just guessed today's song on BanginOnBase! "${result.todaysSong?.title}" by ${result.todaysSong?.artist} - earned ${result.pointsEarned} points! 🏆\n\nDaily retro music game on @base 🎸\n\nTry it: [App URL]`
        : `🎵 Tried today's BanginOnBase challenge! The song was "${result.todaysSong?.title}" by ${result.todaysSong?.artist} 🎸\n\nDaily retro music game on @base - come back tomorrow!\n\nTry it: [App URL]`;

      // In a real implementation, this would use the Farcaster SDK to post
      if (navigator.share) {
        await navigator.share({
          title: 'BanginOnBase - Daily Music Challenge',
          text: shareText,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-pink-500 text-white max-w-md">
        <div className="relative">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90 rounded-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse rounded-lg"></div>
          
          <div className="relative z-10 p-6">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {result.correct ? '🎉 CORRECT!' : '❌ NOT QUITE!'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Result message */}
              <div className="text-center">
                <p className="text-lg mb-4">{result.message}</p>
                
                {result.pointsEarned > 0 && (
                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-500 text-lg px-4 py-2">
                    +{result.pointsEarned} Points!
                  </Badge>
                )}

                {/* Transaction Hash Display */}
                {result.transactionHash && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                    <p className="text-cyan-400 text-sm font-bold mb-2">🔗 On-Chain Transaction</p>
                    <p className="text-gray-300 text-xs font-mono break-all">
                      {result.transactionHash}
                    </p>
                    <a
                      href={`https://basescan.org/tx/${result.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-cyan-400 hover:text-cyan-300 text-xs underline"
                    >
                      View on BaseScan ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Song info */}
              {result.todaysSong && (
                <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-cyan-500/30">
                  <h3 className="text-cyan-400 font-bold mb-2">Today's Song:</h3>
                  <p className="text-xl font-bold text-white">
                    "{result.todaysSong.title}"
                  </p>
                  <p className="text-lg text-gray-300">
                    by {result.todaysSong.artist}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Released in {result.todaysSong.year}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold"
                >
                  {isSharing ? '🎵' : '📢 Share on Farcaster'}
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-purple-500 text-purple-400 hover:bg-purple-500/20"
                >
                  Close
                </Button>
              </div>

              {/* Next song info */}
              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm font-mono">
                  🕐 Next song drops tomorrow at midnight UTC
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Come back for another chance to earn 5 points!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}