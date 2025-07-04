// Power-up system type definitions

export type PowerupType = 'hint' | 'time-saver' | 'shuffle';

export interface Powerup {
  id: PowerupType;
  name: string;
  description: string;
  icon: string;
  cooldownMs: number;
  cost: number; // Points required to unlock
}

export interface PowerupState {
  id: PowerupType;
  isAvailable: boolean;
  isOnCooldown: boolean;
  cooldownEndTime: number;
  usageCount: number;
}

export interface PowerupUsageEvent {
  type: PowerupType;
  timestamp: number;
  gameLevel: number;
  wordsFoundBefore: number;
  success: boolean;
}

export const POWERUP_CONFIGS: Record<PowerupType, Powerup> = {
  hint: {
    id: 'hint',
    name: 'Hint',
    description: 'Reveals the first letter of a random unfound word',
    icon: 'lightbulb',
    cooldownMs: 30000, // 30 seconds
    cost: 100
  },
  'time-saver': {
    id: 'time-saver',
    name: 'Time Boost',
    description: 'Extends combo window by 5 seconds',
    icon: 'clock',
    cooldownMs: 45000, // 45 seconds
    cost: 150
  },
  shuffle: {
    id: 'shuffle',
    name: 'Shuffle',
    description: 'Rearranges random letters in the grid',
    icon: 'shuffle',
    cooldownMs: 60000, // 60 seconds
    cost: 200
  }
};