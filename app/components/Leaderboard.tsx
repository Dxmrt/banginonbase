'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLeaderboard, getLeaderboardWithUsernames, formatAddress } from '@/utils/gameLogic';
import type { LeaderboardEntry } from '@/types/game';
import { useAccount } from 'wagmi';

export function Leaderboard() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load leaderboard data with Farcaster usernames
    const loadLeaderboard = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const leaders = await getLeaderboardWithUsernames(showAll ? 100 : 20);
        setLeaderboard(leaders);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        // Fallback to basic leaderboard
        const basicLeaders = getLeaderboard(showAll ? 100 : 20);
        setLeaderboard(basicLeaders.map(entry => ({
          ...entry,
          username: formatAddress(entry.address)
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
    
    // Refresh leaderboard every 60 seconds (increased due to API calls)
    const interval = setInterval(loadLeaderboard, 60000);
    
    return () => clearInterval(interval);
  }, [showAll]);

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'; // Gold
      case 2: return 'from-gray-300 to-gray-500'; // Silver
      case 3: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-cyan-400 to-purple-400'; // Default
    }
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🎵';
    }
  };

  const isCurrentUser = (playerAddress: string): boolean => {
    return address?.toLowerCase() === playerAddress.toLowerCase();
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20">
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
               LEADERBOARD 
            </h2>
            <p className="text-gray-400 text-sm font-mono">
              Top players on Base • Updated live
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">🎵</div>
              <p className="text-gray-400 font-mono">Loading players...</p>
              <p className="text-gray-500 text-sm mt-2">Fetching Farcaster usernames</p>
            </div>
          )}

          {/* Leaderboard list */}
          {!isLoading && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.address}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                    isCurrentUser(entry.address)
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 shadow-lg shadow-pink-500/20'
                      : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRankColor(entry.rank)} flex items-center justify-center text-black font-bold text-sm`}>
                        {entry.rank <= 3 ? getRankEmoji(entry.rank) : entry.rank}
                      </div>
                    </div>

                    {/* Player info */}
                    <div className="flex items-center gap-3">
                      {/* Avatar (if available) */}
                      {entry.avatar && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-500/50">
                          <img 
                            src={entry.avatar} 
                            alt={entry.displayName || entry.username || 'User avatar'}
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                          {/* Display username or formatted address */}
                          <div className="flex flex-col">
                            <p className={`font-mono text-sm ${
                              isCurrentUser(entry.address) ? 'text-pink-400 font-bold' : 'text-white'
                            }`}>
                              {entry.username && entry.username.startsWith('@') ? (
                                <span className="text-cyan-400">{entry.username}</span>
                              ) : (
                                entry.username || formatAddress(entry.address)
                              )}
                            </p>
                            {/* Display name (if different from username) */}
                            {entry.displayName && entry.displayName !== entry.username?.replace('@', '') && (
                              <p className="text-xs text-gray-400 font-normal">
                                {entry.displayName}
                              </p>
                            )}
                          </div>
                          
                          {isCurrentUser(entry.address) && (
                            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500 text-xs">
                              YOU
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500 font-mono font-bold">
                      {entry.score} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-gray-400 font-mono">No scores yet!</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to guess correctly and claim the top spot!</p>
            </div>
          ) : null}

          {/* Show more button */}
          {leaderboard.length >= 20 && (
            <div className="text-center mt-6">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30 font-mono"
              >
                {showAll ? 'Show Top 20' : 'Show All Players (1-100)'}
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-cyan-400">{leaderboard.length}</p>
                <p className="text-gray-400 text-sm font-mono">Total Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-400">
                  {leaderboard.reduce((sum, entry) => sum + entry.score, 0)}
                </p>
                <p className="text-gray-400 text-sm font-mono">Total Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}