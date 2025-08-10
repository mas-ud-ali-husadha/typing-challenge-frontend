'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

export interface SocketUserTypingProgress {
  username: string;
  progress: number;
  currentWpm: number;
  errors: number;
}

export function ActiveTypers() {
  const [typers, setTypers] = useState<{
    [username: string]: SocketUserTypingProgress;
  }>({});
  const { socket } = useSocket();

  useEffect(() => {
    socket?.on('user_typing_progress', (data: SocketUserTypingProgress) => {
      setTypers((prev) => {
        const newUser = { ...data };
        return { ...prev, [data.username]: newUser };
      });
    });

    return () => {
      socket?.off('user_typing_progress');
    };
  }, [socket]);

  const sortedTypers = Object.entries(typers).sort(
    ([, a], [, b]) => b.currentWpm - a.currentWpm
  );

  return (
    <Card className=" h-fit shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🎯 Active Typers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedTypers.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No one is typing...
          </p>
        ) : (
          sortedTypers.map(([user, data]) => (
            <div
              key={user}
              className="flex flex-col gap-1 p-2 rounded-md hover:bg-accent transition-colors duration-150 ease-in-out"
            >
              {/* User Info Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback className="text-xs font-medium bg-muted">
                      {user.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate max-w-28">
                    {user}
                  </span>
                </div>

                <div
                  className={cn(
                    'text-xs font-bold tabular-nums',
                    data.currentWpm > 70
                      ? 'text-green-500'
                      : data.currentWpm > 40
                      ? 'text-cyan-500'
                      : 'text-yellow-500'
                  )}
                >
                  {data.currentWpm.toFixed(0)} WPM
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={data.progress}
                  className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700"
                />
                <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                  {data.progress.toFixed(0)}%
                </span>
              </div>

              {/* Error Badge */}
              {data.errors > 0 && (
                <div className="flex justify-end">
                  <span className="text-xs text-red-500 flex items-center gap-0.5">
                    ❌ {data.errors}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
