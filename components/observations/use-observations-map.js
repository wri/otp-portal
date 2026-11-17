import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import {
  buildClusterLayers,
  buildFmusLayer,
  buildObservationsLayer,
  getInteractiveLayerIds,
  buildLegend
} from 'components/observations/map-layers';

const NO_LAYERS = [];

/**
 * Map layers, clickable layer ids and legend for the observations map. Each layer is memoised on
 * its own inputs: panning and zooming only rebuild the cluster and FMU layers, and the observations
 * layer keeps its identity so react-map-gl's `deepEqual` bails out instead of comparing every feature.
 */
export default function useObservationsMap(observations, cluster, zoom) {
  const intl = useIntl();
  const observationsLayer = useMemo(() => buildObservationsLayer(observations), [observations]);
  const fmusLayer = useMemo(() => buildFmusLayer(zoom), [zoom]);
  const clusterLayers = useMemo(() => buildClusterLayers(cluster, zoom), [cluster, zoom]);

  const layers = useMemo(() => (
    observations ? [...clusterLayers, fmusLayer, observationsLayer] : NO_LAYERS
  ), [observations, clusterLayers, fmusLayer, observationsLayer]);
  const interactiveLayerIds = useMemo(() => getInteractiveLayerIds(layers), [layers]);
  const legend = useMemo(() => buildLegend(intl), [intl]);

  return { layers, interactiveLayerIds, legend };
}
