import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, HelpCircle, Award } from 'lucide-react';
import { ProgressionSystem } from './ProgressionSystem';
import { DailyChallenges } from './DailyChallenges';
import { ComboMeter } from './ComboMeter';
import type { GameData } from '../lib/gameGenerator';

interface GameSidebarProps {
  level: number;
  score: number;
  combo: number;
  totalWordsFound: number;
  gameData: GameData;
  foundWords: Set<string>;
  activeChallenges: any[];
  setActiveChallenges: (fn: (prev: any[]) => any[]) => void;
  setShowTutorial: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  onNewGame: () => void;
  onComboReset: () => void;
  isLoading: boolean;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  level,
  score,
  combo,
  totalWordsFound,
  gameData,
  foundWords,
  activeChallenges,
  setActiveChallenges,
  setShowTutorial,
  setShowLeaderboard,
  onNewGame,
  onComboReset,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      {/* Progression System */}
      <ProgressionSystem
        currentLevel={level}
        totalScore={score}
      />
      
      {/* Daily Challenges */}
      <DailyChallenges
        onChallengeAccept={(challenge) => setActiveChallenges(prev => [...prev, challenge])}
        gameStats={{
          wordsFound: totalWordsFound,
          level,
          score,
          combo
        }}
      />
      
      {/* Combo Meter */}
      {combo > 1 && (
        <div className="animate-scale-in">
          <ComboMeter combo={combo} onComboReset={onComboReset} />
        </div>
      )}
      
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

      {/* Tutorial & Leaderboard Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setShowTutorial(true)}
          variant="outline"
          size="lg"
          className="hover:bg-game-cell-hover transition-all duration-200"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Help
        </Button>
        <Button
          onClick={() => setShowLeaderboard(true)}
          variant="outline"
          size="lg"
          className="hover:bg-game-cell-hover transition-all duration-200"
        >
          <Award className="w-4 h-4 mr-1" />
          Ranks
        </Button>
      </div>

      {/* New Game Button */}
      <Button
        onClick={onNewGame}
        disabled={isLoading}
        className="w-full bg-gradient-primary hover:shadow-game transition-all duration-300 hover:scale-105 active:scale-95"
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
  );
};