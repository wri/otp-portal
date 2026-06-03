const TTL_MS = 30_000;
const MAX_ENTRIES = 10_000;

const cache = new Map();

export function getCachedUser(cookieHeader) {
  if (!cookieHeader) return undefined;
  const entry = cache.get(cookieHeader);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(cookieHeader);
    return undefined;
  }
  return entry.user;
}

export function setCachedUser(cookieHeader, user) {
  if (!cookieHeader) return;
  if (cache.has(cookieHeader)) cache.delete(cookieHeader);
  cache.set(cookieHeader, { user, expiresAt: Date.now() + TTL_MS });
  while (cache.size > MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}
