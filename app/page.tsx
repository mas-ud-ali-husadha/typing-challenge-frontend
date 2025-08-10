'use client';

import { useState, useEffect } from 'react';
import { TypingTest } from '@/components/typing/TypingTest';
import { Leaderboard } from '@/components/typing/Leaderboard';
import { Statistics } from '@/components/typing/Statistics';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocket } from '@/hooks/useSocket';
import { ActiveTypers } from '@/components/typing/ActiveTypers';
import { UserProfile } from '@/components/typing/UserProfile';
import { HowToPlayCards } from '@/components/typing/HowToPlay';

export default function Home() {
  const [username, setUsername] = useState('');
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      socket?.emit('user_online', savedUsername);
    } else {
      setShowUsernameDialog(true);
    }
  }, [socket]);

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      socket?.emit('user_online', username.trim());
      setShowUsernameDialog(false);
      setRefresh((prev) => prev + 1);
    }
  };

  return (
    <main className="container px-5 md:px-0 mx-auto w-full py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-10 w-full lg:col-span-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-bold">Typing Challenge</h1>
            <p className="text-muted-foreground">
              Test your typing speed and compete globally
            </p>
          </div>
          <HowToPlayCards />
          <TypingTest />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ActiveTypers />
            <div className="lg:col-span-2">
              <Statistics />
            </div>
          </div>
        </div>
        <div className="flex md:flex-row lg:flex-col gap-8 ">
          <UserProfile key={refresh} />
          <Leaderboard />
        </div>
      </div>

      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Welcome to Typing Challenge</DialogTitle>
            <DialogDescription>
              Choose a username to start competing with others
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                placeholder="Enter your username"
                maxLength={20}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUsernameSubmit} disabled={!username.trim()}>
              Start Typing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
