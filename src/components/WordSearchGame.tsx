import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy, Target, Zap } from 'lucide-react';
import { WordSearchGrid } from './WordSearchGrid';
import { generateGameData, type GameData, type Difficulty } from '../lib/gameGenerator';

interface WordSearchGameProps {
  className?: string;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ className }) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isLoading, setIsLoading] = useState(false);

  const generateNewGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const newGameData = await generateGameData(difficulty);
      setGameData(newGameData);
      setFoundWords(new Set());
    } catch (error) {
      console.error('Failed to generate game:', error);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    generateNewGame();
  }, [generateNewGame]);

  const handleWordFound = useCallback((word: string) => {
    if (!foundWords.has(word)) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(word);
      setFoundWords(newFoundWords);
      
      // Calculate score based on word length and difficulty
      const basePoints = word.length * 10;
      const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
      const points = Math.round(basePoints * difficultyMultiplier);
      setScore(prev => prev + points);
    }
  }, [foundWords, difficulty]);

  const handleLevelComplete = useCallback(() => {
    setLevel(prev => prev + 1);
    
    // Increase difficulty every 3 levels
    if (level % 3 === 0) {
      if (difficulty === 'easy') setDifficulty('medium');
      else if (difficulty === 'medium') setDifficulty('hard');
    }
    
    generateNewGame();
  }, [level, difficulty, generateNewGame]);

  useEffect(() => {
    if (gameData && foundWords.size === gameData.wordsToFind.length) {
      setTimeout(handleLevelComplete, 1000);
    }
  }, [foundWords.size, gameData, handleLevelComplete]);

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'bg-secondary';
      case 'medium': return 'bg-accent';
      case 'hard': return 'bg-destructive';
    }
  };

  const getDifficultyLabel = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return '6-8 years';
      case 'medium': return '9-12 years';
      case 'hard': return '13+ years';
    }
  };

  if (!gameData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-game">
        <Card className="p-8 shadow-game animate-scale-in">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Generating your puzzle...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-game p-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <Card className="p-6 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary text-primary-foreground p-3 rounded-full shadow-game">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Word Search Infinity</h1>
                  <p className="text-muted-foreground">Theme: {gameData.theme}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                  {getDifficultyLabel(difficulty)}
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-game animate-scale-in">
              <WordSearchGrid
                grid={gameData.grid}
                wordsToFind={gameData.wordsToFind}
                onWordFound={handleWordFound}
                foundWords={foundWords}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Words List */}
            <Card className="p-4 shadow-card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Find These Words</h3>
                <span className="text-sm text-muted-foreground">
                  {foundWords.size}/{gameData.wordsToFind.length}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameData.wordsToFind.map((word) => (
                  <div
                    key={word}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                      foundWords.has(word)
                        ? 'bg-game-found text-secondary-foreground line-through animate-pulse-success'
                        : 'bg-game-grid text-foreground hover:bg-game-cell-hover'
                    }`}
                  >
                    {word.toUpperCase()}
                  </div>
                ))}
              </div>
            </Card>

            {/* Progress */}
            <Card className="p-4 shadow-card animate-fade-in">
              <h3 className="font-semibold text-foreground mb-3">Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Words Found</span>
                    <span>{foundWords.size}/{gameData.wordsToFind.length}</span>
                  </div>
                  <div className="w-full bg-game-grid rounded-full h-2">
                    <div
                      className="bg-gradient-success h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(foundWords.size / gameData.wordsToFind.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                
                {foundWords.size === gameData.wordsToFind.length && (
                  <div className="text-center p-3 bg-gradient-success text-secondary-foreground rounded-lg animate-word-found">
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Level Complete!</p>
                    <p className="text-sm opacity-90">Advancing to level {level + 1}...</p>
                  </div>
                )}
              </div>
            </Card>

            {/* New Game Button */}
            <Button
              onClick={generateNewGame}
              disabled={isLoading}
              className="w-full bg-gradient-primary hover:shadow-game transition-all duration-300"
              size="lg"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Puzzle
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};