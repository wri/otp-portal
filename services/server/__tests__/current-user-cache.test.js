import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getCachedUser, setCachedUser } from '../current-user-cache';

const USER = { id: 1, role: 'operator' };

describe('current user cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the user stored for a token', () => {
    setCachedUser('token-1', USER);

    expect(getCachedUser('token-1')).toEqual(USER);
  });

  it('ignores calls without a token', () => {
    setCachedUser(undefined, USER);

    expect(getCachedUser(undefined)).toBeUndefined();
    expect(getCachedUser('')).toBeUndefined();
  });

  it('misses for an unknown token', () => {
    expect(getCachedUser('never-stored')).toBeUndefined();
  });

  it('drops the entry once it is older than the ttl', () => {
    setCachedUser('token-2', USER);

    vi.advanceTimersByTime(89_000);
    expect(getCachedUser('token-2')).toEqual(USER);

    vi.advanceTimersByTime(2_000);
    expect(getCachedUser('token-2')).toBeUndefined();
  });

  it('refreshes the ttl when the same token is stored again', () => {
    setCachedUser('token-3', USER);
    vi.advanceTimersByTime(80_000);
    setCachedUser('token-3', { ...USER, role: 'admin' });

    vi.advanceTimersByTime(20_000);
    expect(getCachedUser('token-3')).toEqual({ ...USER, role: 'admin' });
  });
});
