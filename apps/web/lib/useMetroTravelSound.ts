import { useState, useEffect, useRef } from 'react';

export function useMetroTravelSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const departureAudioRef = useRef<HTMLAudioElement | null>(null);
  const rollingAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize audio elements client-side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load preference from localStorage
    const saved = localStorage.getItem('ecotransit_sound_enabled');
    if (saved !== null) {
      setSoundEnabled(saved === 'true');
    }

    const departure = new Audio('/audio/metro-departure.mp3');
    departure.volume = 0.25;
    departureAudioRef.current = departure;

    const rolling = new Audio('/audio/metro-rolling-loop.mp3');
    rolling.loop = true;
    rolling.volume = 0.22;
    rollingAudioRef.current = rolling;

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause rolling sound if tab is hidden
        if (rollingAudioRef.current) {
          rollingAudioRef.current.pause();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (departureAudioRef.current) {
        departureAudioRef.current.pause();
      }
      if (rollingAudioRef.current) {
        rollingAudioRef.current.pause();
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('ecotransit_sound_enabled', String(nextState));

    if (!nextState) {
      // Immediately stop all sounds if muted
      if (departureAudioRef.current) {
        departureAudioRef.current.pause();
        departureAudioRef.current.currentTime = 0;
      }
      if (rollingAudioRef.current) {
        rollingAudioRef.current.pause();
        rollingAudioRef.current.currentTime = 0;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }
  };

  const playJourneySound = () => {
    if (!soundEnabled) return;

    // Clear any active fade out interval to avoid volume fighting
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const departure = departureAudioRef.current;
    const rolling = rollingAudioRef.current;

    if (!departure || !rolling) return;

    // 1. Departure cue - play once if not already playing and from idle
    // If rolling is not currently playing, it means the train is starting from idle
    if (rolling.paused) {
      departure.currentTime = 0;
      departure.play().catch(() => {
        // Suppress browser autoplay block warnings silently
      });
    }

    // 2. Rolling cue - start playing looping track
    if (rolling.paused) {
      rolling.volume = 0.22;
      rolling.currentTime = 0;
      rolling.play().catch(() => {
        // Suppress autoplay blocks
      });
    } else {
      // If already playing (rapid retarget click), keep rolling at normal volume
      rolling.volume = 0.22;
    }
  };

  const stopJourneySound = (fade = true) => {
    const rolling = rollingAudioRef.current;
    if (!rolling || rolling.paused) return;

    if (!fade) {
      rolling.pause();
      rolling.currentTime = 0;
      return;
    }

    // Smoothly fade out the rolling loop over 400ms
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startVolume = rolling.volume;
    const steps = 10;
    const intervalTime = 40; // 40ms * 10 steps = 400ms fade out
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const nextVolume = startVolume * (1 - currentStep / steps);
      if (nextVolume <= 0.01 || currentStep >= steps) {
        rolling.pause();
        rolling.currentTime = 0;
        rolling.volume = startVolume; // reset volume for next play
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      } else {
        rolling.volume = nextVolume;
      }
    }, intervalTime);
  };

  return {
    soundEnabled,
    toggleSound,
    playJourneySound,
    stopJourneySound,
  };
}
