import { createSelector } from 'reselect';

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

const fmu = state => state.operatorsDetailFmus.fmu;
const fmuBounds = state => state.operatorsDetailFmus.fmuBounds;
const analysis = state => state.operatorsDetailFmus.analysis;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, fmu, operatorsDetail,
  (_layersActive, _layers, _layersSettings, _fmu, _operatorsDetail) => {
    if (!_fmu) return [];

    const { id: operator_id, fmus } = _operatorsDetail;
    const fmuNames = (fmus || []).map(f => slugify(f.name, { lower: true }));

    return _layersActive
      .map((id) => _layers.find(l => l.id === id))
      .filter(x => !!x)
      .map(l => {
        const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
        const interactiveLayersIds = getInteractiveLayersIds(l);
        const settings = _layersSettings[id] || {};
        const interactionParams = { clickId: Number(_fmu) };
        const layerConfig = { ...l.config };

        // just fetch only tiles for operator's fmus
        if (id === 'fmusdetail') {
          layerConfig.source.tiles = [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}?operator_id=${operator_id}`];
        }

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
  [layers, layersSettings, layersActive, analysis, fmu, intl], (_layers, _layersSettings, _layersActive, _analysis, _fmu, _intl) => {
    return getLegendLayersSelector(_layers, _layersSettings, _layersActive, _intl).map((layer) => {
      const i = layer.id === 'gain' ? 'loss' : layer.id; // gain and loss share the same analysis loading and error state
      const analysisParams = {
        loading: _analysis.loading[i],
        error: _analysis.error[i],
        ...(_analysis.data[_fmu] && { data: _analysis.data[_fmu][layer.id] })
      };
      return {
        ...layer,
        analysis: analysisParams
      };
    })
  }
);

export const getFMUs = createSelector(
  operatorsDetail, loadedFMUS,
  (_operatorsDetail, _loadedFMUS) => {
    const { fmus } = _operatorsDetail;
    if (!_loadedFMUS) return [];
    return sortBy(fmus, 'name') || [];
  }
);

export const getFMU = createSelector(
  getFMUs, fmu, fmuBounds, layersActive, layers, layersSettings,
  (_fmus, _fmu, _fmuBounds, _layersActive, _layers, _layersSettings) => {
    if (!_fmus.length) {
      return {};
    }

    const analysisLayers = [
      'loss',
      'integrated-alerts'
    ];

    let FMU;

    if (!_fmu && !!_fmus.length) {
      FMU = _fmus[0];
    } else {
      FMU = _fmus.find(f => Number(f.id) === Number(_fmu));
    }

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
