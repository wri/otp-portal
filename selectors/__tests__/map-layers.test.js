import { describe, it, expect } from 'vitest';

import { LAYERS } from 'constants/layers';
import { getStyleSource } from 'components/map/layer-manager/utils';

import { getObservationsInteractiveLayersIds } from '../observations/parsed-map-observations';
import { getActiveLayers as getFmuDetailLayers } from '../operators-detail/fmus';

describe('observations interactive layer ids', () => {
  const state = (cluster) => ({ observations: { data: [], cluster, map: { zoom: 5 } } });

  it('derives the ids the map needs for clicking', () => {
    expect(getObservationsInteractiveLayersIds(state({})).sort()).toEqual([
      'observations-circle-0',
      'observations-circle-2',
      'observations-symbol-1'
    ]);
  });

  it('includes the spider leaves only while a cluster is open', () => {
    const open = state({ id: 7, coordinates: [10, 10], features: [{ properties: { level: 1 } }] });

    expect(getObservationsInteractiveLayersIds(open)).toContain('observations-leaves');
    expect(getObservationsInteractiveLayersIds(state({}))).not.toContain('observations-leaves');
  });

  it('leaves the fmus layer and the spider legs non-interactive', () => {
    const open = state({ id: 7, coordinates: [10, 10], features: [{ properties: { level: 1 } }] });
    const ids = getObservationsInteractiveLayersIds(open);

    expect(ids.some((id) => id.startsWith('fmus'))).toBe(false);
    expect(ids.some((id) => id.startsWith('observations-legs'))).toBe(false);
  });
});

describe('fmus detail layers', () => {
  const state = (operatorId) => ({
    operatorsDetailFmus: {
      layersActive: ['fmusdetail'],
      layersSettings: {},
      fmu: 1,
      fmuBounds: null,
      analysis: { loading: {}, error: {}, data: {} }
    },
    operatorsDetail: { data: { id: operatorId, fmus: [{ id: 1, name: 'A' }] } }
  });

  const tilesFor = (operatorId) =>
    getStyleSource(getFmuDetailLayers(state(operatorId)).find((l) => l.id === 'fmusdetail')).tiles;

  it('produces a different tiles array per operator, so react-map-gl calls setTiles', () => {
    expect(tilesFor(11)[0]).toContain('operator_id=11');
    expect(tilesFor(11)).not.toEqual(tilesFor(22));
  });

  it('does not write the operator id back into the shared LAYERS constant', () => {
    const pristine = [...LAYERS.find((l) => l.id === 'fmusdetail').config.source.tiles];

    getFmuDetailLayers(state(33));

    expect(LAYERS.find((l) => l.id === 'fmusdetail').config.source.tiles).toEqual(pristine);
  });
});
