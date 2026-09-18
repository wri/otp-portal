import { createSelector } from '@reduxjs/toolkit';

import sortBy from 'lodash/sortBy';
import slugify from 'slugify';

import { getInteractiveLayersIds, getParams, getActiveInteractiveLayersSelector, getLegendLayersSelector } from '../utils';

import { LAYERS } from 'constants/layers';

const intl = (state, props) => props.intl;

const operatorsDetail = state => state.operatorsDetail.data;
const loadedFMUS = state => state.operatorsDetail.data.loadedFMUS;

const layersActive = state => state.operatorsDetailFmus.layersActive;
const layers = () => LAYERS;
const layersSettings = state => state.operatorsDetailFmus.layersSettings;

// The selected FMU lives in the URL (?fmuId=), passed down as a prop
const fmuIdParam = (_state, props) => props?.fmuId;
const fmuBounds = state => state.operatorsDetailFmus.fmuBounds;
const analysis = state => state.operatorsDetailFmus.analysis;

export const getFMUs = createSelector(
  operatorsDetail, loadedFMUS,
  (_operatorsDetail, _loadedFMUS) => {
    const { fmus } = _operatorsDetail;
    if (!_loadedFMUS) return [];
    return sortBy(fmus, 'name') || [];
  }
);

// With no (valid) fmuId nothing is selected, unless the operator has a single FMU
export const getSelectedFmuId = createSelector(
  getFMUs, fmuIdParam,
  (_fmus, _fmuId) => {
    const selected = _fmus.find(f => Number(f.id) === Number(_fmuId)) || (_fmus.length === 1 ? _fmus[0] : undefined);
    return selected?.id;
  }
);

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, getSelectedFmuId, operatorsDetail,
  (_layersActive, _layers, _layersSettings, _fmu, _operatorsDetail) => {
    if (!_operatorsDetail.loadedFMUS) return [];

    const { id: operator_id, fmus } = _operatorsDetail;
    const fmuNames = (fmus || []).map(f => slugify(f.name, { lower: true }));

    return _layersActive
      .map((id) => _layers.find(l => l.id === id))
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
            params: getParams(paramsConfig, { ...settings.params, ...interactionParams, operator_id: Number(operator_id), fmuNames })
          }),

          ...(!!decodeConfig && {
            decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams, operator_id: Number(operator_id), fmuNames }),
            decodeFunction
          })
        };
      })
  }
);

export const getActiveInteractiveLayersIds = createSelector([getActiveLayers], (layers) => layers.map(l => l.interactiveLayersIds).flat().filter(x => !!x));

export const getLegendLayers = createSelector(
  [layers, layersSettings, layersActive, analysis, getSelectedFmuId, intl], (_layers, _layersSettings, _layersActive, _analysis, _fmu, _intl) => {
    return getLegendLayersSelector(_layers, _layersSettings, _layersActive, _intl).map((layer) => {
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
  }
);


export const getFMU = createSelector(
  getFMUs, getSelectedFmuId, fmuBounds, layersActive, layers, layersSettings,
  (_fmus, _fmu, _fmuBounds, _layersActive, _layers, _layersSettings) => {
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
        const layer = _layers.find(l => l.id === key);
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
  }
);
