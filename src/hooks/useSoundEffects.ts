"use client";

import { useCallback, useRef, useEffect } from "react";
import { useUserSettings } from "./useGamification";

// Sound effect types
export type SoundEffect = "complete" | "mit_complete" | "badge" | "level_up" | "error" | "undo";

// Sound URLs (using simple Web Audio API oscillator for MVP - can be replaced with actual sound files)
const SOUND_CONFIG: Record<SoundEffect, { frequency: number; duration: number; type: OscillatorType }> = {
  complete: { frequency: 800, duration: 100, type: "sine" },
  mit_complete: { frequency: 1200, duration: 150, type: "sine" },
  badge: { frequency: 1000, duration: 200, type: "triangle" },
  level_up: { frequency: 1400, duration: 300, type: "triangle" },
  error: { frequency: 300, duration: 150, type: "square" },
  undo: { frequency: 400, duration: 80, type: "sine" },
};

/**
 * Hook for playing sound effects (11.1)
 * Respects user preference stored in settings
 */
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const { data } = useUserSettings();

  // Sound enabled from settings (defaults to false if not set)
  const soundEnabled = data?.user?.enableSoundEffects ?? false;

  // Initialize AudioContext lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a sound effect
  const playSound = useCallback(
    (effect: SoundEffect) => {
      if (!soundEnabled) return;

      try {
        const ctx = getAudioContext();
        const config = SOUND_CONFIG[effect];

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + config.duration / 1000);
      } catch {
        // Silently fail if audio doesn't work (e.g., Safari restrictions)
      }
    },
    [soundEnabled, getAudioContext]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    soundEnabled,
  };
}

/**
 * Hook that combines sound effects with completion actions
 */
export function useCompletionFeedback() {
  const { playSound, soundEnabled } = useSoundEffects();

  const onTaskComplete = useCallback(
    (isMit: boolean = false) => {
      if (isMit) {
        playSound("mit_complete");
      } else {
        playSound("complete");
      }
    },
    [playSound]
  );

  const onBadgeEarned = useCallback(() => {
    playSound("badge");
  }, [playSound]);

  const onLevelUp = useCallback(() => {
    playSound("level_up");
  }, [playSound]);

  const onError = useCallback(() => {
    playSound("error");
  }, [playSound]);

  const onUndo = useCallback(() => {
    playSound("undo");
  }, [playSound]);

  return {
    onTaskComplete,
    onBadgeEarned,
    onLevelUp,
    onError,
    onUndo,
    soundEnabled,
  };
}
