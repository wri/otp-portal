const STORAGE_KEY = 'otp-recent-searches';
const MAX_RECENT_SEARCHES = 5;
const FIELDS = ['id', 'type', 'title', 'sub', 'meta', 'href'];

// Snapshots of picked results, so recents render before the lazy indexes load.
// Storage can be unavailable (private mode, blocked cookies) - fail silently.
export function getRecentSearches() {
  try {
    const items = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(items)) return [];
    return items.filter(i => i && i.id && i.type && typeof i.title === 'string' && i.href);
  } catch (e) {
    return [];
  }
}

export function addRecentSearch(item) {
  const snapshot = Object.fromEntries(FIELDS.filter(f => item[f] !== undefined).map(f => [f, item[f]]));
  const items = [snapshot, ...getRecentSearches().filter(i => i.id !== item.id)].slice(0, MAX_RECENT_SEARCHES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
  return items;
}

export function clearRecentSearches() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
