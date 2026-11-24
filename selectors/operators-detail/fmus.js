import { createSelector } from '@reduxjs/toolkit';

import { sortBy } from 'utils/general';
import { getInteractiveLayersIds, getParams, buildLegendLayers, collectInteractiveLayerIds } from 'components/map/layers';
import { LAYERS } from 'constants/layers';

const NO_FMUS = [];

// Only once the operator is loaded with fmu geometries
export const getLoadedFmus = (_operatorsDetail) => {
  const { fmus, loadedFMUS } = _operatorsDetail;
  if (!loadedFMUS) return NO_FMUS;
  return sortBy(fmus, 'name') || [];
};

// With no (valid) fmuId (from ?fmuId=) nothing is selected, unless the operator has a single FMU
export const findSelectedFmuId = (_fmus, _fmuId) => {
  const selected = _fmus.find(f => Number(f.id) === Number(_fmuId)) || (_fmus.length === 1 ? _fmus[0] : undefined);
  return selected?.id;
};

// Map layers for the operator's FMUs, the selected one highlighted
export const buildFmuLayers = (_layersActive, _layersSettings, _fmu, _operatorsDetail) => {
  if (!_operatorsDetail.loadedFMUS) return [];

  const { id: operator_id } = _operatorsDetail;

  return _layersActive
    .map((id) => LAYERS.find(l => l.id === id))
    .filter(x => !!x)
    .map(l => {
      const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
      const interactiveLayersIds = getInteractiveLayersIds(l);
      const settings = _layersSettings[id] || {};
      // -1 matches no feature; NaN would be interpolated unquoted and break JSON.parse
      const interactionParams = { clickId: _fmu ? Number(_fmu) : -1 };
      // just fetch only tiles for operator's fmus. `l.config` is the shared object from
      // constants/layers.js, so replace `source` rather than writing through to it
      const layerConfig = id !== 'fmusdetail'
        ? l.config
        : {
          ...l.config,
          source: {
            ...l.config.source,
            tiles: [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}?operator_id=${operator_id}`]
          }
        };

      return {
        id,
        interactiveLayersIds,
        ...layerConfig,
        ...settings,

        ...(!!paramsConfig && {
          params: getParams(paramsConfig, { ...settings.params, ...interactionParams, operator_id: Number(operator_id) })
        }),

        ...(!!decodeConfig && {
          decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams, operator_id: Number(operator_id) }),
          decodeFunction
        })
      };
    })
};

// Legend with each layer's analysis for the selected FMU
export const buildFmuLegendLayers = (_layersSettings, _layersActive, _analysis, _fmu, _intl) => {
  return buildLegendLayers(LAYERS, _layersSettings, _layersActive, _intl).map((layer) => {
    const i = layer.id === 'gain' ? 'loss' : layer.id; // gain and loss share the same analysis loading and error state
    const analysisParams = {
      loading: _analysis.loading[i],
      error: _analysis.error[i],
      ...(_analysis.data[_fmu] && { data: _analysis.data[_fmu][layer.id] })
    };
    // no FMU selected: no analysis box (legend renders it for any truthy value),
    // and no stale spinner/result from a previously selected FMU
    return {
      ...layer,
      ...(_fmu && { analysis: analysisParams })
    };
  })
};

// The selected FMU with its map bounds and the date ranges its analyses cover
export const buildSelectedFmu = (_fmus, _fmu, _fmuBounds, _layersSettings) => {
  if (!_fmus.length) {
    return {};
  }

  const analysisLayers = [
    'loss',
    'integrated-alerts'
  ];

  const FMU = _fmus.find(f => f.id === _fmu);

  return {
    ...FMU,
    bounds: _fmuBounds,
    ...analysisLayers.reduce((acc, key) => {
      const layer = LAYERS.find(l => l.id === key);
      const { decodeConfig, timelineConfig } = layer;
      const settings = _layersSettings[key] || {};

      return {
        ...acc,
        [key]: {
          ...getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams })
        }
      };
    }, {})
  };
};

// Selectors

const intl = (state, props) => props.intl;

const operatorsDetail = state => state.operatorsDetail.data;

const layersActive = state => state.operatorsDetailFmus.layersActive;
const layersSettings = state => state.operatorsDetailFmus.layersSettings;

// The selected FMU lives in the URL (?fmuId=), passed down as a prop
const fmuIdParam = (_state, props) => props?.fmuId;
const fmuBounds = state => state.operatorsDetailFmus.fmuBounds;
const analysis = state => state.operatorsDetailFmus.analysis;

export const getFMUs = createSelector(operatorsDetail, getLoadedFmus);

export const getSelectedFmuId = createSelector(getFMUs, fmuIdParam, findSelectedFmuId);

export const getActiveLayers = createSelector(
  layersActive, layersSettings, getSelectedFmuId, operatorsDetail,
  buildFmuLayers
);

export const getActiveInteractiveLayersIds = createSelector([getActiveLayers], collectInteractiveLayerIds);

export const getLegendLayers = createSelector(
  [layersSettings, layersActive, analysis, getSelectedFmuId, intl],
  buildFmuLegendLayers
);

export const getFMU = createSelector(
  getFMUs, getSelectedFmuId, fmuBounds, layersSettings,
  buildSelectedFmu
);
