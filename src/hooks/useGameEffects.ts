import { useState, useCallback } from 'react';
import { useAudio } from './useAudio';

interface Player {
  name: string;
  age: number;
  difficulty: 'easy' | 'medium' | 'hard';
  preferences: string[];
}

export const useGameEffects = () => {
  const [successEffect, setSuccessEffect] = useState<'word' | 'level' | null>(null);
  const [combo, setCombo] = useState(0);
  const [lastWordTime, setLastWordTime] = useState(0);
  const [rewardPopup, setRewardPopup] = useState<{
    points: number;
    combo: number;
    word: string;
  } | null>(null);

  const { playWordFoundSound, playComboSound, playLevelCompleteSound } = useAudio();

  const handleWordFound = useCallback((
    word: string,
    foundWords: Set<string>,
    setFoundWords: (words: Set<string>) => void,
    player: Player | null,
    setScore: (fn: (prev: number) => number) => void,
    setTotalWordsFound: (fn: (prev: number) => number) => void
  ) => {
    if (!foundWords.has(word) && player) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(word);
      setFoundWords(newFoundWords);
      
      // Calculate combo based on timing
      const currentTime = Date.now();
      const timeDiff = currentTime - lastWordTime;
      const newCombo = timeDiff < 10000 && lastWordTime > 0 ? combo + 1 : 1;
      setCombo(newCombo);
      setLastWordTime(currentTime);
      
      // Calculate score with combo multiplier
      const basePoints = word.length * 10;
      const difficultyMultiplier = player.difficulty === 'easy' ? 1 : player.difficulty === 'medium' ? 1.5 : 2;
      const comboMultiplier = newCombo > 1 ? 1 + (newCombo - 1) * 0.5 : 1;
      const points = Math.round(basePoints * difficultyMultiplier * comboMultiplier);
      setScore(prev => prev + points);
      
      // Update total words found for challenges
      setTotalWordsFound(prev => prev + 1);
      
      // Show reward popup
      setRewardPopup({ points, combo: newCombo, word });
      
      // Play sounds
      playWordFoundSound();
      if (newCombo > 1) {
        setTimeout(() => playComboSound(newCombo), 200);
      }
      
      // Trigger word found effect
      setSuccessEffect('word');
    }
  }, [combo, lastWordTime, playWordFoundSound, playComboSound]);

  const handleLevelComplete = useCallback((
    level: number,
    setLevel: (fn: (prev: number) => number) => void,
    player: Player | null,
    setPlayer: (player: Player) => void,
    saveScore: () => void,
    generateNewGame: () => void
  ) => {
    setLevel(prev => prev + 1);
    saveScore();
    
    // Reset combo on level complete
    setCombo(0);
    setLastWordTime(0);
    
    // Play level complete sound
    playLevelCompleteSound();
    
    // Trigger level complete effect
    setSuccessEffect('level');
    
    // Increase difficulty every 3 levels
    if (level % 3 === 0 && player) {
      const newPlayer = { ...player };
      if (player.difficulty === 'easy') newPlayer.difficulty = 'medium';
      else if (player.difficulty === 'medium') newPlayer.difficulty = 'hard';
      setPlayer(newPlayer);
    }
    
    // Delay new game generation to show effects
    setTimeout(() => {
      generateNewGame();
    }, 2000);
  }, [playLevelCompleteSound]);

  const resetCombo = useCallback(() => {
    setCombo(0);
    setLastWordTime(0);
  }, []);

  return {
    successEffect,
    setSuccessEffect,
    combo,
    rewardPopup,
    setRewardPopup,
    handleWordFound,
    handleLevelComplete,
    resetCombo
  };
};