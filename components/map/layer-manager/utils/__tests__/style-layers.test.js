import { describe, it, expect } from 'vitest';

import { LAYERS } from 'constants/layers';
import { getInteractiveLayersIds } from 'selectors/utils';

import { getStyleLayers, getStyleSource } from '../style-layers';

const findLayer = (id) => LAYERS.find((l) => l.id === id);

/**
 * These assertions pin down the contract the rest of the app depends on but cannot enforce:
 * generated style layer ids, the source id, and the baked-in opacity. They were inherited from
 * layer-manager, and nothing fails loudly when they drift — clicking and hovering just quietly
 * stop working.
 */
describe('style layer ids', () => {
  it('generates `${layerId}-${type}-${index}` for the fmus render layers', () => {
    const styleLayers = getStyleLayers({
      id: 'fmus',
      ...findLayer('fmus').config,
      params: { country_iso_codes: ['CMR', 'COG'] }
    });

    expect(styleLayers.map((l) => l.id)).toEqual([
      'fmus-fill-0',
      'fmus-fill-1',
      'fmus-fill-2',
      'fmus-fill-3',
      'fmus-fill-4',
      'fmus-fill-5',
      'fmus-line-6',
      'fmus-line-7'
    ]);
  });

  it('points every style layer at a source named after the layer', () => {
    // modules/operators-ranking.js keys map interactions by `feature.layer.source`, and
    // pages/observations.js calls `map.getSource(source).getClusterLeaves(...)`
    const styleLayers = getStyleLayers({
      id: 'protected-areas',
      ...findLayer('protected-areas').config
    });

    expect(styleLayers.every((l) => l.source === 'protected-areas')).toBe(true);
  });

  it('keeps getInteractiveLayersIds in step, skipping metadata.interactive === false', () => {
    expect(getInteractiveLayersIds(findLayer('fmus'))).toEqual([
      'fmus-fill-0',
      'fmus-fill-2',
      'fmus-fill-3',
      'fmus-fill-4',
      'fmus-fill-5',
      'fmus-line-6'
    ]);
  });
});

describe('param interpolation', () => {
  it('substitutes an array without collapsing it to a string', () => {
    // ['literal', '{country_iso_codes}'] has to become ['literal', ['CMR', 'COG']].
    // The older copy in components/map/legend/legend-item-types/utils.js gets this wrong.
    const [fill] = getStyleLayers({
      id: 'fmus',
      ...findLayer('fmus').config,
      params: { country_iso_codes: ['CMR', 'COG'] }
    });

    expect(fill.filter[1]).toEqual(['in', ['get', 'iso3_fmu'], ['literal', ['CMR', 'COG']]]);
  });

  it('substitutes numbers as numbers, so mapbox filters compare correctly', () => {
    const styleLayers = getStyleLayers({
      id: 'fmusdetail',
      ...findLayer('fmusdetail').config,
      params: { operator_id: 42, clickId: 7 }
    });

    expect(styleLayers[0].filter[2]).toEqual(['==', 'operator_id', 42]);
    expect(styleLayers[5].filter).toEqual(['all', ['==', 'id', 7]]);
    expect(styleLayers[6].filter).toEqual(['!=', 'id', 7]);
  });

  it('hands the spec back untouched when there is nothing to interpolate', () => {
    // Skipping the JSON round trip is what lets react-map-gl's deepEqual bail out on identity
    // rather than walking the whole observations FeatureCollection on every render
    const spec = {
      id: 'observations',
      type: 'geojson',
      source: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
    };

    expect(getStyleSource(spec)).toBe(spec.source);
  });
});

describe('opacity', () => {
  it('scales a declared paint opacity by the layer opacity', () => {
    const [fill] = getStyleLayers({
      id: 'fmus',
      ...findLayer('fmus').config,
      params: { country_iso_codes: ['CMR'] },
      opacity: 0.5
    });

    expect(fill.paint['fill-opacity']).toBe(0.9 * 0.5 * 0.99);
  });

  it('scales the numbers inside an expression and leaves the rest alone', () => {
    const styleLayers = getStyleLayers({
      id: 'fmus',
      ...findLayer('fmus').config,
      params: { country_iso_codes: ['CMR'] },
      opacity: 0.5
    });

    expect(styleLayers[6].paint['line-opacity']).toEqual([
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1 * 0.5 * 0.99,
      0.1 * 0.5 * 0.99
    ]);
  });

  it('sets an opacity even when the render layer declares no paint', () => {
    const [raster] = getStyleLayers({ id: 'gain', ...findLayer('gain').config, opacity: 0.8 });

    expect(raster.id).toBe('gain-raster');
    expect(raster.paint['raster-opacity']).toBe(0.99 * 0.8);
  });

  it('maps symbol layers onto icon and text opacity', () => {
    const styleLayers = getStyleLayers({
      id: 'observations',
      type: 'geojson',
      render: { layers: [{ type: 'symbol', layout: { 'text-size': 12 } }] }
    });

    expect(Object.keys(styleLayers[0].paint).sort()).toEqual(['icon-opacity', 'text-opacity']);
  });
});

describe('sources', () => {
  it('defaults rasters to a 256px tile source', () => {
    expect(getStyleSource({ id: 'gain', ...findLayer('gain').config })).toEqual({
      type: 'raster',
      tileSize: 256,
      tiles: findLayer('gain').config.source.tiles,
      minzoom: 3,
      maxzoom: 12
    });
  });
});
