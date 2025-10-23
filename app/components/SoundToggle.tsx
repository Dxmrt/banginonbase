'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toggleSounds, isSoundEnabled, playClick } from '@/lib/soundEffects';


export function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, []);

  const handleToggle = (): void => {
    const newState = toggleSounds();
    setSoundEnabled(newState);
    
    // Play a sound if we're enabling sounds
    if (newState) {
      setTimeout(() => playClick(), 100);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className="fixed top-4 right-4 z-40 bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:text-white font-mono"
      title={soundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
    >
      {soundEnabled ? '🔊' : '🔇'} 
      <span className="ml-1 text-xs hidden sm:inline">
        {soundEnabled ? 'ON' : 'OFF'}
      </span>
    </Button>
  );
}