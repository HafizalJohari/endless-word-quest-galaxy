import React, { useEffect, useState } from 'react';
import { Star, Zap, Crown, Award } from 'lucide-react';

interface RewardPopupProps {
  points: number;
  combo: number;
  word: string;
  onComplete: () => void;
}

export const RewardPopup: React.FC<RewardPopupProps> = ({ 
  points, 
  combo, 
  word, 
  onComplete 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getBonusText = () => {
    if (combo >= 5) return 'INCREDIBLE!';
    if (combo >= 3) return 'AMAZING!';
    if (combo > 1) return 'GREAT!';
    return 'NICE!';
  };

  const getIcon = () => {
    if (combo >= 5) return Crown;
    if (combo >= 3) return Award;
    if (combo > 1) return Zap;
    return Star;
  };

  const getColorClass = () => {
    if (combo >= 5) return 'text-destructive';
    if (combo >= 3) return 'text-accent';
    return 'text-primary';
  };

  const IconComponent = getIcon();

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
      visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
    }`}>
      <div className="bg-card/95 backdrop-blur-sm border shadow-game rounded-lg p-6 text-center min-w-[200px]">
        <div className="flex justify-center mb-3">
          <IconComponent className={`w-8 h-8 ${getColorClass()} animate-bounce`} />
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            "{word.toUpperCase()}"
          </div>
          
          <div className={`text-lg font-semibold ${getColorClass()}`}>
            +{points} points
          </div>
          
          {combo > 1 && (
            <div className={`text-sm font-medium ${getColorClass()}`}>
              {combo}x Combo • {getBonusText()}
            </div>
          )}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`absolute animate-bounce ${getColorClass()}`}
              style={{
                left: `${20 + i * 12}%`,
                top: `${10 + (i % 2) * 20}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '1s'
              }}
            >
              <Star className="w-3 h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};