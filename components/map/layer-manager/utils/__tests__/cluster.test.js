import { describe, it, expect } from 'vitest';

import {
  generateEquidistantPointsInCircle,
  generateEquidistantPointsInSpiral,
  spiderifyCluster
} from '../cluster';

const distance = ({ x, y }) => Math.hypot(x, y);
const features = (n) => Array.from({ length: n }, (_, i) => ({ properties: { id: i } }));

describe('generateEquidistantPointsInCircle', () => {
  it('places points evenly on the circle', () => {
    const points = generateEquidistantPointsInCircle({ totalPoints: 4 });

    expect(points).toHaveLength(4);
    points.forEach((p) => expect(distance(p)).toBeCloseTo(50));
    expect(points[0].x).toBeCloseTo(50);
    expect(points[1].y).toBeCloseTo(50);
  });
});

describe('generateEquidistantPointsInSpiral', () => {
  it('places points moving away from the centre', () => {
    const points = generateEquidistantPointsInSpiral({ totalPoints: 20 });
    const distances = points.map(distance);

    expect(points).toHaveLength(20);
    distances.slice(1).forEach((d, i) => expect(d).toBeGreaterThan(distances[i]));
  });
});

describe('spiderifyCluster', () => {
  it('returns nothing for a cluster without features', () => {
    expect(spiderifyCluster({ coordinates: [10, 5] })).toEqual({});
  });

  it('returns a leaf and a leg per feature, legs starting at the cluster', () => {
    const { legs, leaves } = spiderifyCluster({ coordinates: [10, 5], features: features(3), zoom: 6 });

    expect(leaves.features.map((f) => f.properties.id)).toEqual([0, 1, 2]);
    expect(legs.features).toHaveLength(3);
    legs.features.forEach((leg, i) => {
      expect(leg.geometry.coordinates[0]).toEqual([10, 5]);
      expect(leg.geometry.coordinates[1]).toEqual(leaves.features[i].geometry.coordinates);
    });
  });

  it('spreads leaves closer together at higher zoom', () => {
    const spread = (zoom) => {
      const { leaves } = spiderifyCluster({ coordinates: [10, 5], features: features(2), zoom });
      const [a, b] = leaves.features.map((f) => f.geometry.coordinates);
      return Math.hypot(a[0] - b[0], a[1] - b[1]);
    };

    expect(spread(8)).toBeCloseTo(spread(4) / 16);
  });

  it('switches to a spiral for large clusters', () => {
    const { leaves } = spiderifyCluster({ coordinates: [10, 5], features: features(15) });

    expect(leaves.features).toHaveLength(15);
  });
});
