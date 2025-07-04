import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Zap } from 'lucide-react';

interface Player {
  name: string;
  age: number;
  difficulty: 'easy' | 'medium' | 'hard';
  preferences: string[];
}

interface GameHeaderProps {
  player: Player;
  score: number;
  level: number;
  theme: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  player,
  score,
  level,
  theme
}) => {
  const getDifficultyColor = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return 'bg-secondary';
      case 'medium': return 'bg-accent';
      case 'hard': return 'bg-destructive';
    }
  };

  const getDifficultyLabel = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return '6-8 years';
      case 'medium': return '9-12 years';
      case 'hard': return '13+ years';
    }
  };

  return (
    <div className="mb-6 animate-fade-in">
      <Card className="p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-primary text-primary-foreground p-3 rounded-full shadow-game">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Word Search Infinity</h1>
              <p className="text-muted-foreground">Theme: {theme} | Player: {player.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getDifficultyColor(player.difficulty)}>
              {getDifficultyLabel(player.difficulty)}
            </Badge>
            <div className="flex items-center gap-2 bg-game-grid px-3 py-2 rounded-lg">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-semibold">{score}</span>
            </div>
            <div className="flex items-center gap-2 bg-game-grid px-3 py-2 rounded-lg">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">Level {level}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};