interface CacheEntry<T> {
  value: T;
  storedAt: number;
  ttlMs: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.storedAt > entry.ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): T {
  store.set(key, { value, storedAt: Date.now(), ttlMs });
  return value;
}

export function cacheSize(): number {
  return store.size;
}

export function cacheClear(): void {
  store.clear();
}