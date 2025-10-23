'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Achievement, PlayerStats } from '@/types/game';
import { getPlayerStats, unlockAchievement } from '@/utils/gameLogic';
import { useAccount } from 'wagmi';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_guess',
    title: '🎵 First Timer',
    description: 'Make your first guess',
    condition: 'totalGuesses >= 1',
    emoji: '🎵',
    rarity: 'common'
  },
  {
    id: 'first_correct',
    title: '🎯 Nailed It!',
    description: 'Get your first correct answer',
    condition: 'correctGuesses >= 1',
    emoji: '🎯',
    rarity: 'common'
  },
  {
    id: 'streak_3',
    title: '🔥 Hot Streak',
    description: 'Guess correctly 3 days in a row',
    condition: 'currentStreak >= 3',
    emoji: '🔥',
    rarity: 'uncommon'
  },
  {
    id: 'streak_7',
    title: '⚡ Lightning Streak',
    description: 'Guess correctly 7 days in a row',
    condition: 'currentStreak >= 7',
    emoji: '⚡',
    rarity: 'rare'
  },
  {
    id: 'streak_14',
    title: '💎 Diamond Streak',
    description: 'Guess correctly 14 days in a row',
    condition: 'currentStreak >= 14',
    emoji: '💎',
    rarity: 'legendary'
  },
  {
    id: 'score_50',
    title: '⭐ Rising Star',
    description: 'Reach 50 total points',
    condition: 'totalScore >= 50',
    emoji: '⭐',
    rarity: 'uncommon'
  },
  {
    id: 'score_100',
    title: '🌟 Music Master',
    description: 'Reach 100 total points',
    condition: 'totalScore >= 100',
    emoji: '🌟',
    rarity: 'rare'
  },
  {
    id: 'score_250',
    title: '👑 80s Legend',
    description: 'Reach 250 total points',
    condition: 'totalScore >= 250',
    emoji: '👑',
    rarity: 'legendary'
  },
  {
    id: 'perfect_week',
    title: '🏆 Perfect Week',
    description: 'Get 7 correct answers in 7 days',
    condition: 'perfectWeeks >= 1',
    emoji: '🏆',
    rarity: 'epic'
  },
  {
    id: 'early_bird',
    title: '🌅 Early Bird',
    description: 'Play within 1 hour of song release',
    condition: 'earlyBirdPlays >= 1',
    emoji: '🌅',
    rarity: 'uncommon'
  }
];

export function AchievementSystem() {
  const { address } = useAccount();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    if (!address) return;

    const stats = getPlayerStats(address);
    setPlayerStats(stats);

    // Check for newly unlocked achievements
    const currentUnlocked = ACHIEVEMENTS.filter(achievement => 
      checkAchievementCondition(achievement, stats)
    );

    const previousUnlocked = stats.unlockedAchievements || [];
    const newlyUnlocked = currentUnlocked.filter(achievement => 
      !previousUnlocked.some(prev => prev.id === achievement.id)
    );

    setUnlockedAchievements(currentUnlocked);
    
    // Show new achievement notifications
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
      newlyUnlocked.forEach(achievement => unlockAchievement(address, achievement));
    }
  }, [address]);

  const checkAchievementCondition = (achievement: Achievement, stats: PlayerStats): boolean => {
    // Simple condition parser - in real app this would be more robust
    const condition = achievement.condition;
    
    if (condition.includes('totalGuesses')) {
      const required = parseInt(condition.split('>=')[1].trim());
      return stats.totalGuesses >= required;
    }
    if (condition.includes('correctGuesses')) {
      const required = parseInt(condition.split('>=')[1].trim());
      return stats.correctGuesses >= required;
    }
    if (condition.includes('currentStreak')) {
      const required = parseInt(condition.split('>=')[1].trim());
      return stats.currentStreak >= required;
    }
    if (condition.includes('totalScore')) {
      const required = parseInt(condition.split('>=')[1].trim());
      return stats.totalScore >= required;
    }
    if (condition.includes('perfectWeeks')) {
      const required = parseInt(condition.split('>=')[1].trim());
      return stats.perfectWeeks >= required;
    }
    if (condition.includes('earlyBirdPlays')) {
      const required = parseInt(condition.split('>=')[1].trim());
      return stats.earlyBirdPlays >= required;
    }
    
    return false;
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const dismissNewAchievements = (): void => {
    setNewAchievements([]);
  };

  if (!address || !playerStats) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            🏆 Achievements
          </h2>
          <p className="text-gray-400">Connect your wallet to track achievements!</p>
        </div>
      </Card>
    );
  }

  const displayedAchievements = showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 6);

  return (
    <>
      {/* New Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black p-4 rounded-lg shadow-2xl animate-bounce"
            >
              <div className="font-bold">🎉 Achievement Unlocked!</div>
              <div className="text-sm">{achievement.emoji} {achievement.title}</div>
              <Button
                size="sm"
                onClick={dismissNewAchievements}
                className="mt-2 bg-black/20 hover:bg-black/30 text-black"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}

      <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20">
        <div className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
          
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                🏆 ACHIEVEMENTS 🏆
              </h2>
              <p className="text-gray-400 text-sm font-mono">
                {unlockedAchievements.length}/{ACHIEVEMENTS.length} Unlocked
              </p>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAchievements.map((achievement) => {
                const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      isUnlocked
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}/20 border-yellow-500`
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2 filter ${isUnlocked ? '' : 'grayscale opacity-50'}">
                        {achievement.emoji}
                      </div>
                      <h3 className={`font-bold mb-1 ${
                        isUnlocked ? 'text-yellow-400' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-xs ${
                        isUnlocked ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </p>
                      <Badge 
                        className={`mt-2 text-xs ${
                          isUnlocked 
                            ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-black`
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show more button */}
            {ACHIEVEMENTS.length > 6 && (
              <div className="text-center mt-6">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30 font-mono"
                >
                  {showAll ? 'Show Less' : `Show All (${ACHIEVEMENTS.length})`}
                </Button>
              </div>
            )}

            {/* Progress Overview */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-400">
                  Achievement Progress: {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}