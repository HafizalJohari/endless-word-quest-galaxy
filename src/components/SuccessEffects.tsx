import React, { useEffect, useState } from 'react';
import { Sparkles, Star, Trophy } from 'lucide-react';

interface SuccessEffectsProps {
  trigger: 'word' | 'level' | null;
  onComplete: () => void;
}

export const SuccessEffects: React.FC<SuccessEffectsProps> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      // Generate particles
      const newParticles = Array.from({ length: trigger === 'level' ? 20 : 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 500
      }));
      setParticles(newParticles);

      // Clear effects after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, trigger === 'level' ? 3000 : 1500);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: trigger === 'level' ? '2s' : '1s'
          }}
        >
          {trigger === 'level' ? (
            <Trophy className="w-6 h-6 text-yellow-400 animate-spin" />
          ) : (
            <Star className="w-4 h-4 text-primary animate-pulse" />
          )}
        </div>
      ))}

      {/* Central celebration */}
      {trigger === 'level' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-primary text-primary-foreground p-8 rounded-full shadow-game animate-scale-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 animate-pulse" />
              <span className="text-2xl font-bold">Level Complete!</span>
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Word found effect */}
      {trigger === 'word' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-success text-secondary-foreground px-6 py-3 rounded-full shadow-game animate-scale-in">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 animate-pulse" />
              <span className="font-bold">Word Found!</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen flash for level complete */}
      {trigger === 'level' && (
        <div className="absolute inset-0 bg-gradient-primary/20 animate-pulse" />
      )}
    </div>
  );
};