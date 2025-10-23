'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PlayerStats, DetailedStats } from '@/types/game';
import { getPlayerStats, getDetailedStats } from '@/utils/gameLogic';
import { useAccount } from 'wagmi';

export function StatsDashboard() {
  const { address } = useAccount();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [showDetailed, setShowDetailed] = useState<boolean>(false);

  useEffect(() => {
    if (!address) return;

    const stats = getPlayerStats(address);
    const detailed = getDetailedStats(address);
    
    setPlayerStats(stats);
    setDetailedStats(detailed);
  }, [address]);

  if (!address) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-green-500 shadow-2xl shadow-green-500/20">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            📊 Your Stats
          </h2>
          <p className="text-gray-400">Connect your wallet to view your statistics!</p>
        </div>
      </Card>
    );
  }

  if (!playerStats || !detailedStats) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const accuracy = playerStats.totalGuesses > 0 
    ? Math.round((playerStats.correctGuesses / playerStats.totalGuesses) * 100) 
    : 0;

  const avgPointsPerDay = playerStats.daysPlayed > 0 
    ? Math.round(playerStats.totalScore / playerStats.daysPlayed) 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-green-500 shadow-2xl shadow-green-500/20">
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse"></div>
        
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              📊 YOUR STATS 📊
            </h2>
            <p className="text-gray-400 text-sm font-mono">
              Your BanginOnBase performance analytics
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-lg p-4 border border-green-500/30 text-center">
              <div className="text-2xl font-bold text-green-400">
                {playerStats.totalScore}
              </div>
              <div className="text-xs text-gray-400 font-mono">TOTAL POINTS</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-4 border border-cyan-500/30 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {playerStats.currentStreak}
              </div>
              <div className="text-xs text-gray-400 font-mono">CURRENT STREAK</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {accuracy}%
              </div>
              <div className="text-xs text-gray-400 font-mono">ACCURACY</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {playerStats.longestStreak}
              </div>
              <div className="text-xs text-gray-400 font-mono">BEST STREAK</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <h3 className="text-green-400 font-bold mb-3 text-sm">🎯 GUESSING STATS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Guesses:</span>
                  <span className="text-white font-mono">{playerStats.totalGuesses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Correct:</span>
                  <span className="text-green-400 font-mono">{playerStats.correctGuesses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Incorrect:</span>
                  <span className="text-red-400 font-mono">{playerStats.totalGuesses - playerStats.correctGuesses}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <h3 className="text-cyan-400 font-bold mb-3 text-sm">📅 ACTIVITY STATS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Played:</span>
                  <span className="text-white font-mono">{playerStats.daysPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Points/Day:</span>
                  <span className="text-cyan-400 font-mono">{avgPointsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Perfect Weeks:</span>
                  <span className="text-yellow-400 font-mono">{playerStats.perfectWeeks}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <h3 className="text-purple-400 font-bold mb-3 text-sm">🏆 ACHIEVEMENTS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Unlocked:</span>
                  <span className="text-white font-mono">{playerStats.achievementsUnlocked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rank:</span>
                  <span className="text-purple-400 font-mono">#{playerStats.globalRank || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Early Bird:</span>
                  <span className="text-yellow-400 font-mono">{playerStats.earlyBirdPlays}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats Toggle */}
          {showDetailed && (
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-center bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                📈 Detailed Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Performance */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-green-400 font-bold mb-3 text-sm">📊 RECENT PERFORMANCE (7 DAYS)</h4>
                  <div className="space-y-2 text-sm">
                    {detailedStats.recentPerformance.map((day, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-400">Day {index + 1}:</span>
                        <span className={`font-mono ${day.correct ? 'text-green-400' : 'text-red-400'}`}>
                          {day.correct ? '✓' : '✗'} {day.points}pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorite Decades/Artists */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-cyan-400 font-bold mb-3 text-sm">🎵 TOP CATEGORIES</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Decade:</span>
                      <span className="text-cyan-400 font-mono">{detailedStats.bestDecade || '80s'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hardest Genre:</span>
                      <span className="text-red-400 font-mono">{detailedStats.hardestGenre || 'Synth-Pop'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Time:</span>
                      <span className="text-purple-400 font-mono">{detailedStats.bestPlayTime || 'Evening'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Time Heatmap */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-purple-400 font-bold mb-3 text-sm">🕐 PLAY TIME PATTERN</h4>
                <div className="grid grid-cols-7 gap-1">
                  {detailedStats.playTimeHeatmap.map((hour, index) => (
                    <div
                      key={index}
                      className={`h-8 rounded text-xs flex items-center justify-center font-mono ${
                        hour.intensity > 0.7 ? 'bg-green-500 text-black' :
                        hour.intensity > 0.4 ? 'bg-green-400/60 text-white' :
                        hour.intensity > 0.1 ? 'bg-green-400/30 text-gray-300' :
                        'bg-gray-700 text-gray-500'
                      }`}
                      title={`${hour.hour}:00 - ${hour.plays} plays`}
                    >
                      {hour.hour}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Darker = More Active</p>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <div className="text-center">
            <Button
              onClick={() => setShowDetailed(!showDetailed)}
              variant="outline"
              className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-green-500 text-green-400 hover:bg-green-500/30 font-mono"
            >
              {showDetailed ? 'Hide Detailed Stats' : 'Show Detailed Analytics'}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs font-mono">
              Stats update in real-time • Data stored locally
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}