import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { AgeSelection } from './AgeSelection';
import { Leaderboard } from './Leaderboard';
import { SuccessEffects } from './SuccessEffects';
import { Tutorial } from './Tutorial';
import { RewardPopup } from './RewardPopup';
import { GameHeader } from './GameHeader';
import { GameSidebar } from './GameSidebar';
import { GameGrid } from './GameGrid';
import { useGameState } from '../hooks/useGameState';
import { useGameEffects } from '../hooks/useGameEffects';
import { useAudio } from '../hooks/useAudio';
import type { Difficulty } from '../lib/gameGenerator';

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
  const [player, setPlayer] = useState<Player | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  
  const { playClickSound } = useAudio();
  
  const {
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
  } = useGameState(player);
  
  const {
    successEffect,
    setSuccessEffect,
    combo,
    rewardPopup,
    setRewardPopup,
    handleWordFound,
    handleLevelComplete,
    resetCombo
  } = useGameEffects();


  const handlePlayerReady = useCallback((playerData: Player) => {
    setPlayer(playerData);
    // Show tutorial for first-time players
    const hasSeenTutorial = localStorage.getItem('wordSearchTutorialSeen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);


  const onWordFound = useCallback((word: string) => {
    handleWordFound(word, foundWords, setFoundWords, player, setScore, setTotalWordsFound);
  }, [handleWordFound, foundWords, setFoundWords, player, setScore, setTotalWordsFound]);

  const onLevelComplete = useCallback(() => {
    handleLevelComplete(level, setLevel, player, setPlayer, saveScore, generateNewGame);
  }, [handleLevelComplete, level, setLevel, player, setPlayer, saveScore, generateNewGame]);

  useEffect(() => {
    if (gameData && foundWords.size === gameData.wordsToFind.length) {
      setTimeout(onLevelComplete, 1000);
    }
  }, [foundWords.size, gameData, onLevelComplete]);

  const handleNewGame = useCallback(() => {
    playClickSound();
    generateNewGame();
    resetCombo();
  }, [playClickSound, generateNewGame, resetCombo]);

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
        <GameHeader
          player={player}
          score={score}
          level={level}
          theme={gameData.theme}
        />

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-3">
            <GameGrid
              gameData={gameData}
              foundWords={foundWords}
              onWordFound={onWordFound}
            />
          </div>

          {/* Sidebar */}
          <GameSidebar
            level={level}
            score={score}
            combo={combo}
            totalWordsFound={totalWordsFound}
            gameData={gameData}
            foundWords={foundWords}
            activeChallenges={activeChallenges}
            setActiveChallenges={setActiveChallenges}
            setShowTutorial={setShowTutorial}
            setShowLeaderboard={setShowLeaderboard}
            onNewGame={handleNewGame}
            onComboReset={resetCombo}
            isLoading={isLoading}
          />
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