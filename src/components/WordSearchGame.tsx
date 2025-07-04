import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy, Target, Zap, Award, HelpCircle } from 'lucide-react';
import { WordSearchGrid } from './WordSearchGrid';
import { AgeSelection } from './AgeSelection';
import { Leaderboard } from './Leaderboard';
import { SuccessEffects } from './SuccessEffects';
import { Tutorial } from './Tutorial';
import { ComboMeter } from './ComboMeter';
import { RewardPopup } from './RewardPopup';
import { ProgressionSystem } from './ProgressionSystem';
import { DailyChallenges } from './DailyChallenges';
import { PowerupBar } from './PowerupBar';
import { useAudio } from '../hooks/useAudio';
import { usePowerups } from '../hooks/usePowerups';
import { gameController, type GameControllerCallbacks } from '../controllers/GameController';
import { type Player, type CellPosition } from '../models/GameModel';
import { type Difficulty } from '../lib/gameGenerator';
import { type PowerupType } from '../types/powerups';

interface WordSearchGameProps {
  className?: string;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [successEffect, setSuccessEffect] = useState<'word' | 'level' | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [rewardPopup, setRewardPopup] = useState<{
    points: number;
    combo: number;
    word: string;
  } | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [gameInitialized, setGameInitialized] = useState(false);
  
  const { playWordFoundSound, playComboSound, playLevelCompleteSound, playClickSound } = useAudio();

  // Controller callbacks for game events
  const controllerCallbacks = useMemo<GameControllerCallbacks>(() => ({
    onWordFound: (word: string, points: number, combo: number) => {
      setRewardPopup({ points, combo, word });
      playWordFoundSound();
      if (combo > 1) {
        setTimeout(() => playComboSound(combo), 200);
      }
      setSuccessEffect('word');
    },
    onLevelComplete: () => {
      playLevelCompleteSound();
      setSuccessEffect('level');
    },
    onGameStateChange: () => {
      // Force re-render when game state changes
      setGameInitialized(prev => !prev);
    },
    onError: (error: string) => {
      console.error('Game error:', error);
    }
  }), [playWordFoundSound, playComboSound, playLevelCompleteSound]);

  const generateNewGame = useCallback(async () => {
    setIsLoading(true);
    try {
      await gameController.generateNewGame();
    } catch (error) {
      console.error('Failed to generate game:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlayerReady = useCallback(async (playerData: Player) => {
    setIsLoading(true);
    try {
      await gameController.initialize(playerData, controllerCallbacks);
      
      // Show tutorial for first-time players
      const hasSeenTutorial = localStorage.getItem('wordSearchTutorialSeen');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
    } finally {
      setIsLoading(false);
    }
  }, [controllerCallbacks]);

  const handleWordSelection = useCallback((selectedCells: CellPosition[]) => {
    gameController.handleWordSelection(selectedCells);
  }, []);

  // Get current game state from controller
  const gameData = gameController.getGameData();
  const player = gameController.getPlayer();
  const stats = gameController.getStats();
  const foundWords = gameController.getFoundWords();
  const foundPaths = gameController.getFoundPaths();

  // Power-ups integration
  const powerupsHookData = gameData && {
    grid: gameData.grid,
    wordsToFind: gameData.wordsToFind,
    foundWords,
    playerScore: stats.score,
    gameLevel: stats.level
  };

  const {
    powerupStates,
    usePowerup,
    canUsePowerup,
    getRemainingCooldown,
    resetPowerups,
    isProcessing
  } = usePowerups({
    gameData: powerupsHookData,
    onPowerupUsed: (powerupType: PowerupType, result: any, newGrid?: string[][]) => {
      // Handle power-up effects
      if (powerupType === 'hint' && result?.word) {
        // Could show hint UI feedback here
        console.log('Hint used for word:', result.word);
      }
      
      if (newGrid) {
        // Grid was shuffled, trigger re-render
        generateNewGame();
      }
    }
  });

  // Show age selection if no player is set
  if (!player) {
    return <AgeSelection onPlayerReady={handlePlayerReady} />;
  }

  // Show loading while generating game
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
          <Card className="p-6 shadow-card rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary text-primary-foreground p-3 rounded-full shadow-game">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Word Search Infinity</h1>
                  <p className="text-muted-foreground">Theme: {gameData.theme} | Player: {player.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={gameController.getDifficultyColor(player.difficulty)}>
                  {gameController.getDifficultyLabel(player.difficulty)}
                </Badge>
                <div className="flex items-center gap-2 bg-game-grid px-3 py-2 rounded-lg">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="font-semibold">{stats.score}</span>
                </div>
                <div className="flex items-center gap-2 bg-game-grid px-3 py-2 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Level {stats.level}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-game animate-scale-in rounded-2xl">
              <WordSearchGrid
                grid={gameData.grid}
                wordsToFind={gameData.wordsToFind}
                onWordFound={handleWordSelection}
                foundWords={foundWords}
                foundPaths={foundPaths}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Words List */}
            <Card className="p-4 shadow-card animate-fade-in rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Find These Words</h3>
                <span className="text-sm text-muted-foreground">
                  {foundWords.size}/{gameData.wordsToFind.length}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameData.wordsToFind.map((word) => {
                  const isFound = foundWords.has(word);
                  
                  return (
                    <div
                      key={word}
                      className={`px-3 py-2 rounded-xl transition-all duration-300 ${
                        isFound
                          ? 'bg-secondary/20 text-muted-foreground'
                          : 'bg-game-grid text-foreground hover:bg-game-cell-hover'
                      }`}
                    >
                      <span className={`font-medium ${isFound ? 'line-through animate-pulse' : ''}`}>
                        {word.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Power-ups */}
            <PowerupBar
              powerupStates={powerupStates}
              canUsePowerup={canUsePowerup}
              getRemainingCooldown={getRemainingCooldown}
              onUsePowerup={usePowerup}
              playerScore={stats.score}
              isProcessing={isProcessing}
            />

            {/* Progression System */}
            <ProgressionSystem
              currentLevel={stats.level}
              totalScore={stats.score}
            />
            
            {/* Daily Challenges */}
            <DailyChallenges
              onChallengeAccept={(challenge) => setActiveChallenges(prev => [...prev, challenge])}
              gameStats={{
                wordsFound: stats.totalWordsFound,
                level: stats.level,
                score: stats.score,
                combo: stats.combo
              }}
            />
            
            {/* Combo Meter */}
            {stats.combo > 1 && (
              <div className="animate-scale-in">
                <ComboMeter combo={stats.combo} onComboReset={() => gameController.resetCombo()} />
              </div>
            )}

            {/* Progress */}
            <Card className="p-4 shadow-card animate-fade-in rounded-2xl">
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
                        width: `${gameController.getProgressPercentage()}%`
                      }}
                    />
                  </div>
                </div>
                
                {foundWords.size === gameData.wordsToFind.length && (
                  <div className="text-center p-3 bg-gradient-success text-secondary-foreground rounded-lg animate-word-found">
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Level Complete!</p>
                    <p className="text-sm opacity-90">Advancing to level {stats.level + 1}...</p>
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
              onClick={() => {
                playClickSound();
                generateNewGame();
              }}
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
        </div>
      </div>

      {/* Success Effects */}
      <SuccessEffects
        trigger={successEffect}
        onComplete={() => setSuccessEffect(null)}
      />

      {/* Tutorial */}
      <Tutorial
        isOpen={showTutorial}
        onComplete={() => {
          setShowTutorial(false);
          localStorage.setItem('wordSearchTutorialSeen', 'true');
        }}
        onClose={() => setShowTutorial(false)}
      />

      {/* Reward Popup */}
      {rewardPopup && (
        <RewardPopup
          points={rewardPopup.points}
          combo={rewardPopup.combo}
          word={rewardPopup.word}
          onComplete={() => setRewardPopup(null)}
        />
      )}

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
};