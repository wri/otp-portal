import { describe, it, expect } from 'vitest';

import {
  buildClusterLayers,
  buildFmusLayer,
  buildObservationsLayer,
  getInteractiveLayerIds
} from '../map-layers';

describe('observations interactive layer ids', () => {
  // the layers the map gets at zoom 5, with `cluster` open or not
  const state = (cluster) => [...buildClusterLayers(cluster, 5), buildFmusLayer(5), buildObservationsLayer([])];

  it('derives the ids the map needs for clicking', () => {
    expect(getInteractiveLayerIds(state({})).sort()).toEqual([
      'observations-circle-0',
      'observations-circle-2',
      'observations-symbol-1'
    ]);
  });

  it('includes the spider leaves only while a cluster is open', () => {
    const open = state({ id: 7, coordinates: [10, 10], features: [{ properties: { level: 1 } }] });

    expect(getInteractiveLayerIds(open)).toContain('observations-leaves');
    expect(getInteractiveLayerIds(state({}))).not.toContain('observations-leaves');
  });

  it('leaves the fmus layer and the spider legs non-interactive', () => {
    const open = state({ id: 7, coordinates: [10, 10], features: [{ properties: { level: 1 } }] });
    const ids = getInteractiveLayerIds(open);

    expect(ids.some((id) => id.startsWith('fmus'))).toBe(false);
    expect(ids.some((id) => id.startsWith('observations-legs'))).toBe(false);
  });
});
