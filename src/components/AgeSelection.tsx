import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Baby, GraduationCap, Heart, MapPin, Plane, Dumbbell, Gamepad2, Book, Palette, Rocket } from 'lucide-react';
import { type Difficulty } from '../lib/gameGenerator';

interface AgeSelectionProps {
  onPlayerReady: (player: { name: string; age: number; difficulty: Difficulty; preferences: string[] }) => void;
}

export const AgeSelection: React.FC<AgeSelectionProps> = ({ onPlayerReady }) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [step, setStep] = useState<'basic' | 'preferences'>('basic');

  const ageRanges = [
    { value: 'easy', label: '6-8 years', icon: Baby, description: 'Perfect for young learners' },
    { value: 'medium', label: '9-12 years', icon: Users, description: 'Great for school age kids' },
    { value: 'hard', label: '13+ years', icon: GraduationCap, description: 'Challenge for teens & adults' }
  ];

  const preferences = [
    { id: 'animals', label: 'Animals', icon: Heart, color: 'bg-red-100 hover:bg-red-200 text-red-700' },
    { id: 'vacation', label: 'Vacation', icon: Plane, color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
    { id: 'location', label: 'Places', icon: MapPin, color: 'bg-green-100 hover:bg-green-200 text-green-700' },
    { id: 'sports', label: 'Sports', icon: Dumbbell, color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
    { id: 'hobby', label: 'Hobbies', icon: Gamepad2, color: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
    { id: 'school', label: 'Education', icon: Book, color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' },
    { id: 'colors', label: 'Colors', icon: Palette, color: 'bg-pink-100 hover:bg-pink-200 text-pink-700' },
    { id: 'space', label: 'Space', icon: Rocket, color: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700' }
  ];

  const togglePreference = (preferenceId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const proceedToPreferences = () => {
    setStep('preferences');
  };

  const handleAgeSubmit = () => {
    if (selectedAge && playerName.trim()) {
      const age = parseInt(selectedAge);
      let difficulty: Difficulty = 'easy';
      
      if (age >= 6 && age <= 8) difficulty = 'easy';
      else if (age >= 9 && age <= 12) difficulty = 'medium';
      else if (age >= 13) difficulty = 'hard';
      
      proceedToPreferences();
    }
  };

  const handleRangeSubmit = () => {
    if (selectedRange && playerName.trim()) {
      proceedToPreferences();
    }
  };

  const startGame = () => {
    let difficulty: Difficulty = 'easy';
    let age = 7;
    
    if (selectedAge) {
      age = parseInt(selectedAge);
      if (age >= 6 && age <= 8) difficulty = 'easy';
      else if (age >= 9 && age <= 12) difficulty = 'medium';
      else if (age >= 13) difficulty = 'hard';
    } else if (selectedRange) {
      const ageMapping = { easy: 7, medium: 10, hard: 16 };
      age = ageMapping[selectedRange as keyof typeof ageMapping];
      difficulty = selectedRange as Difficulty;
    }

    onPlayerReady({ 
      name: playerName.trim(), 
      age, 
      difficulty,
      preferences: selectedPreferences
    });
  };

  if (step === 'preferences') {
    return (
      <div className="h-screen bg-gradient-game flex items-center justify-center p-4">
        <Card className="p-8 max-w-lg w-full shadow-game animate-scale-in">
          <div className="text-center mb-6">
            <div className="bg-gradient-primary text-primary-foreground p-4 rounded-full shadow-game w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Choose Your Interests</h1>
            <p className="text-muted-foreground">Select topics you'd like to see in your word puzzles!</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">What interests you? (Select any):</Label>
              <div className="grid grid-cols-2 gap-3">
                {preferences.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => togglePreference(id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedPreferences.includes(id)
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-input hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedPreferences.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-accent/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {selectedPreferences.map(prefId => {
                    const pref = preferences.find(p => p.id === prefId);
                    return (
                      <Badge key={prefId} variant="secondary" className="text-xs">
                        {pref?.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep('basic')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={startGame}
                className="flex-1 bg-gradient-primary"
                size="lg"
              >
                Start Game!
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-game flex items-center justify-center p-4">
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
                Next
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
                Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};