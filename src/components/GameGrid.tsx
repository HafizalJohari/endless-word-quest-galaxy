import React from 'react';
import { Card } from '@/components/ui/card';
import { WordSearchGrid } from './WordSearchGrid';
import type { GameData } from '../lib/gameGenerator';

interface GameGridProps {
  gameData: GameData;
  foundWords: Set<string>;
  onWordFound: (word: string) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  gameData,
  foundWords,
  onWordFound
}) => {
  return (
    <Card className="p-6 shadow-game animate-scale-in">
      <WordSearchGrid
        grid={gameData.grid}
        wordsToFind={gameData.wordsToFind}
        onWordFound={onWordFound}
        foundWords={foundWords}
      />
    </Card>
  );
};