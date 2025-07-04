// Power-up system logic and balance mechanics

import { type PowerupType, type PowerupState, type PowerupUsageEvent, POWERUP_CONFIGS } from '../types/powerups';
import { type CellPosition } from '../models/GameModel';

export class PowerupSystem {
  private powerupStates: Map<PowerupType, PowerupState> = new Map();
  private usageHistory: PowerupUsageEvent[] = [];

  constructor() {
    this.initializePowerups();
  }

  private initializePowerups(): void {
    Object.keys(POWERUP_CONFIGS).forEach(powerupId => {
      this.powerupStates.set(powerupId as PowerupType, {
        id: powerupId as PowerupType,
        isAvailable: true,
        isOnCooldown: false,
        cooldownEndTime: 0,
        usageCount: 0
      });
    });
  }

  // Check if player has enough points to use powerup
  canUsePowerup(powerupType: PowerupType, playerScore: number): boolean {
    const config = POWERUP_CONFIGS[powerupType];
    const state = this.powerupStates.get(powerupType);
    
    if (!state || !config) return false;
    
    const now = Date.now();
    const isOffCooldown = now >= state.cooldownEndTime;
    const hasEnoughPoints = playerScore >= config.cost;
    
    return state.isAvailable && isOffCooldown && hasEnoughPoints;
  }

  // Use a powerup and trigger its effect
  usePowerup(
    powerupType: PowerupType, 
    gameData: {
      grid: string[][];
      wordsToFind: string[];
      foundWords: Set<string>;
      playerScore: number;
      gameLevel: number;
    }
  ): { success: boolean; result?: any; newGrid?: string[][] } {
    if (!this.canUsePowerup(powerupType, gameData.playerScore)) {
      return { success: false };
    }

    const state = this.powerupStates.get(powerupType)!;
    const config = POWERUP_CONFIGS[powerupType];
    
    // Set cooldown
    state.isOnCooldown = true;
    state.cooldownEndTime = Date.now() + config.cooldownMs;
    state.usageCount++;

    // Track usage
    this.usageHistory.push({
      type: powerupType,
      timestamp: Date.now(),
      gameLevel: gameData.gameLevel,
      wordsFoundBefore: gameData.foundWords.size,
      success: true
    });

    // Execute powerup effect
    let result: any;
    let newGrid: string[][] | undefined;

    switch (powerupType) {
      case 'hint':
        result = this.executeHint(gameData.wordsToFind, gameData.foundWords, gameData.grid);
        break;
      case 'time-saver':
        result = this.executeTimeSaver();
        break;
      case 'shuffle':
        newGrid = this.executeShuffle(gameData.grid);
        result = { gridShuffled: true };
        break;
    }

    return { success: true, result, newGrid };
  }

  private executeHint(wordsToFind: string[], foundWords: Set<string>, grid: string[][]): { word: string; position: CellPosition } | null {
    const unfoundWords = wordsToFind.filter(word => !foundWords.has(word));
    if (unfoundWords.length === 0) return null;

    const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    const position = this.findWordPosition(randomWord, grid);
    
    return position ? { word: randomWord, position } : null;
  }

  private executeTimeSaver(): { comboExtension: number } {
    return { comboExtension: 5000 }; // 5 second extension
  }

  private executeShuffle(grid: string[][]): string[][] {
    const newGrid = grid.map(row => [...row]);
    const positions: CellPosition[] = [];
    
    // Collect all positions
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        positions.push({ row, col });
      }
    }

    // Shuffle 30% of positions
    const shuffleCount = Math.floor(positions.length * 0.3);
    for (let i = 0; i < shuffleCount; i++) {
      const pos1 = positions[Math.floor(Math.random() * positions.length)];
      const pos2 = positions[Math.floor(Math.random() * positions.length)];
      
      // Swap letters
      const temp = newGrid[pos1.row][pos1.col];
      newGrid[pos1.row][pos1.col] = newGrid[pos2.row][pos2.col];
      newGrid[pos2.row][pos2.col] = temp;
    }

    return newGrid;
  }

  private findWordPosition(word: string, grid: string[][]): CellPosition | null {
    const upperWord = word.toUpperCase();
    
    // Search in all directions
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === upperWord[0]) {
          return { row, col };
        }
      }
    }
    
    return null;
  }

  // Get current state of all powerups
  getPowerupStates(): Map<PowerupType, PowerupState> {
    const now = Date.now();
    
    // Update cooldown status
    this.powerupStates.forEach(state => {
      if (state.isOnCooldown && now >= state.cooldownEndTime) {
        state.isOnCooldown = false;
      }
    });

    return new Map(this.powerupStates);
  }

  // Get usage analytics
  getUsageAnalytics(): {
    totalUsage: number;
    usageByType: Record<PowerupType, number>;
    averageTimeBetweenUsage: number;
  } {
    const usageByType = {} as Record<PowerupType, number>;
    Object.keys(POWERUP_CONFIGS).forEach(type => {
      usageByType[type as PowerupType] = 0;
    });

    this.usageHistory.forEach(event => {
      usageByType[event.type]++;
    });

    const totalUsage = this.usageHistory.length;
    const averageTimeBetweenUsage = totalUsage > 1 
      ? (this.usageHistory[totalUsage - 1].timestamp - this.usageHistory[0].timestamp) / (totalUsage - 1)
      : 0;

    return { totalUsage, usageByType, averageTimeBetweenUsage };
  }

  // Reset powerups (for new game)
  reset(): void {
    this.initializePowerups();
  }
}