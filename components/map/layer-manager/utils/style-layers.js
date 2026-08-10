/**
 * Turns a layer spec (as produced by the `getActiveLayers` selectors and `constants/layers.js`)
 * into mapbox style layers / sources.
 *
 * Ported from layer-manager v3 (`src/utils/vector-style-layers.js` and the mapbox-gl plugin) so
 * that the generated ids and the baked-in opacity stay byte-for-byte what the rest of the app
 * already assumes:
 *
 * - the source id is always the layer id (redux keys map interactions by `feature.layer.source`)
 * - the style layer id is `${layerId}-${type}-${index}` unless the render layer declares its own
 * - `${paintName}-opacity` is always set to `value * opacity * 0.99`
 */
import { parseSpec } from './query';

// Layer types whose opacity is not controlled by a `${type}-opacity` paint property
const PAINT_STYLE_NAMES = {
  symbol: ['icon', 'text'],
  circle: ['circle', 'circle-stroke']
};

export function getStyleLayerId(layerId, renderLayer = {}, index = 0) {
  return renderLayer.id || `${layerId}-${renderLayer.type}-${index}`;
}

/**
 * Bakes the layer opacity into the paint properties the way layer-manager did: the opacity
 * property is always set, even when the render layer declares no paint at all, and an existing
 * value is scaled rather than replaced.
 *
 * Falsy paint values are dropped on the way through, because mapbox breaks interaction on a paint
 * property that is explicitly null.
 */
function getPaint(renderLayer, opacity) {
  const { paint = {}, type } = renderLayer;

  const scale = (value) => (typeof value === 'number' ? value * opacity * 0.99 : value);

  const opacityPaint = (PAINT_STYLE_NAMES[type] || [type]).map((name) => {
    const property = `${name}-opacity`;
    const current = paint[property];

    if (typeof current === 'number') return [property, scale(current)];
    if (Array.isArray(current)) return [property, current.map(scale)];
    return [property, 0.99 * opacity];
  });

  return {
    ...Object.fromEntries(Object.entries(paint).filter(([, value]) => !!value)),
    ...Object.fromEntries(opacityPaint)
  };
}

export function getStyleSource(layerSpec) {
  const { type, source = {}, params } = layerSpec;
  const parsed = parseSpec(source, params);

  if (type === 'raster') {
    return { type: 'raster', tileSize: 256, ...parsed };
  }

  return parsed;
}

/**
 * @returns {Array} mapbox style layers, ready to be spread onto react-map-gl's `<Layer />`
 */
export function getStyleLayers(layerSpec) {
  const { id, type, render = {}, params, opacity = 1, visibility = true } = layerSpec;

  const { layers } = parseSpec(render, params);

  // Rasters have no render config: layer-manager falls back to a single raster style layer
  const renderLayers =
    layers && layers.length ? layers : [{ id: `${id}-raster`, type: 'raster' }];

  return renderLayers.map((renderLayer, index) => {
    const { layout = {}, ...rest } = renderLayer;

    return {
      ...rest,
      id: getStyleLayerId(id, renderLayer, index),
      source: id,
      paint: getPaint(renderLayer, opacity),
      layout: {
        ...layout,
        visibility: visibility ? 'visible' : 'none'
      }
    };
  });
}
