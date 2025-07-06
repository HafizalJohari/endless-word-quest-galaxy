import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Star, Clock, Trophy, Gift } from 'lucide-react';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  objective: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  iconType: 'target' | 'star' | 'trophy';
}

interface DailyChallengesProps {
  onChallengeAccept: (challenge: DailyChallenge) => void;
  gameStats: {
    wordsFound: number;
    level: number;
    score: number;
    combo: number;
  };
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({
  onChallengeAccept,
  gameStats
}) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Set<string>>(new Set());

  const generateDailyChallenges = (): DailyChallenge[] => {
    const today = new Date().toDateString();
    const savedChallenges = localStorage.getItem(`dailyChallenges_${today}`);
    
    if (savedChallenges) {
      return JSON.parse(savedChallenges);
    }

    const newChallenges: DailyChallenge[] = [
      {
        id: 'words_master',
        title: 'Word Master',
        description: 'Find words quickly and efficiently',
        objective: 'Find 15 words today',
        target: 15,
        current: 0,
        reward: 500,
        completed: false,
        iconType: 'target'
      },
      {
        id: 'combo_king',
        title: 'Combo King',
        description: 'Chain your discoveries',
        objective: 'Achieve a 5x combo',
        target: 5,
        current: 0,
        reward: 300,
        completed: false,
        iconType: 'star'
      },
      {
        id: 'level_crusher',
        title: 'Level Crusher',
        description: 'Push your limits',
        objective: 'Complete 3 levels today',
        target: 3,
        current: 0,
        reward: 400,
        completed: false,
        iconType: 'trophy'
      }
    ];

    localStorage.setItem(`dailyChallenges_${today}`, JSON.stringify(newChallenges));
    return newChallenges;
  };

  useEffect(() => {
    setChallenges(generateDailyChallenges());
  }, []);

  useEffect(() => {
    // Update challenge progress based on game stats
    setChallenges(prev => {
      const updated = prev.map(challenge => {
        let newCurrent = challenge.current;
        
        switch (challenge.id) {
          case 'words_master':
            newCurrent = gameStats.wordsFound;
            break;
          case 'combo_king':
            newCurrent = Math.max(newCurrent, gameStats.combo);
            break;
          case 'level_crusher':
            newCurrent = gameStats.level;
            break;
        }

        const completed = newCurrent >= challenge.target;
        
        return {
          ...challenge,
          current: Math.min(newCurrent, challenge.target),
          completed
        };
      });

      // Save updated challenges
      const today = new Date().toDateString();
      localStorage.setItem(`dailyChallenges_${today}`, JSON.stringify(updated));
      
      return updated;
    });
  }, [gameStats]);

  const handleAcceptChallenge = (challenge: DailyChallenge) => {
    setActiveChallenges(prev => new Set([...prev, challenge.id]));
    onChallengeAccept(challenge);
  };

  const getTimeRemaining = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const diff = tomorrow.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'target': return <Target className="w-5 h-5" />;
      case 'star': return <Star className="w-5 h-5" />;
      case 'trophy': return <Trophy className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalRewards = challenges.reduce((sum, c) => sum + (c.completed ? c.reward : 0), 0);

  return (
    <Card className="challenge-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Daily Challenges</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress Today</span>
          <span className="text-sm text-accent">{completedCount}/{challenges.length}</span>
        </div>
        <Progress value={(completedCount / challenges.length) * 100} className="h-2" />
        {totalRewards > 0 && (
          <div className="flex items-center gap-1 mt-2 text-sm text-accent">
            <Gift className="w-4 h-4" />
            <span>+{totalRewards} bonus points earned!</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              challenge.completed
                ? 'bg-secondary/10 border-secondary/20 shadow-sm'
                : activeChallenges.has(challenge.id)
                ? 'bg-accent/10 border-accent/20 shadow-sm'
                : 'bg-muted/30 border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                challenge.completed 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-accent text-accent-foreground'
              }`}>
                {getIcon(challenge.iconType)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{challenge.title}</h4>
                    {challenge.completed && (
                      <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                        Complete!
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  <p className="text-sm font-medium text-accent">{challenge.objective}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.current}/{challenge.target}</span>
                  </div>
                  <Progress 
                    value={(challenge.current / challenge.target) * 100} 
                    className="h-1.5" 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-accent font-medium">
                    Reward: +{challenge.reward} points
                  </span>
                  {!challenge.completed && !activeChallenges.has(challenge.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcceptChallenge(challenge)}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      Accept
                    </Button>
                  )}
                  {activeChallenges.has(challenge.id) && !challenge.completed && (
                    <Badge variant="outline" className="bg-accent/10 text-accent">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};