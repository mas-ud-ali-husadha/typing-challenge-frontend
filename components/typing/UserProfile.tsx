'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSocket } from '@/hooks/useSocket';
import { typingAPI } from '@/lib/api';
import { Award, Target, Zap, BarChart3, LogOut, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface TestResult {
  wpm: number;
  accuracy: number;
  timestamp: string;
}

interface UserStats {
  username: string;
  avgWPM: number;
  avgAccuracy: number;
  avgConsistency: number;
  bestWPM: number;
  totalTests: number;
  recentTests: TestResult[];
}

export function UserProfile() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const { socket } = useSocket();

  const load = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      const { data } = await typingAPI.getUserProfile(username);
      setStats(data);
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  useEffect(() => {
    load();

    const username = localStorage.getItem('username');
    if (!username) return;

    socket?.on('user_stats_updated', (payload) => {
      if (payload.username === username) {
        setStats((prev) => ({
          ...prev!,
          avgWPM: payload.stats.avg_wpm,
          avgAccuracy: payload.stats.avg_accuracy,
          avgConsistency: payload.stats.avg_consistency,
          bestWPM: payload.stats.best_wpm,
          totalTests: payload.stats.totalTests,
        }));
      }
    });

    return () => {
      socket?.off('user_stats_updated');
    };
  }, [socket]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
      window.location.reload();
    }
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground italic">Loading profile...</p>
      </div>
    );
  }

  // Performance level badge
  const getLevel = (wpm: number) => {
    if (wpm >= 80)
      return {
        label: 'Expert',
        color:
          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      };
    if (wpm >= 60)
      return {
        label: 'Advanced',
        color:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      };
    if (wpm >= 40)
      return {
        label: 'Intermediate',
        color:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      };
    return {
      label: 'Beginner',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
  };

  const level = getLevel(stats.avgWPM);

  return (
    <Card className="w-full pt-0  mx-auto border shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="relative pt-5 pb-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/50 shadow-md">
            <AvatarFallback className="text-xl font-bold bg-muted">
              {stats.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats.username}
            </CardTitle>
            <span
              className={cn(
                'inline-block text-xs px-2.5 py-1 rounded-full font-semibold mt-1',
                level.color
              )}
            >
              {level.label}
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </CardHeader>

      {/* Stats Body */}
      <CardContent className="pt-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: 'Average WPM',
              value: stats.avgWPM.toFixed(1),
              icon: Zap,
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: 'Accuracy',
              value: `${stats.avgAccuracy.toFixed(1)}%`,
              icon: Target,
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-900/20',
            },
            {
              label: 'Consistency',
              value: `${stats.avgConsistency.toFixed(1)}%`,
              icon: BarChart3,
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
            {
              label: 'Personal Best',
              value: stats.bestWPM.toFixed(0),
              icon: Award,
              color: 'text-yellow-600 dark:text-yellow-400',
              bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'p-4 rounded-xl border hover:shadow-md transition-all duration-200 group hover:scale-102',
                stat.bg
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 shadow-sm backdrop-blur-sm',
                    stat.color
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Tests */}
        <div className="mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Total Tests Completed</span>
            </div>
            <span className="font-bold text-lg tabular-nums text-primary dark:text-primary-light">
              {stats.totalTests}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


