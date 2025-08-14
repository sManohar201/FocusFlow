import { useCallback } from 'react';

export function useAudio() {
  const playBeep = useCallback((frequency = 800, duration = 200) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }, []);

  const playSessionComplete = useCallback(() => {
    playBeep(800, 200);
    setTimeout(() => playBeep(1000, 300), 250);
  }, [playBeep]);

  const playBreakComplete = useCallback(() => {
    playBeep(600, 200);
    setTimeout(() => playBeep(400, 300), 250);
  }, [playBeep]);

  return {
    playBeep,
    playBell: playSessionComplete, // Alias for compatibility
    playSessionComplete,
    playBreakComplete,
  };
}
