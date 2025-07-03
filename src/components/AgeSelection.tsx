import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Users, Baby, GraduationCap } from 'lucide-react';
import { type Difficulty } from '../lib/gameGenerator';

interface AgeSelectionProps {
  onPlayerReady: (player: { name: string; age: number; difficulty: Difficulty }) => void;
}

export const AgeSelection: React.FC<AgeSelectionProps> = ({ onPlayerReady }) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<string>('');

  const ageRanges = [
    { value: 'easy', label: '6-8 years', icon: Baby, description: 'Perfect for young learners' },
    { value: 'medium', label: '9-12 years', icon: Users, description: 'Great for school age kids' },
    { value: 'hard', label: '13+ years', icon: GraduationCap, description: 'Challenge for teens & adults' }
  ];

  const handleAgeSubmit = () => {
    if (selectedAge && playerName.trim()) {
      const age = parseInt(selectedAge);
      let difficulty: Difficulty = 'easy';
      
      if (age >= 6 && age <= 8) difficulty = 'easy';
      else if (age >= 9 && age <= 12) difficulty = 'medium';
      else if (age >= 13) difficulty = 'hard';
      
      onPlayerReady({ name: playerName.trim(), age, difficulty });
    }
  };

  const handleRangeSubmit = () => {
    if (selectedRange && playerName.trim()) {
      const ageMapping = { easy: 7, medium: 10, hard: 16 };
      onPlayerReady({ 
        name: playerName.trim(), 
        age: ageMapping[selectedRange as keyof typeof ageMapping], 
        difficulty: selectedRange as Difficulty 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full shadow-game animate-scale-in">
        <div className="text-center mb-6">
          <div className="bg-gradient-primary text-primary-foreground p-4 rounded-full shadow-game w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Word Search Infinity</h1>
          <p className="text-muted-foreground">Let's find the perfect difficulty for you!</p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-semibold">Enter your name:</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Age Input Option */}
          <div className="space-y-3">
            <Label htmlFor="age" className="text-base font-semibold">Enter your age:</Label>
            <div className="flex gap-2">
              <Input
                id="age"
                type="number"
                min="6"
                max="99"
                placeholder="e.g., 10"
                value={selectedAge}
                onChange={(e) => {
                  setSelectedAge(e.target.value);
                  setSelectedRange('');
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleAgeSubmit}
                disabled={!selectedAge || parseInt(selectedAge) < 6 || !playerName.trim()}
                className="bg-gradient-primary"
              >
                Start Game
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">or choose</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Age Range Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select your age group:</Label>
            <RadioGroup value={selectedRange} onValueChange={(value) => {
              setSelectedRange(value);
              setSelectedAge('');
            }}>
              {ageRanges.map(({ value, label, icon: Icon, description }) => (
                <div key={value} className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={value} id={value} />
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <Label htmlFor={value} className="font-medium cursor-pointer">{label}</Label>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
            
            {selectedRange && (
              <Button 
                onClick={handleRangeSubmit}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-primary mt-4"
                size="lg"
              >
                Start Game
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};