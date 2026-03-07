import { createContext, useContext, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface DataCacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}

const TTL = 5 * 60 * 1000; // 5분

const DataCacheContext = createContext<DataCacheContextType | null>(null);

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const cache = useRef<Map<string, CacheEntry<unknown>>>(new Map());

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL) {
      cache.current.delete(key);
      return null;
    }
    return entry.data as T;
  }, []);

  const set = useCallback(<T,>(key: string, data: T) => {
    cache.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const invalidateAll = useCallback(() => {
    cache.current.clear();
  }, []);

  return (
    <DataCacheContext.Provider value={{ get, set, invalidate, invalidateAll }}>
      {children}
    </DataCacheContext.Provider>
  );
}

export const useDataCache = () => {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error('useDataCache must be used within DataCacheProvider');
  return ctx;
};