'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTypingTest } from '@/hooks/useTypingTest';
import { RefreshCw, Timer, Target, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TypingTest() {
  const {
    text,
    userInput,
    wpm,
    rawWpm,
    accuracy,
    isFinished,
    isStarted,
    inputRef,
    handleInput,
    reset,
  } = useTypingTest();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isStarted && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isStarted, isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderText = () => {
    return text?.split('').map((char, index) => {
      let className = 'untyped';
      if (index < userInput.length) {
        className = userInput[index] === char ? 'correct' : 'incorrect';
      } else if (index === userInput.length) {
        className = 'bg-primary/20';
      }

      return (
        <span key={index} className={cn(className, 'transition-colors')}>
          {char}
        </span>
      );
    });
  };

  return (
    <Card className="w-full p-8  hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Typing Challenge
        </h2>
        <Button
          onClick={() => {
            reset();
            setTimeElapsed(0);
          }}
          variant="outline"
          size="lg"
          className="group flex items-center gap-2 hover:scale-105 transition-transform duration-200 hover:rotate-3"
        >
          <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
          <span>New Test</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'WPM',
            value: wpm || 0,
            icon: Zap,
            color: 'text-blue-600 dark:text-blue-400',
          },
          {
            label: 'Raw WPM',
            value: rawWpm || 0,
            icon: Activity,
            color: 'text-cyan-600 dark:text-cyan-400',
          },
          {
            label: 'Accuracy',
            value: `${accuracy || 0}%`,
            icon: Target,
            color: 'text-green-600 dark:text-green-400',
          },
          {
            label: 'Time',
            value: formatTime(timeElapsed),
            icon: Timer,
            color: 'text-orange-600 dark:text-orange-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-muted/60 to-muted p-4 rounded-xl border hover:shadow-md transition-all duration-200 text-center group"
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{userInput.length}</span>
        <Progress
          value={(userInput.length / text.length) * 100}
          className="flex-1 h-2"
        />
        <span>{text.length}</span>
      </div>
      <div className="relative">
        <div className="text-xl leading-relaxed font-mono p-2 bg-muted/30 rounded-lg select-none">
          {renderText()}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => handleInput(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          disabled={isFinished}
          autoFocus
        />
      </div>

      {isFinished && (
        <p className="text-lg text-muted-foreground">
          Great job! click restart to try again.
        </p>
      )}
    </Card>
  );
}
