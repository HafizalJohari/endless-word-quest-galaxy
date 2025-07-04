import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Target, Search, Trophy, X } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Word Search Infinity!",
    content: "Find hidden words in the puzzle grid by selecting letters in sequence.",
    icon: Target,
    highlight: "grid"
  },
  {
    title: "How to Find Words",
    content: "Click and drag from the first letter to the last letter of a word. Words can be horizontal, vertical, or diagonal.",
    icon: Search,
    highlight: "grid"
  },
  {
    title: "Track Your Progress",
    content: "Watch your score grow and build combos by finding words quickly. Complete all words to advance to the next level!",
    icon: Trophy,
    highlight: "sidebar"
  }
];

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowOverlay(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setShowOverlay(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setShowOverlay(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${
        showOverlay ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Tutorial Card */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        showOverlay ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <Card className="w-full max-w-md p-6 shadow-game animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary text-primary-foreground p-2 rounded-full">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{step.content}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-game-grid rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="bg-gradient-primary hover:shadow-game transition-all duration-300 flex items-center gap-2"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Start Playing!' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Highlight overlay for specific areas */}
      {step.highlight && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className={`absolute border-4 border-primary/50 rounded-lg transition-all duration-500 ${
            step.highlight === 'grid' 
              ? 'top-32 left-8 right-8 lg:right-80 bottom-8' 
              : 'top-32 right-8 w-72 bottom-8'
          }`} />
        </div>
      )}
    </>
  );
};