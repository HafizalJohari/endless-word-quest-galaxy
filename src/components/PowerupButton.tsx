import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, Shuffle } from 'lucide-react';
import { type PowerupType, type PowerupState, POWERUP_CONFIGS } from '../types/powerups';

interface PowerupButtonProps {
  powerupType: PowerupType;
  state: PowerupState;
  canUse: boolean;
  remainingCooldown: number;
  playerScore: number;
  onUse: (powerupType: PowerupType) => void;
  isProcessing: boolean;
}

const PowerupIcons = {
  hint: Lightbulb,
  'time-saver': Clock,
  shuffle: Shuffle
};

export const PowerupButton: React.FC<PowerupButtonProps> = ({
  powerupType,
  state,
  canUse,
  remainingCooldown,
  playerScore,
  onUse,
  isProcessing
}) => {
  const config = POWERUP_CONFIGS[powerupType];
  const Icon = PowerupIcons[powerupType];
  
  const isDisabled = !canUse || state.isOnCooldown || isProcessing || playerScore < config.cost;
  const cooldownSeconds = Math.ceil(remainingCooldown / 1000);

  const getButtonVariant = () => {
    if (isDisabled) return 'outline';
    return 'default';
  };

  const getButtonColor = () => {
    if (powerupType === 'hint') return 'text-yellow-600';
    if (powerupType === 'time-saver') return 'text-blue-600';
    if (powerupType === 'shuffle') return 'text-purple-600';
    return 'text-primary';
  };

  return (
    <div className="relative">
      <Button
        onClick={() => onUse(powerupType)}
        disabled={isDisabled}
        variant={getButtonVariant()}
        size="sm"
        className={`flex flex-col items-center gap-1 h-auto p-3 min-w-[80px] transition-all duration-200 ${
          canUse && !state.isOnCooldown ? 'hover:scale-105' : ''
        }`}
        title={config.description}
      >
        <Icon className={`w-5 h-5 ${getButtonColor()}`} />
        <span className="text-xs font-medium">{config.name}</span>
        
        {playerScore < config.cost && (
          <Badge variant="destructive" className="text-xs px-1 py-0">
            {config.cost}
          </Badge>
        )}
      </Button>
      
      {state.isOnCooldown && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <span className="text-xs font-bold text-muted-foreground">
            {cooldownSeconds}s
          </span>
        </div>
      )}
      
      {state.usageCount > 0 && !state.isOnCooldown && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          {state.usageCount}
        </Badge>
      )}
    </div>
  );
};