// Sound effects and audio feedback for BanginOnBase
// Using Web Audio API for retro 80s-style sounds

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize audio context on user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudio();
      this.loadSettings();
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('banginonbase-sound-enabled');
      if (saved !== null) {
        this.enabled = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('banginonbase-sound-enabled', JSON.stringify(this.enabled));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    // Create envelope (attack, decay, sustain, release)
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private createChord(frequencies: number[], duration: number): void {
    frequencies.forEach(freq => {
      this.createTone(freq, duration, 'sawtooth');
    });
  }

  // 80s-style correct answer sound (upward arpeggio)
  public playCorrect(): void {
    if (!this.enabled) return;
    
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.createTone(note, 0.2, 'square');
      }, index * 100);
    });

    // Add some reverb-like echo effect
    setTimeout(() => {
      this.createChord([440, 659.25, 880], 0.5);
    }, 400);
  }

  // Retro incorrect sound (descending notes)
  public playIncorrect(): void {
    if (!this.enabled) return;
    
    const notes = [330, 293.66, 246.94]; // E4, D4, B3
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.createTone(note, 0.3, 'sawtooth');
      }, index * 150);
    });
  }

  // Button click sound (short beep)
  public playClick(): void {
    if (!this.enabled) return;
    this.createTone(800, 0.1, 'square');
  }

  // Cassette tape "rewind" sound effect
  public playTapeRewind(): void {
    if (!this.enabled) return;
    
    // Create a swoosh-like sound by modulating frequency
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Use a valid OscillatorType; Web Audio doesn't support 'noise' directly
    oscillator.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);

    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Achievement unlock sound (fanfare)
  public playAchievement(): void {
    if (!this.enabled) return;
    
    // Play a triumphant chord progression
    const chords = [
      [523.25, 659.25, 783.99], // C5, E5, G5
      [587.33, 739.99, 880.00], // D5, F#5, A5
      [659.25, 830.61, 987.77]  // E5, G#5, B5
    ];

    chords.forEach((chord, index) => {
      setTimeout(() => {
        this.createChord(chord, 0.4);
      }, index * 200);
    });

    // Add a high trill at the end
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.createTone(1760 + (i * 100), 0.1, 'square');
        }, i * 50);
      }
    }, 600);
  }

  // Daily song reveal sound
  public playSongReveal(): void {
    if (!this.enabled) return;
    
    // Mysterious build-up followed by reveal
    const buildUp = [200, 250, 300, 350, 400];
    buildUp.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, 0.2, 'triangle');
      }, index * 100);
    });

    // Big reveal chord
    setTimeout(() => {
      this.createChord([440, 554.37, 659.25, 880], 1.0);
    }, 600);
  }

  // Streak milestone sound
  public playStreak(streakLength: number): void {
    if (!this.enabled) return;
    
    // More impressive sound for longer streaks
    const baseFreq = 440;
    const harmonics = Math.min(streakLength, 5);
    
    for (let i = 0; i < harmonics; i++) {
      setTimeout(() => {
        this.createTone(baseFreq * (i + 1), 0.3, 'sine');
      }, i * 50);
    }
  }

  // Enable/disable sound effects
  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.saveSettings();
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Resume audio context (required for some browsers)
  public resumeContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const soundEffects = new SoundEffects();

// Export individual functions for easier use
export const playCorrect = () => soundEffects.playCorrect();
export const playIncorrect = () => soundEffects.playIncorrect();
export const playClick = () => soundEffects.playClick();
export const playTapeRewind = () => soundEffects.playTapeRewind();
export const playAchievement = () => soundEffects.playAchievement();
export const playSongReveal = () => soundEffects.playSongReveal();
export const playStreak = (length: number) => soundEffects.playStreak(length);
export const toggleSounds = () => soundEffects.toggle();
export const isSoundEnabled = () => soundEffects.isEnabled();
export const resumeAudio = () => soundEffects.resumeContext();