import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from 'utils/recent-searches';

const item = (n, extra = {}) => ({ id: `producer-${n}`, type: 'producer', title: `Producer ${n}`, href: `/operators/p${n}/overview`, ...extra });

describe('recent searches', () => {
  let store;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('window', {
      localStorage: {
        getItem: key => (key in store ? store[key] : null),
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; }
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('puts the latest pick first and de-duplicates by id', () => {
    addRecentSearch(item(1));
    addRecentSearch(item(2));
    addRecentSearch(item(1));

    expect(getRecentSearches().map(i => i.id)).toEqual(['producer-1', 'producer-2']);
  });

  it('keeps at most five items', () => {
    [1, 2, 3, 4, 5, 6].forEach(n => addRecentSearch(item(n)));

    expect(getRecentSearches().map(i => i.id)).toEqual(['producer-6', 'producer-5', 'producer-4', 'producer-3', 'producer-2']);
  });

  it('stores only the display fields', () => {
    addRecentSearch(item(1, { sub: 'Cameroon', hay: 'extra', operator: { slug: 'x' } }));

    expect(getRecentSearches()[0]).toEqual({ id: 'producer-1', type: 'producer', title: 'Producer 1', sub: 'Cameroon', href: '/operators/p1/overview' });
  });

  it('keeps object hrefs', () => {
    const href = { pathname: '/observations', query: { filters: 'abc' } };
    addRecentSearch({ id: 'report-1', type: 'report', title: 'Report', href });

    expect(getRecentSearches()[0].href).toEqual(href);
  });

  it('ignores corrupt or malformed storage', () => {
    store['otp-recent-searches'] = '{not json';
    expect(getRecentSearches()).toEqual([]);

    store['otp-recent-searches'] = JSON.stringify([{ id: 'x' }, null, item(1)]);
    expect(getRecentSearches().map(i => i.id)).toEqual(['producer-1']);
  });

  it('clears', () => {
    addRecentSearch(item(1));
    clearRecentSearches();

    expect(getRecentSearches()).toEqual([]);
  });

  it('does not throw when storage is unavailable', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => { throw new Error('SecurityError'); },
        setItem: () => { throw new Error('QuotaExceededError'); },
        removeItem: () => { throw new Error('SecurityError'); }
      }
    });

    expect(getRecentSearches()).toEqual([]);
    expect(() => addRecentSearch(item(1))).not.toThrow();
    expect(() => clearRecentSearches()).not.toThrow();
  });
});
