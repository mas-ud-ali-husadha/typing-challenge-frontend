'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Keyboard, Trophy } from 'lucide-react';

export function HowToPlayCards() {
  const steps = [
    {
      icon: Keyboard,
      title: '1. Start Typing',
      desc: 'Focus on the text box and begin typing the paragraph shown. Accuracy counts more than speed!',
    },
    {
      icon: Target,
      title: '2. Live Stats',
      desc: 'Your WPM, accuracy, and consistency update in real-time while you type.',
    },
    {
      icon: Trophy,
      title: '3. Climb the Board',
      desc: 'Submit your result and instantly appear on the global leaderboards. Try again to beat your best!',
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {steps.map((step, idx) => (
        <Card
          key={idx}
          className="hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-secondary/20"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <step.icon className="w-6 h-6 text-primary" />
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
