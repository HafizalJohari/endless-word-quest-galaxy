import React, { useState, useEffect, useCallback } from 'react';
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
import { useAudio } from '../hooks/useAudio';
import { generateGameData, type GameData, type Difficulty } from '../lib/gameGenerator';

interface WordSearchGameProps {
  className?: string;
}

interface Player {
  name: string;
  age: number;
  difficulty: Difficulty;
  preferences: string[];
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ className }) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [successEffect, setSuccessEffect] = useState<'word' | 'level' | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastWordTime, setLastWordTime] = useState(0);
  const [rewardPopup, setRewardPopup] = useState<{
    points: number;
    combo: number;
    word: string;
  } | null>(null);
  const [totalWordsFound, setTotalWordsFound] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  
  const { playWordFoundSound, playComboSound, playLevelCompleteSound, playClickSound } = useAudio();

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

  useEffect(() => {
    if (player) {
      generateNewGame();
    }
  }, [generateNewGame]);

  const handlePlayerReady = useCallback((playerData: Player) => {
    setPlayer(playerData);
    // Show tutorial for first-time players
    const hasSeenTutorial = localStorage.getItem('wordSearchTutorialSeen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

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
    localStorage.setItem('wordSearchScores', JSON.stringify(existingScores.slice(0, 10))); // Keep top 10
  }, [player, score, level]);

  const handleWordFound = useCallback((word: string) => {
    if (!foundWords.has(word) && player) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(word);
      setFoundWords(newFoundWords);
      
      // Calculate combo based on timing
      const currentTime = Date.now();
      const timeDiff = currentTime - lastWordTime;
      const newCombo = timeDiff < 10000 && lastWordTime > 0 ? combo + 1 : 1; // 10 second window
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
  }, [foundWords, player, combo, lastWordTime, playWordFoundSound, playComboSound]);

  const handleLevelComplete = useCallback(() => {
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
  }, [level, player, generateNewGame, saveScore, playLevelCompleteSound]);

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
          <Card className="card-elevated p-6">
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-3">
            <Card className="card-game p-6 animate-scale-in">
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
                <ComboMeter combo={combo} onComboReset={() => setCombo(0)} />
              </div>
            )}
            
            {/* Words List */}
            <Card className="card-elevated p-4 animate-fade-in">
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
            <Card className="progress-card p-4 animate-fade-in">
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
              onClick={() => {
                playClickSound();
                generateNewGame();
                setCombo(0);
                setLastWordTime(0);
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