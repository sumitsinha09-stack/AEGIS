import { createContext, useContext, useEffect, useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface RefreshContextValue {
  lastRefreshed: Date | null;
  isRefreshing: boolean;
  triggerRefresh: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextValue>({
  lastRefreshed: null,
  isRefreshing: false,
  triggerRefresh: async () => {},
});

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      await new Promise(r => setTimeout(r, 600));
      setLastRefreshed(new Date());
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  useEffect(() => {
    const scheduleNext = () => {
      timerRef.current = setTimeout(async () => {
        await triggerRefresh();
        scheduleNext();
      }, REFRESH_INTERVAL_MS);
    };
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerRefresh]);

  return (
    <RefreshContext.Provider value={{ lastRefreshed, isRefreshing, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
