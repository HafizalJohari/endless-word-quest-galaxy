import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Zap, X, Share, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Difficulty } from '../lib/gameGenerator';

interface ScoreEntry {
  name: string;
  age: number;
  difficulty: Difficulty;
  score: number;
  level: number;
  date: string;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const savedScores = JSON.parse(localStorage.getItem('wordSearchScores') || '[]');
      setScores(savedScores);
    }
  }, [isOpen]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
    }
  };

  const shareScore = (entry: ScoreEntry, platform: 'whatsapp' | 'facebook' | 'copy') => {
    const message = `🎯 I just scored ${entry.score} points in Word Search Infinity! Reached level ${entry.level} on ${entry.difficulty} difficulty. Can you beat my score? 🏆`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(message).then(() => {
          toast({
            title: "Score copied!",
            description: "Your score has been copied to clipboard.",
          });
        });
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-game animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary text-primary-foreground p-3 rounded-full shadow-game">
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No scores yet. Play your first game!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((entry, index) => (
                <div
                  key={`${entry.name}-${entry.date}`}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                    index < 3
                      ? 'bg-gradient-to-r from-accent/20 to-primary/10 border border-primary/20'
                      : 'bg-game-grid'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(index)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{entry.name}</h3>
                        <span className="text-sm text-muted-foreground">({entry.age}y)</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${getDifficultyColor(entry.difficulty)}`}>
                          {entry.difficulty.toUpperCase()}
                        </span>
                        <span className="text-muted-foreground">
                          Level {entry.level}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 text-xl font-bold text-accent">
                        <Zap className="w-5 h-5" />
                        {entry.score}
                      </div>
                      
                      {/* Share buttons */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareScore(entry, 'whatsapp')}
                          className="hover:bg-green-100 hover:text-green-600 p-1 h-8 w-8"
                          title="Share on WhatsApp"
                        >
                          <Share className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareScore(entry, 'facebook')}
                          className="hover:bg-blue-100 hover:text-blue-600 p-1 h-8 w-8"
                          title="Share on Facebook"
                        >
                          <Facebook className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareScore(entry, 'copy')}
                          className="hover:bg-accent/20 hover:text-accent p-1 h-8 w-8"
                          title="Copy to clipboard"
                        >
                          <X className="w-3 h-3 rotate-45" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};