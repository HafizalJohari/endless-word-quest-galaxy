import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Star, Palette, Zap, Lock, Check } from 'lucide-react';

interface Milestone {
  level: number;
  title: string;
  description: string;
  reward: 'powerup' | 'theme' | 'special';
  rewardName: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface ProgressionSystemProps {
  currentLevel: number;
  totalScore: number;
  onThemeChange?: (theme: string) => void;
}

export const ProgressionSystem: React.FC<ProgressionSystemProps> = ({
  currentLevel,
  totalScore,
  onThemeChange
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newUnlocks, setNewUnlocks] = useState<Milestone[]>([]);

  const createMilestones = (): Milestone[] => [
    {
      level: 3,
      title: 'First Steps',
      description: 'Complete 3 levels',
      reward: 'powerup',
      rewardName: 'Hint System',
      icon: <Zap className="w-4 h-4" />,
      unlocked: currentLevel >= 3
    },
    {
      level: 5,
      title: 'Word Hunter',
      description: 'Reach level 5',
      reward: 'theme',
      rewardName: 'Ocean Theme',
      icon: <Palette className="w-4 h-4" />,
      unlocked: currentLevel >= 5
    },
    {
      level: 10,
      title: 'Puzzle Master',
      description: 'Conquer 10 levels',
      reward: 'powerup',
      rewardName: 'Time Freeze',
      icon: <Star className="w-4 h-4" />,
      unlocked: currentLevel >= 10
    },
    {
      level: 15,
      title: 'Explorer',
      description: 'Journey to level 15',
      reward: 'theme',
      rewardName: 'Space Theme',
      icon: <Palette className="w-4 h-4" />,
      unlocked: currentLevel >= 15
    },
    {
      level: 25,
      title: 'Legend',
      description: 'Achieve level 25',
      reward: 'special',
      rewardName: 'Golden Badge',
      icon: <Gift className="w-4 h-4" />,
      unlocked: currentLevel >= 25
    }
  ];

  useEffect(() => {
    const previousMilestones = milestones;
    const updatedMilestones = createMilestones();
    setMilestones(updatedMilestones);

    // Check for new unlocks
    if (previousMilestones.length > 0) {
      const newlyUnlocked = updatedMilestones.filter(milestone => 
        milestone.unlocked && 
        !previousMilestones.find(prev => prev.level === milestone.level && prev.unlocked)
      );
      if (newlyUnlocked.length > 0) {
        setNewUnlocks(newlyUnlocked);
        setTimeout(() => setNewUnlocks([]), 3000);
      }
    }
  }, [currentLevel]);

  const getProgressToNext = () => {
    const nextMilestone = milestones.find(m => !m.unlocked);
    if (!nextMilestone) return 100;
    return (currentLevel / nextMilestone.level) * 100;
  };

  const getNextMilestone = () => {
    return milestones.find(m => !m.unlocked);
  };

  return (
    <div className="space-y-4">
      <Card className="card-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Progression</h3>
          <Badge variant="outline" className="bg-primary text-primary-foreground border-primary/20">
            Level {currentLevel}
          </Badge>
        </div>
        
        {getNextMilestone() && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next: {getNextMilestone()?.title}</span>
              <span>{currentLevel}/{getNextMilestone()?.level}</span>
            </div>
            <Progress value={getProgressToNext()} className="h-2" />
          </div>
        )}
      </Card>

      <Card className="milestone-card p-4">
        <h3 className="font-semibold text-foreground mb-3">Milestones</h3>
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.level}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                milestone.unlocked 
                  ? 'bg-secondary/10 border-secondary/20 shadow-sm' 
                  : 'bg-muted/50 border-border'
              }`}
            >
              <div className={`p-2 rounded-full ${
                milestone.unlocked ? 'bg-secondary' : 'bg-muted'
              }`}>
                {milestone.unlocked ? (
                  <Check className="w-4 h-4 text-secondary-foreground" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${
                    milestone.unlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {milestone.title}
                  </h4>
                  {milestone.unlocked && milestone.icon}
                </div>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                <p className="text-xs text-accent font-medium">
                  Reward: {milestone.rewardName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Unlock Notifications */}
      {newUnlocks.map((unlock) => (
        <div
          key={`unlock-${unlock.level}`}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in"
        >
          <Card className="card-elevated p-6 min-w-[300px]">
            <div className="text-center space-y-3">
              <div className="bg-gradient-primary text-primary-foreground p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-game">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent">Milestone Unlocked!</h3>
                <p className="text-lg font-semibold text-foreground">{unlock.title}</p>
                <p className="text-sm text-muted-foreground">{unlock.rewardName}</p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};