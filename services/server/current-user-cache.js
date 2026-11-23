// Keyed on the auth token, so this survives analytics cookies rotating. Stale
// role/permission changes are the trade; logout clears the cookie, not this entry.
const TTL_MS = 90_000;
const MAX_ENTRIES = 10_000;

const cache = new Map();

export function getCachedUser(authToken) {
  if (!authToken) return undefined;
  const entry = cache.get(authToken);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(authToken);
    return undefined;
  }
  return entry.user;
}

export function setCachedUser(authToken, user) {
  if (!authToken) return;
  if (cache.has(authToken)) cache.delete(authToken);
  cache.set(authToken, { user, expiresAt: Date.now() + TTL_MS });
  while (cache.size > MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}
