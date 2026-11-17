import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { LAYERS } from 'constants/layers';
import { buildLegendLayers, collectInteractiveLayerIds, getClickedLayers, getPopupPosition } from 'components/map/layers';
import { buildRankingLayers, getActiveCountryIsos } from 'components/operators/ranking-map';
import { FILTER_OPTIONS } from 'components/operators/ranking-state';

// Map layers, legend and click popup for the ranking page state (see ranking-state.js)
export default function useRankingMap({ filters, layersActive, layersSettings, interactions, latlng }) {
  const intl = useIntl();
  const activeCountries = useMemo(
    () => getActiveCountryIsos(FILTER_OPTIONS.country, filters.country),
    [filters.country]
  );
  const activeLayers = useMemo(
    () => buildRankingLayers(layersActive, layersSettings, activeCountries),
    [layersActive, layersSettings, activeCountries]
  );
  const interactiveLayerIds = useMemo(() => collectInteractiveLayerIds(activeLayers), [activeLayers]);
  const clickedLayers = useMemo(() => getClickedLayers(LAYERS, interactions), [interactions]);
  const legendLayers = useMemo(
    () => buildLegendLayers(LAYERS, layersSettings, layersActive, intl),
    [layersSettings, layersActive, intl]
  );
  const popup = useMemo(() => getPopupPosition(latlng), [latlng]);

  return { activeCountries, activeLayers, interactiveLayerIds, clickedLayers, legendLayers, popup };
}
