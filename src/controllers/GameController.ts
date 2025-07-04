// MVC Pattern: Controller layer for coordinating between Model and View
// Handles user interactions and business logic orchestration

import { GameModel, type Player, type CellPosition } from '../models/GameModel';
import { performanceMonitor } from '../lib/performance';

export interface GameControllerCallbacks {
  onWordFound?: (word: string, points: number, combo: number) => void;
  onLevelComplete?: () => void;
  onGameStateChange?: () => void;
  onError?: (error: string) => void;
}

export class GameController {
  private model: GameModel;
  private callbacks: GameControllerCallbacks = {};
  private isInitialized = false;

  constructor() {
    this.model = new GameModel();
    this.setupModelObserver();
  }

  private setupModelObserver(): void {
    this.model.subscribe(() => {
      this.callbacks.onGameStateChange?.();
    });
  }

  // Initialization and setup
  async initialize(player: Player, callbacks: GameControllerCallbacks = {}): Promise<void> {
    try {
      this.callbacks = callbacks;
      this.model.setPlayer(player);
      
      // Start performance monitoring in development
      if (process.env.NODE_ENV === 'development') {
        performanceMonitor.startMonitoring();
        
        // Log performance metrics every 5 seconds
        performanceMonitor.subscribe((metrics) => {
          const analysis = performanceMonitor.analyzePerformance();
          if (analysis.warnings.length > 0) {
            console.warn('Performance warnings:', analysis.warnings);
            console.info('Suggestions:', analysis.suggestions);
          }
        });
      }
      
      await this.generateNewGame();
      this.isInitialized = true;
    } catch (error) {
      this.callbacks.onError?.(`Failed to initialize game: ${error}`);
      throw error;
    }
  }

  // Game management
  async generateNewGame(): Promise<void> {
    if (!this.isInitialized && !this.model.getPlayer()) {
      throw new Error('Game not initialized');
    }

    try {
      await this.model.generateNewGame();
    } catch (error) {
      this.callbacks.onError?.(`Failed to generate new game: ${error}`);
      throw error;
    }
  }

  // Word validation and interaction
  handleWordSelection(selectedCells: CellPosition[]): void {
    const gameData = this.model.getGameData();
    if (!gameData || selectedCells.length === 0) return;

    // Extract word from selected cells
    const word = selectedCells
      .map(pos => gameData.grid[pos.row][pos.col])
      .join('');

    const result = this.model.validateAndScoreWord(word, selectedCells);
    
    if (result.isValid && result.foundWord && result.points && result.newCombo) {
      this.callbacks.onWordFound?.(result.foundWord, result.points, result.newCombo);
      
      // Check for level completion
      if (this.model.isLevelComplete()) {
        setTimeout(() => {
          this.handleLevelComplete();
        }, 1000); // Delay to show completion animation
      }
    }
  }

  private async handleLevelComplete(): Promise<void> {
    this.model.completeLevel();
    this.callbacks.onLevelComplete?.();
    
    // Auto-generate next level after a delay
    setTimeout(async () => {
      try {
        await this.generateNewGame();
      } catch (error) {
        this.callbacks.onError?.(`Failed to generate next level: ${error}`);
      }
    }, 2000);
  }

  // State access methods
  getGameData() {
    return this.model.getGameData();
  }

  getPlayer() {
    return this.model.getPlayer();
  }

  getStats() {
    return this.model.getStats();
  }

  getFoundWords() {
    return this.model.getFoundWords();
  }

  getFoundPaths() {
    return this.model.getFoundPaths();
  }

  getLeaderboard() {
    return this.model.getLeaderboard();
  }

  // Game actions
  resetCombo(): void {
    this.model.resetCombo();
  }

  // Performance monitoring
  getPerformanceData() {
    return this.model.getPerformanceData();
  }

  getPerformanceMetrics() {
    return performanceMonitor.getMetrics();
  }

  analyzePerformance() {
    return performanceMonitor.analyzePerformance();
  }

  // Utility methods for difficulty management
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'bg-secondary';
      case 'medium': return 'bg-accent';
      case 'hard': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '6-8 years';
      case 'medium': return '9-12 years';
      case 'hard': return '13+ years';
      default: return 'Unknown';
    }
  }

  // Progress calculation
  getProgressPercentage(): number {
    const gameData = this.getGameData();
    const foundWords = this.getFoundWords();
    
    if (!gameData || gameData.wordsToFind.length === 0) return 0;
    
    return (foundWords.size / gameData.wordsToFind.length) * 100;
  }

  // Cleanup
  cleanup(): void {
    if (process.env.NODE_ENV === 'development') {
      performanceMonitor.stopMonitoring();
    }
    this.model.cleanup();
    this.callbacks = {};
    this.isInitialized = false;
  }

  // Debug methods for development
  debug(): {
    model: any;
    performance: any;
    memoryUsage: any;
  } {
    return {
      model: {
        player: this.getPlayer(),
        stats: this.getStats(),
        gameData: this.getGameData()
      },
      performance: this.getPerformanceMetrics(),
      memoryUsage: this.getPerformanceData()
    };
  }
}

// Singleton instance for global use
export const gameController = new GameController();