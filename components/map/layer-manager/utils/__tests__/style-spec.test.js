import { describe, it, expect } from 'vitest';
import { validate } from 'mapbox-gl/dist/style-spec/index.es.js';

import { LAYERS } from 'constants/layers';

import { getStyleLayers, getStyleSource } from '../style-layers';

const PARAMS = {
  fmus: { country_iso_codes: ['CMR', 'COG', 'CAF', 'GAB', 'COD'] },
  fmusdetail: { operator_id: 42, clickId: 7 }
};

/**
 * react-map-gl calls `map.addLayer` during render and does not catch, so a malformed style layer
 * takes down the whole layer tree rather than failing on its own. Checking the generated output
 * against mapbox's own validator catches that without needing a browser or a GL context.
 */
describe('generated style against the mapbox style spec', () => {
  // The decoded rasters are drawn by deck.gl, not mapbox, so they have no style layers
  const mapboxLayers = LAYERS.filter((l) => !l.decodeFunction);

  it('produces a valid style for every layer in the catalogue', () => {
    const sources = {};
    const layers = [{ id: 'custom-layers', type: 'background', paint: { 'background-opacity': 0 } }];

    mapboxLayers.forEach((l) => {
      const spec = { id: l.id, ...l.config, params: PARAMS[l.id] };

      sources[l.id] = getStyleSource(spec);
      layers.push({ id: `${l.id}-bg`, type: 'background', layout: { visibility: 'none' } });
      layers.push(...getStyleLayers(spec));
    });

    expect(validate({ version: 8, name: 'test', sources, layers })).toEqual([]);
  });
});
