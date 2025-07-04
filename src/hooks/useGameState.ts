import { useState, useCallback, useEffect } from 'react';
import { generateGameData, type GameData, type Difficulty } from '../lib/gameGenerator';

interface Player {
  name: string;
  age: number;
  difficulty: Difficulty;
  preferences: string[];
}

export const useGameState = (player: Player | null) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalWordsFound, setTotalWordsFound] = useState(0);

  const generateNewGame = useCallback(async () => {
    if (!player) return;
    setIsLoading(true);
    try {
      const newGameData = await generateGameData(player.difficulty, player.preferences);
      setGameData(newGameData);
      setFoundWords(new Set());
    } catch (error) {
      console.error('Failed to generate game:', error);
    } finally {
      setIsLoading(false);
    }
  }, [player]);

  const saveScore = useCallback(() => {
    if (!player) return;
    
    const scoreData = {
      name: player.name,
      age: player.age,
      difficulty: player.difficulty,
      score,
      level,
      date: new Date().toISOString()
    };
    
    const existingScores = JSON.parse(localStorage.getItem('wordSearchScores') || '[]');
    existingScores.push(scoreData);
    existingScores.sort((a: any, b: any) => b.score - a.score);
    localStorage.setItem('wordSearchScores', JSON.stringify(existingScores.slice(0, 10)));
  }, [player, score, level]);

  useEffect(() => {
    if (player) {
      generateNewGame();
    }
  }, [generateNewGame]);

  return {
    gameData,
    foundWords,
    setFoundWords,
    score,
    setScore,
    level,
    setLevel,
    isLoading,
    totalWordsFound,
    setTotalWordsFound,
    generateNewGame,
    saveScore
  };
};