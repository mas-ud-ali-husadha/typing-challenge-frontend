'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Trophy,
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  Award,
  BarChart3,
  Star,
} from 'lucide-react';
import { typingAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avg_wpm: number;
  avg_accuracy: number;
  avg_consistency: number;
  best_wpm: number;
  total_tests: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { socket } = useSocket();

  const load = async () => {
    try {
      const { data } = await typingAPI.getLeaderboard('wpm', 25);

      const mapped = await Promise.all(
        data.leaderboard.map(async (l: LeaderboardEntry) => {
          const { data: u } = await typingAPI.getUserProfile(l.username);
          return {
            rank: l.rank,
            username: l.username,
            avg_wpm: u.avgWPM,
            avg_accuracy: u.avgAccuracy,
            avg_consistency: u.avgConsistency,
            best_wpm: u.bestWPM,
            total_tests: u.totalTests,
          };
        })
      );
      setEntries(mapped);
    } catch (e) {
      console.error('leaderboard', e);
    }
  };

  useEffect(() => {
    load();
    socket?.on('leaderboard_update', load);
    return () => {
      socket?.off('leaderboard_update', load);
    };
  }, [socket]);

  const toggleRow = (username: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(username)) {
      newExpanded.delete(username);
    } else {
      newExpanded.add(username);
    }
    setExpandedRows(newExpanded);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-md">
          <Trophy className="w-4 h-4 fill-white" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md">
          <Trophy className="w-4 h-4" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md">
          <Trophy className="w-4 h-4" />
        </div>
      );
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-medium text-sm">
        {rank}
      </div>
    );
  };

  const getPerformanceLevel = (wpm: number) => {
    if (wpm >= 80)
      return {
        label: 'Expert',
        color:
          'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30',
      };
    if (wpm >= 60)
      return {
        label: 'Advanced',
        color:
          'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
      };
    if (wpm >= 40)
      return {
        label: 'Intermediate',
        color:
          'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30',
      };
    return {
      label: 'Beginner',
      color: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800',
    };
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader >
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top typers by average speed — updated in real time 🚀
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground italic">
              Loading leaderboard...
            </p>
          ) : (
            entries.map((entry) => {
              const isExpanded = expandedRows.has(entry.username);
              const performanceLevel = getPerformanceLevel(entry.avg_wpm);

              return (
                <Collapsible
                  key={entry.username}
                  open={isExpanded}
                  onOpenChange={() => toggleRow(entry.username)}
                >
                  {/* Main Row */}
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border bg-background hover:bg-muted/60 cursor-pointer transition-all duration-200 group',
                        isExpanded && 'border-primary/30 shadow-sm'
                      )}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar + Username */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="w-10 h-10 border">
                            <AvatarFallback className="bg-muted font-semibold text-sm">
                              {entry.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold truncate">
                              {entry.username}
                            </p>
                            <span
                              className={cn(
                                'inline-block text-xs px-2 py-0.5 rounded-full font-medium',
                                performanceLevel.color
                              )}
                            >
                              {performanceLevel.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Best WPM (visible on desktop) */}
                      <div className="hidden sm:flex items-center gap-3 text-right flex-shrink-0">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Average
                          </p>
                          <p className="font-bold text-lg tabular-nums">
                            {entry.avg_wpm.toFixed(1)} WPM
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Mobile Chevron */}
                      <div className="flex sm:hidden">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Expanded Details */}
                  <CollapsibleContent className="collapsible-content mt-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-5 rounded-xl border bg-muted/40 dark:bg-muted/20 shadow-inner">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                              Avg Speed
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                            {entry.avg_wpm.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            WPM
                          </div>
                        </div>

                        <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                              Accuracy
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                            {entry.avg_accuracy.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            avg accuracy
                          </div>
                        </div>

                        <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                              Consistency
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                            {entry.avg_consistency.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            typing stability
                          </div>
                        </div>

                        <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                              Personal Best
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
                            {entry.best_wpm.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            peak performance
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Total tests completed</span>
                          <span className="font-semibold text-primary dark:text-primary-light tabular-nums flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {entry.total_tests}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}


