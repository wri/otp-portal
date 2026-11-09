import { describe, expect, it } from 'vitest';

import { arcPath, nearestIndex, pieSegments, polar } from 'utils/charts';

describe('polar', () => {
  it('starts at 12 o\'clock and turns clockwise', () => {
    const [x0, y0] = polar(0, 10);
    const [x1, y1] = polar(Math.PI / 2, 10);

    expect(x0).toBeCloseTo(0);
    expect(y0).toBeCloseTo(-10);
    expect(x1).toBeCloseTo(10);
    expect(y1).toBeCloseTo(0);
  });
});

describe('arcPath', () => {
  it('draws a quarter ring from 12 to 3 o\'clock', () => {
    expect(arcPath(0, Math.PI / 2, 100, 50)).toBe('M0 -100A100 100 0 0 1 100 0L50 0A50 50 0 0 0 0 -50Z');
  });

  it('sets the large-arc flag past half a turn', () => {
    expect(arcPath(0, Math.PI * 1.5, 100, 50)).toContain('A100 100 0 1 1');
  });

  it('draws a full ring as two closed circles', () => {
    const d = arcPath(0, Math.PI * 2, 100, 50);

    expect(d).not.toContain('NaN');
    expect(d.match(/Z/g)).toHaveLength(2);
  });
});

describe('pieSegments', () => {
  it('splits the turn proportionally', () => {
    const [a, b] = pieSegments([{ value: 1 }, { value: 3 }]);

    expect(a.start).toBe(0);
    expect(a.end).toBeCloseTo(Math.PI / 2);
    expect(b.end).toBeCloseTo(Math.PI * 2);
    expect(b.mid).toBeCloseTo(Math.PI * 1.25);
  });

  it('gives empty data zero-width segments', () => {
    expect(pieSegments([{ value: 0 }])[0]).toMatchObject({ start: 0, end: 0 });
  });
});

describe('nearestIndex', () => {
  const values = [0, 10, 20, 40];

  it.each([
    [-5, 0],
    [4, 0],
    [5, 0],
    [6, 1],
    [29, 2],
    [31, 3],
    [100, 3]
  ])('maps %d to index %d', (target, index) => {
    expect(nearestIndex(values, target)).toBe(index);
  });
});
