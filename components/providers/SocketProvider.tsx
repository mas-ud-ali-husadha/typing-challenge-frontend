'use client';

import { createContext, useContext } from 'react';
import { useSocket } from '@/hooks/useSocket';

type SocketContextType = {
  socket: ReturnType<typeof useSocket>['socket'] | undefined;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: undefined,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketData = useSocket();
  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
