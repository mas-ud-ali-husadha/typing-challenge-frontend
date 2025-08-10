'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TestTube, TrendingUp, Wifi } from 'lucide-react';
import { typingAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

interface Stats {
  totalTests: number;
  totalUsers: number;
  averageWPM: number;
  averageAccuracy: number;
  onlineUsers: number;
}

export function Statistics() {
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    totalUsers: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    onlineUsers: 0,
  });
  const { socket } = useSocket();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await typingAPI.getStats();
        setStats((prev) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();

    const handleStatsUpdate = (data: Omit<Stats, 'onlineUsers'>) => {
      setStats((prev) => ({ ...prev, ...data }));
    };

    const handleOnlineUsersUpdate = (data: { count: number }) => {
      setStats((prev) => ({ ...prev, onlineUsers: data.count }));
    };

    if (socket) {
      socket.on('stats_update', handleStatsUpdate);
      socket.on('online_users_update', handleOnlineUsersUpdate);
    }

    return () => {
      if (socket) {
        socket.off('stats_update', handleStatsUpdate);
        socket.off('online_users_update', handleOnlineUsersUpdate);
      }
    };
  }, [socket]);

  const statCards = [
    {
      title: 'Total Tests',
      value: stats.totalTests.toLocaleString(),
      icon: TestTube,
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Average WPM',
      value: Math.round(stats.averageWPM).toString(),
      icon: TrendingUp,
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Online Now',
      value: stats.onlineUsers.toLocaleString(),
      icon: Wifi,
      bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30',
      iconColor: 'text-orange-500 dark:text-red-400 animate-pulse',
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          📊 Global Statistics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Live stats from the typing community
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className={cn(
                'rounded-xl p-4 border transition-all duration-200 hover:scale-105 hover:shadow-md',
                stat.bg
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-full bg-white/70 dark:bg-gray-800/70 shadow-sm backdrop-blur-sm',
                    stat.iconColor
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: Accuracy stat (commented out or shown conditionally) */}
        {/* 
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Avg Accuracy: <span className="font-medium">{stats.averageAccuracy.toFixed(1)}%</span>
          </p>
        </div> 
        */}
      </CardContent>
    </Card>
  );
}

// Utility for conditional classnames
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
