import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Flame } from 'lucide-react';

interface ComboMeterProps {
  combo: number;
  onComboReset: () => void;
}

export const ComboMeter: React.FC<ComboMeterProps> = ({ combo, onComboReset }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMultiplier, setShowMultiplier] = useState(false);

  useEffect(() => {
    if (combo > 1) {
      setIsAnimating(true);
      setShowMultiplier(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    } else {
      setShowMultiplier(false);
    }
  }, [combo]);

  useEffect(() => {
    if (combo === 0) {
      const timer = setTimeout(() => setShowMultiplier(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  const getComboColor = () => {
    if (combo >= 5) return 'text-destructive';
    if (combo >= 3) return 'text-accent';
    return 'text-primary';
  };

  const getComboBackground = () => {
    if (combo >= 5) return 'bg-destructive/10 border-destructive/20';
    if (combo >= 3) return 'bg-accent/10 border-accent/20';
    return 'bg-primary/10 border-primary/20';
  };

  if (!showMultiplier) return null;

  return (
    <Card className={`p-3 transition-all duration-300 ${getComboBackground()} ${
      isAnimating ? 'animate-scale-in' : ''
    }`}>
      <div className="flex items-center gap-2">
        {combo >= 5 ? (
          <Flame className={`w-5 h-5 ${getComboColor()} animate-pulse`} />
        ) : (
          <Zap className={`w-5 h-5 ${getComboColor()}`} />
        )}
        <div className="flex flex-col">
          <span className={`text-lg font-bold ${getComboColor()}`}>
            {combo}x Combo!
          </span>
          <span className="text-xs text-muted-foreground">
            {combo >= 5 ? 'ON FIRE!' : combo >= 3 ? 'Great streak!' : 'Keep going!'}
          </span>
        </div>
      </div>
      
      {/* Combo meter bar */}
      <div className="mt-2 w-full bg-game-grid rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-500 ${
            combo >= 5 ? 'bg-destructive' : combo >= 3 ? 'bg-accent' : 'bg-primary'
          }`}
          style={{ width: `${Math.min((combo / 10) * 100, 100)}%` }}
        />
      </div>
    </Card>
  );
};