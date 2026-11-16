import { describe, it, expect, vi } from 'vitest';
import { memoizeOne } from 'utils/memoize';

describe('memoizeOne', () => {
  it('returns the cached result while every argument is the same object', () => {
    const fn = vi.fn((list, zoom) => ({ list, zoom }));
    const memoized = memoizeOne(fn);
    const list = [1];

    const first = memoized(list, 5);
    expect(memoized(list, 5)).toBe(first);
    expect(fn).toHaveBeenCalledTimes(1);

    expect(memoized([1], 5)).not.toBe(first);
    expect(memoized([1], 6)).not.toBe(first);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
