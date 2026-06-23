'use client';

import { useState, useEffect, useRef } from 'react';

export function useMetroTravelSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const departureAudioRef = useRef<HTMLAudioElement | null>(null);
  const rollingAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const handleVisibilityChange = () => {
      if (document.hidden) {
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

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const departure = departureAudioRef.current;
    const rolling = rollingAudioRef.current;

    if (!departure || !rolling) return;

    // Play departure cue once if rolling is currently paused (starting from idle)
    if (rolling.paused) {
      departure.currentTime = 0;
      departure.play().catch(() => {});
    }

    // Play rolling loop if not already playing
    if (rolling.paused) {
      rolling.volume = 0.22;
      rolling.currentTime = 0;
      rolling.play().catch(() => {});
    } else {
      rolling.volume = 0.22;
    }
  };

  const playDepartureOnly = () => {
    if (!soundEnabled) return;
    const departure = departureAudioRef.current;
    if (departure) {
      departure.currentTime = 0;
      departure.play().catch(() => {});
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

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startVolume = 0.22;
    const steps = 10;
    const intervalTime = 40; // 40ms * 10 steps = 400ms fade out
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const nextVolume = startVolume * (1 - currentStep / steps);
      if (nextVolume <= 0.01 || currentStep >= steps) {
        rolling.pause();
        rolling.currentTime = 0;
        rolling.volume = startVolume; // Reset volume for next trigger
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
    playDepartureOnly,
    stopJourneySound,
  };
}
