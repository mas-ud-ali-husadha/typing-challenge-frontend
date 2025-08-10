import { useEffect, useState } from 'react';
import { socketService } from '@/lib/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket] = useState(() => socketService.connect());

  useEffect(() => {
    if (socket.connected) {
      setIsConnected(true);
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  return { socket, isConnected };
};
