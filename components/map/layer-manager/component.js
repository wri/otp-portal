import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Source, Layer, useMap } from 'react-map-gl';

import { getStyleLayers, getStyleSource } from './utils';

// deck.gl is browser-only, and its ESM build can't be resolved by node during `next build`'s
// page data collection
const DecodedRasterLayer = dynamic(() => import('./decoded-raster'), { ssr: false });

/**
 * Renders layer specs (see `constants/layers.js` and the `getActiveLayers` selectors) onto the
 * map, using react-map-gl's own `<Source>` / `<Layer>` for everything mapbox can draw and
 * deck.gl for the GPU-decoded rasters.
 *
 * Stacking is expressed with invisible `background` anchor layers: anchor `i` is inserted below
 * anchor `i - 1`, and each layer's style layers go just above their own anchor. The net effect
 * is that the first entry in `layers` ends up on top, which is what layer-manager's
 * `zIndex = 1000 - i` did. Render layers flagged `metadata.position === 'top'` opt out and are
 * appended above everything instead.
 */

const ANCHOR_ID = 'custom-layers';

// The basemap layer the data layers have to stay below. Mapbox's light-v9 style has no
// `custom-layers` layer of its own, so we insert one before its first label layer.
const ANCHOR_MATCHES = ['custom-layers', 'label', 'place', 'poi'];

function useAnchorLayer(map) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map) return undefined;

    const addAnchor = () => {
      // The same readiness check react-map-gl's own <Source> / <Layer> use. Deliberately not
      // `isStyleLoaded()`, which also waits on tiles and so is still false right after `load`.
      if (!map.style || !map.style._loaded) return;

      if (!map.getLayer(ANCHOR_ID)) {
        const { layers = [] } = map.getStyle();
        const labelLayer = layers.find((l) => ANCHOR_MATCHES.some((m) => l.id.includes(m)));

        map.addLayer(
          { id: ANCHOR_ID, type: 'background', paint: { 'background-opacity': 0 } },
          labelLayer && labelLayer.id
        );
      }

      setReady(true);
    };

    addAnchor();
    // The anchor has to come back if the style is ever swapped out from under us
    map.on('styledata', addAnchor);

    return () => {
      map.off('styledata', addAnchor);
    };
  }, [map]);

  return ready;
}

function LayerManager({ layers }) {
  const { current: mapRef } = useMap();
  const map = mapRef && mapRef.getMap();
  const anchorReady = useAnchorLayer(map);

  if (!anchorReady || !layers || !layers.length) return null;

  return (
    <>
      {layers.map((layer, i) => {
        const beforeId = i === 0 ? ANCHOR_ID : `${layers[i - 1].id}-bg`;

        return (
          <Fragment key={layer.id}>
            <Layer
              id={`${layer.id}-bg`}
              type="background"
              layout={{ visibility: 'none' }}
              beforeId={beforeId}
            />

            {layer.decodeFunction ? (
              <DecodedRasterLayer layer={layer} beforeId={beforeId} />
            ) : (
              <Source id={layer.id} {...getStyleSource(layer)}>
                {getStyleLayers(layer).map((styleLayer) => (
                  <Layer
                    key={styleLayer.id}
                    {...styleLayer}
                    beforeId={
                      styleLayer.metadata && styleLayer.metadata.position === 'top'
                        ? undefined
                        : beforeId
                    }
                  />
                ))}
              </Source>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

LayerManager.propTypes = {
  layers: PropTypes.array
};

export default LayerManager;
