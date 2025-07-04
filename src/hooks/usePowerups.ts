// React hook for power-up state management

import { useState, useEffect, useCallback } from 'react';
import { PowerupSystem } from '../lib/powerupSystem';
import { type PowerupType, type PowerupState } from '../types/powerups';

interface UsePowerupsProps {
  gameData: {
    grid: string[][];
    wordsToFind: string[];
    foundWords: Set<string>;
    playerScore: number;
    gameLevel: number;
  } | null;
  onPowerupUsed?: (powerupType: PowerupType, result: any, newGrid?: string[][]) => void;
}

export const usePowerups = ({ gameData, onPowerupUsed }: UsePowerupsProps) => {
  const [powerupSystem] = useState(() => new PowerupSystem());
  const [powerupStates, setPowerupStates] = useState<Map<PowerupType, PowerupState>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  // Update powerup states periodically to handle cooldowns
  useEffect(() => {
    const updateStates = () => {
      setPowerupStates(powerupSystem.getPowerupStates());
    };

    updateStates();
    const interval = setInterval(updateStates, 1000); // Update every second

    return () => clearInterval(interval);
  }, [powerupSystem]);

  const usePowerup = useCallback(async (powerupType: PowerupType) => {
    if (!gameData || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const result = powerupSystem.usePowerup(powerupType, gameData);
      
      if (result.success) {
        onPowerupUsed?.(powerupType, result.result, result.newGrid);
        setPowerupStates(powerupSystem.getPowerupStates());
      }
    } catch (error) {
      console.error('Error using powerup:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [gameData, powerupSystem, onPowerupUsed, isProcessing]);

  const canUsePowerup = useCallback((powerupType: PowerupType): boolean => {
    if (!gameData) return false;
    return powerupSystem.canUsePowerup(powerupType, gameData.playerScore);
  }, [gameData, powerupSystem]);

  const getRemainingCooldown = useCallback((powerupType: PowerupType): number => {
    const state = powerupStates.get(powerupType);
    if (!state || !state.isOnCooldown) return 0;
    
    return Math.max(0, state.cooldownEndTime - Date.now());
  }, [powerupStates]);

  const resetPowerups = useCallback(() => {
    powerupSystem.reset();
    setPowerupStates(powerupSystem.getPowerupStates());
  }, [powerupSystem]);

  const getUsageAnalytics = useCallback(() => {
    return powerupSystem.getUsageAnalytics();
  }, [powerupSystem]);

  return {
    powerupStates,
    usePowerup,
    canUsePowerup,
    getRemainingCooldown,
    resetPowerups,
    getUsageAnalytics,
    isProcessing
  };
};