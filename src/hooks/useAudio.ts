import { useCallback, useRef } from 'react';

interface AudioContextType {
  context: AudioContext | null;
  gainNode: GainNode | null;
}

export const useAudio = () => {
  const audioContextRef = useRef<AudioContextType>({ context: null, gainNode: null });

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current.context) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.value = 0.3; // Default volume
        
        audioContextRef.current = { context, gainNode };
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, []);

  const playTone = useCallback((frequency: number, duration: number = 200, type: OscillatorType = 'sine') => {
    initAudioContext();
    const { context, gainNode } = audioContextRef.current;
    
    if (!context || !gainNode) return;

    try {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      
      oscillator.connect(envelope);
      envelope.connect(gainNode);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      // Envelope for smooth sound
      envelope.gain.setValueAtTime(0, context.currentTime);
      envelope.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Error playing audio:', error);
    }
  }, [initAudioContext]);

  const playWordFoundSound = useCallback(() => {
    // Happy ascending chord
    playTone(523.25, 150); // C5
    setTimeout(() => playTone(659.25, 150), 50); // E5
    setTimeout(() => playTone(783.99, 200), 100); // G5
  }, [playTone]);

  const playComboSound = useCallback((combo: number) => {
    // Higher pitch for higher combos
    const basePitch = 400 + (combo * 50);
    playTone(basePitch, 100, 'square');
    setTimeout(() => playTone(basePitch * 1.5, 150, 'square'), 100);
  }, [playTone]);

  const playLevelCompleteSound = useCallback(() => {
    // Victory fanfare
    const notes = [261.63, 329.63, 392.00, 523.25]; // C-E-G-C
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 300), index * 150);
    });
  }, [playTone]);

  const playClickSound = useCallback(() => {
    playTone(800, 50, 'square');
  }, [playTone]);

  return {
    playWordFoundSound,
    playComboSound,
    playLevelCompleteSound,
    playClickSound,
    playTone
  };
};