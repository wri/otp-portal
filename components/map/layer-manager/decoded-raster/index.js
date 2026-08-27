import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-map-gl';

import { MapboxLayer } from '@deck.gl/mapbox';
// Deep import on purpose: the `@deck.gl/geo-layers` barrel pulls in 3D tiles, terrain, WMS and
// h3 alongside their peer deps, none of which this app has any use for.
import TileLayer from '@deck.gl/geo-layers/dist/esm/tile-layer/tile-layer';

import DecodedBitmapLayer from './decoded-bitmap-layer';

/**
 * Raster layers whose pixels have to be decoded on the GPU (`loss`, `integrated-alerts`).
 *
 * mapbox can't express this, so the tiles are drawn by deck.gl interleaved into the mapbox
 * canvas — the same approach layer-manager took, minus its vendored copies of deck.gl's tile
 * and bitmap layers.
 */

async function getTileData({ url, signal }) {
  if (!url) return null;

  const response = await fetch(url, { signal });
  if (!response.ok) return null;

  const blob = await response.blob();
  const { type } = blob || {};

  // Missing tiles come back as an error document rather than a 404
  if (type === 'application/xml' || type === 'text/xml' || type === 'text/html') {
    return null;
  }

  // These tiles carry data, not colour: `integrated-alerts` keeps alert confidence in the alpha
  // channel and the day number in RGB. Premultiplying (the browser default) would scale RGB by
  // alpha and destroy it, and colour management would shift the values too.
  return createImageBitmap(blob, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none'
  });
}

function renderSubLayers({
  id,
  data,
  tile,
  decodeParams,
  decodeFunction,
  opacity,
  visible,
  minZoom,
  maxZoom
}) {
  if (!data) return null;

  const { west, south, east, north } = tile.bbox;

  return new DecodedBitmapLayer({
    id,
    image: data,
    bounds: [west, south, east, north],
    decodeParams,
    decodeFunction,
    opacity,
    visible,
    // The decode functions read zoom, and have to see the zoom of the tile they were handed
    minZoom,
    maxZoom
  });
}

function getDeckLayerProps({ deckLayerId, source = {}, decodeParams, decodeFunction, opacity, visibility }) {
  return {
    id: deckLayerId,
    type: TileLayer,
    data: source.tiles,
    getTileData,
    tileSize: 256,
    minZoom: source.minzoom,
    maxZoom: source.maxzoom,
    renderSubLayers,
    decodeParams,
    decodeFunction,
    opacity,
    visible: visibility
  };
}

function DecodedRasterLayer({ layer, beforeId }) {
  const { current: mapRef } = useMap();
  const map = mapRef && mapRef.getMap();

  const deckLayerRef = useRef(null);
  const beforeIdRef = useRef(beforeId);

  const { id, source, decodeParams, decodeFunction, opacity = 1, visibility = true } = layer;
  const deckLayerId = `${id}-raster-decode`;

  // Add / remove. The layer instance is created once and kept alive across prop changes so that
  // deck can reuse its loaded tiles.
  useEffect(() => {
    if (!map) return undefined;

    const deckLayer = new MapboxLayer(
      getDeckLayerProps({ deckLayerId, source, decodeParams, decodeFunction, opacity, visibility })
    );
    deckLayerRef.current = deckLayer;

    const anchor = beforeIdRef.current;
    map.addLayer(deckLayer, anchor && map.getLayer(anchor) ? anchor : undefined);

    return () => {
      deckLayerRef.current = null;
      if (map.style && map.getLayer(deckLayer.id)) {
        map.removeLayer(deckLayer.id);
      }
    };
    // Recreating on a source change mirrors layer-manager, which removed and re-added the layer
    // whenever the parsed source changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, deckLayerId, JSON.stringify(source)]);

  // Timeline scrubbing, the opacity slider and the visibility toggle
  useEffect(() => {
    if (!deckLayerRef.current) return;

    deckLayerRef.current.setProps({
      decodeParams,
      decodeFunction,
      opacity,
      visible: visibility
    });
  }, [decodeParams, decodeFunction, opacity, visibility]);

  useEffect(() => {
    beforeIdRef.current = beforeId;

    if (!map || !map.getLayer(deckLayerId)) return;
    if (beforeId && !map.getLayer(beforeId)) return;

    map.moveLayer(deckLayerId, beforeId);
  }, [map, deckLayerId, beforeId]);

  return null;
}

DecodedRasterLayer.propTypes = {
  layer: PropTypes.object.isRequired,
  beforeId: PropTypes.string
};

export default DecodedRasterLayer;
