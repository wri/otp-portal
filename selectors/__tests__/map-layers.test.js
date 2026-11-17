import { describe, it, expect } from 'vitest';

import { LAYERS } from 'constants/layers';
import { getStyleSource } from 'components/map/layer-manager/utils';

import { getActiveLayers as getFmuDetailLayers } from '../operators-detail/fmus';

describe('fmus detail layers', () => {
  const state = (operatorId) => ({
    operatorsDetailFmus: {
      layersActive: ['fmusdetail'],
      layersSettings: {},
      fmuBounds: null,
      analysis: { loading: {}, error: {}, data: {} }
    },
    operatorsDetail: { data: { id: operatorId, loadedFMUS: true, fmus: [{ id: 1, name: 'A' }] } }
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
