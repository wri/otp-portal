import { describe, it, expect } from 'vitest';

import { getPageItems } from 'components/database/pagination';

describe('getPageItems', () => {
  it('lists every page when there are 7 or fewer', () => {
    expect(getPageItems(0, 1)).toEqual([0]);
    expect(getPageItems(3, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('keeps 5 pages visible at the start', () => {
    expect(getPageItems(0, 14)).toEqual([0, 1, 2, 3, 'end-gap', 13]);
  });

  it('shows a window around the current page in the middle', () => {
    expect(getPageItems(6, 14)).toEqual([0, 'start-gap', 5, 6, 7, 'end-gap', 13]);
    expect(getPageItems(10, 14)).toEqual([0, 'start-gap', 9, 10, 11, 12, 13]);
  });

  it('keeps 5 pages visible at the end', () => {
    expect(getPageItems(13, 14)).toEqual([0, 'start-gap', 10, 11, 12, 13]);
  });

  it('skips the gap when the window touches an edge', () => {
    expect(getPageItems(2, 14)).toEqual([0, 1, 2, 3, 'end-gap', 13]);
    expect(getPageItems(3, 14)).toEqual([0, 1, 2, 3, 4, 'end-gap', 13]);
  });
});
