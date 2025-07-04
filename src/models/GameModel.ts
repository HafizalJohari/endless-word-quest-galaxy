// MVC Pattern: Model layer for game state management
// Separates business logic from UI components

import { WordTrie, createWordValidator } from '../lib/wordValidation';
import { generateGameData, type GameData, type Difficulty } from '../lib/gameGenerator';
import { PowerupSystem } from '../lib/powerupSystem';
import { type PowerupType } from '../types/powerups';

export interface Player {
  name: string;
  age: number;
  difficulty: Difficulty;
  preferences: string[];
}

export interface GameScore {
  name: string;
  age: number;
  difficulty: Difficulty;
  score: number;
  level: number;
  date: string;
}

export interface GameStats {
  wordsFound: number;
  level: number;
  score: number;
  combo: number;
  totalWordsFound: number;
  currentStreak: number;
  bestStreak: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export class GameModel {
  private gameData: GameData | null = null;
  private foundWords: Set<string> = new Set();
  private foundPaths: Map<string, CellPosition[]> = new Map();
  private wordValidator: WordTrie | null = null;
  private player: Player | null = null;
  private stats: GameStats = {
    wordsFound: 0,
    level: 1,
    score: 0,
    combo: 0,
    totalWordsFound: 0,
    currentStreak: 0,
    bestStreak: 0
  };
  private lastWordTime = 0;
  private observers: Array<() => void> = [];
  private powerupSystem: PowerupSystem = new PowerupSystem();
  private comboTimeExtension = 0;

  // Observable pattern for state changes
  subscribe(callback: () => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback());
  }

  // Player management
  setPlayer(player: Player): void {
    this.player = player;
    this.loadPlayerStats();
    this.notifyObservers();
  }

  getPlayer(): Player | null {
    return this.player;
  }

  private loadPlayerStats(): void {
    if (!this.player) return;
    
    const savedStats = localStorage.getItem(`gameStats_${this.player.name}`);
    if (savedStats) {
      this.stats = { ...this.stats, ...JSON.parse(savedStats) };
    }
  }

  private savePlayerStats(): void {
    if (!this.player) return;
    
    localStorage.setItem(`gameStats_${this.player.name}`, JSON.stringify(this.stats));
  }

  // Game data management
  async generateNewGame(): Promise<void> {
    if (!this.player) throw new Error('Player not set');
    
    this.gameData = await generateGameData(this.player.difficulty, this.player.preferences);
    this.foundWords.clear();
    this.foundPaths.clear();
    
    // Create optimized word validator
    this.wordValidator = createWordValidator(this.gameData.wordsToFind);
    
    // Reset power-ups for new game
    this.powerupSystem.reset();
    this.comboTimeExtension = 0;
    
    this.notifyObservers();
  }

  getGameData(): GameData | null {
    return this.gameData;
  }

  getFoundWords(): Set<string> {
    return new Set(this.foundWords);
  }

  getFoundPaths(): Map<string, CellPosition[]> {
    return new Map(this.foundPaths);
  }

  // Word validation and scoring
  validateAndScoreWord(word: string, path: CellPosition[]): {
    isValid: boolean;
    foundWord?: string;
    points?: number;
    newCombo?: number;
  } {
    if (!this.wordValidator || this.foundWords.has(word)) {
      return { isValid: false };
    }

    // Use optimized Trie for word validation
    const foundWord = this.wordValidator.searchBidirectional(word);
    
    if (!foundWord) {
      return { isValid: false };
    }

    // Calculate scoring with combo system (with power-up extension)
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastWordTime;
    const comboWindow = 10000 + this.comboTimeExtension; // Base 10s + power-up extension
    const newCombo = timeDiff < comboWindow && this.lastWordTime > 0 ? this.stats.combo + 1 : 1;
    
    const basePoints = foundWord.length * 10;
    const difficultyMultiplier = this.getDifficultyMultiplier();
    const comboMultiplier = newCombo > 1 ? 1 + (newCombo - 1) * 0.5 : 1;
    const points = Math.round(basePoints * difficultyMultiplier * comboMultiplier);

    // Update game state
    this.foundWords.add(foundWord);
    this.foundPaths.set(foundWord, path);
    this.stats.score += points;
    this.stats.combo = newCombo;
    this.stats.wordsFound++;
    this.stats.totalWordsFound++;
    this.lastWordTime = currentTime;

    // Update streak tracking
    this.stats.currentStreak++;
    if (this.stats.currentStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.currentStreak;
    }

    this.savePlayerStats();
    this.notifyObservers();

    return { isValid: true, foundWord, points, newCombo };
  }

  private getDifficultyMultiplier(): number {
    if (!this.player) return 1;
    
    switch (this.player.difficulty) {
      case 'easy': return 1;
      case 'medium': return 1.5;
      case 'hard': return 2;
      default: return 1;
    }
  }

  // Level progression
  isLevelComplete(): boolean {
    return this.gameData ? this.foundWords.size === this.gameData.wordsToFind.length : false;
  }

  completeLevel(): void {
    this.stats.level++;
    this.stats.combo = 0;
    this.stats.currentStreak = 0;
    this.lastWordTime = 0;
    this.comboTimeExtension = 0;
    
    // Auto-increase difficulty every 3 levels
    if (this.stats.level % 3 === 0 && this.player) {
      if (this.player.difficulty === 'easy') {
        this.player.difficulty = 'medium';
      } else if (this.player.difficulty === 'medium') {
        this.player.difficulty = 'hard';
      }
    }
    
    this.saveScore();
    this.savePlayerStats();
    this.notifyObservers();
  }

  // Statistics and scoring
  getStats(): GameStats {
    return { ...this.stats };
  }

  resetCombo(): void {
    this.stats.combo = 0;
    this.stats.currentStreak = 0;
    this.comboTimeExtension = 0;
    this.notifyObservers();
  }

  // Leaderboard management
  private saveScore(): void {
    if (!this.player) return;
    
    const scoreData: GameScore = {
      name: this.player.name,
      age: this.player.age,
      difficulty: this.player.difficulty,
      score: this.stats.score,
      level: this.stats.level,
      date: new Date().toISOString()
    };
    
    const existingScores = JSON.parse(localStorage.getItem('wordSearchScores') || '[]');
    existingScores.push(scoreData);
    existingScores.sort((a: GameScore, b: GameScore) => b.score - a.score);
    localStorage.setItem('wordSearchScores', JSON.stringify(existingScores.slice(0, 10)));
  }

  getLeaderboard(): GameScore[] {
    return JSON.parse(localStorage.getItem('wordSearchScores') || '[]');
  }

  // Performance monitoring integration
  getPerformanceData(): {
    wordValidatorMemory: { nodeCount: number; wordCount: number } | null;
    gameStateSize: number;
  } {
    const wordValidatorMemory = this.wordValidator?.getMemoryUsage() || null;
    const gameStateSize = JSON.stringify({
      gameData: this.gameData,
      foundWords: Array.from(this.foundWords),
      stats: this.stats
    }).length;

    return { wordValidatorMemory, gameStateSize };
  }

  // Power-up system integration
  getPowerupSystem(): PowerupSystem {
    return this.powerupSystem;
  }

  usePowerup(powerupType: PowerupType): { success: boolean; result?: any; newGrid?: string[][] } {
    if (!this.gameData) return { success: false };

    const result = this.powerupSystem.usePowerup(powerupType, {
      grid: this.gameData.grid,
      wordsToFind: this.gameData.wordsToFind,
      foundWords: this.foundWords,
      playerScore: this.stats.score,
      gameLevel: this.stats.level
    });

    if (result.success) {
      // Handle specific power-up effects
      if (powerupType === 'time-saver' && result.result?.comboExtension) {
        this.comboTimeExtension += result.result.comboExtension;
      }
      
      if (powerupType === 'shuffle' && result.newGrid) {
        // Update grid with shuffled version
        this.gameData.grid = result.newGrid;
      }

      this.notifyObservers();
    }

    return result;
  }

  // Cleanup for memory management
  cleanup(): void {
    this.gameData = null;
    this.foundWords.clear();
    this.foundPaths.clear();
    this.wordValidator = null;
    this.observers = [];
  }
}