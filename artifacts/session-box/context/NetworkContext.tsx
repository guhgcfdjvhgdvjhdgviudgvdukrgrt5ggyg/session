import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { addNetworkStateListener, getNetworkStateAsync } from "expo-network";

interface NetworkContextValue {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({ isConnected: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    getNetworkStateAsync().then((state) => setIsConnected(state.isConnected ?? true));
    const sub = addNetworkStateListener((state) => setIsConnected(state.isConnected ?? true));
    return () => sub.remove();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
