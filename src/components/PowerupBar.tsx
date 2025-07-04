import React from 'react';
import { Card } from '@/components/ui/card';
import { PowerupButton } from './PowerupButton';
import { type PowerupType, type PowerupState, POWERUP_CONFIGS } from '../types/powerups';
import { Zap } from 'lucide-react';

interface PowerupBarProps {
  powerupStates: Map<PowerupType, PowerupState>;
  canUsePowerup: (powerupType: PowerupType) => boolean;
  getRemainingCooldown: (powerupType: PowerupType) => number;
  onUsePowerup: (powerupType: PowerupType) => void;
  playerScore: number;
  isProcessing: boolean;
  className?: string;
}

export const PowerupBar: React.FC<PowerupBarProps> = ({
  powerupStates,
  canUsePowerup,
  getRemainingCooldown,
  onUsePowerup,
  playerScore,
  isProcessing,
  className
}) => {
  const powerupTypes = Object.keys(POWERUP_CONFIGS) as PowerupType[];

  return (
    <Card className={`p-4 shadow-card animate-fade-in ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Power-ups</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          Score: {playerScore}
        </div>
      </div>
      
      <div className="flex gap-2 justify-between">
        {powerupTypes.map(powerupType => {
          const state = powerupStates.get(powerupType);
          if (!state) return null;

          return (
            <PowerupButton
              key={powerupType}
              powerupType={powerupType}
              state={state}
              canUse={canUsePowerup(powerupType)}
              remainingCooldown={getRemainingCooldown(powerupType)}
              playerScore={playerScore}
              onUse={onUsePowerup}
              isProcessing={isProcessing}
            />
          );
        })}
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Use power-ups to help find words faster!</p>
      </div>
    </Card>
  );
};