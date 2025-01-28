import { createSelector } from 'reselect';

import { isEmpty } from 'utils/general';
import sortBy from 'lodash/sortBy';
import slugify from 'slugify';

import { replace } from 'layer-manager';

import { getLayerId, getParams, getPopupSelector, getActiveInteractiveLayersSelector } from '../utils';

import { LAYERS } from 'constants/layers';

const intl = (state, props) => props.intl;

const operatorsDetail = state => state.operatorsDetail.data;
const loadedFMUS = state => state.operatorsDetail.data.loadedFMUS;

const layersActive = state => state.operatorsDetailFmus.layersActive;
const layers = () => LAYERS;
const layersSettings = state => state.operatorsDetailFmus.layersSettings;

const interactions = state => state.operatorsDetailFmus.interactions;
const latlng = state => state.operatorsDetailFmus.latlng;

const fmu = state => state.operatorsDetailFmus.fmu;
const fmuBounds = state => state.operatorsDetailFmus.fmuBounds;
const analysis = state => state.operatorsDetailFmus.analysis;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, interactions, fmu, operatorsDetail,
  (_layersActive, _layers, _layersSettings, _interactions, _fmu, _operatorsDetail) => {
    const { id: operator_id, fmus, country } = _operatorsDetail;
    const fmuNames = (fmus || []).map(f => slugify(f.name, { lower: true }));

    // Layers
    const aLayers = _layers.map((l) => {
      const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
      const settings = _layersSettings[id] || {};

      if (_layersActive.includes(id) && _fmu && (!l.iso || l.iso === country.iso)) {
        const interactionParams = { clickId: Number(_fmu) };

        const layerConfig = {...l.config};
        // just fetch only tiles for operator's fmus
        if (id === 'fmusdetail') {
          layerConfig.source.tiles = [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}?operator_id=${operator_id}`];
        }

        return {
          id,
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
      }

      return null;
    });

    return aLayers.filter(x => !!x);
  }
);

export const getActiveInteractiveLayersIds = createSelector(
  [layers, layersSettings, layersActive, operatorsDetail],
  (_layers, _layersSettings, _layersActive, _operatorsDetail) => {
    if (!_layers) return [];

    const { country } = _operatorsDetail;

    return _layersActive.map((kActive) => {
      const layer = _layers.find(l => l.id === kActive);
      if (!layer) return null;
      if (layer.iso && layer.iso !== country.iso) return null;

      return getLayerId(layer);
    }).filter(x => !!x).flat();
  }
);

export const getActiveInteractiveLayers = createSelector([layers, interactions], getActiveInteractiveLayersSelector);

export const getLegendLayers = createSelector(
  [layers, layersSettings, layersActive, analysis, fmu, intl, operatorsDetail], (_layers, _layersSettings, _layersActive, _analysis, _fmu, _intl, _operatorsDetail) => {
    if (!_layers) return [];
    const legendLayers = _layers.filter(l => l.legendConfig && !isEmpty(l.legendConfig));
    const { country } = _operatorsDetail;

    const layerGroups = [];

    _layersActive.forEach((lid) => {
      const layer = legendLayers.find(r => r.id === lid);
      if (!layer || lid === 'fmus' || (layer.iso && layer.iso !== country.iso)) return false;

      const { id, name, description, metadata, legendConfig, paramsConfig, sqlConfig, decodeConfig, timelineConfig } = layer;


      const lSettings = _layersSettings[id] || {};

      const params = (!!paramsConfig) && getParams(paramsConfig, lSettings.params);
      const sqlParams = (!!sqlConfig) && getParams(sqlConfig, lSettings.sqlParams);
      const decodeParams = (!!decodeConfig) && getParams(decodeConfig, { ...timelineConfig, ...lSettings.decodeParams });

      const f = _fmu;
      const i = id === 'gain' ? 'loss' : id;
      const analysisParams = {
        loading: _analysis.loading[i],
        error: _analysis.error[i],
        ...(_analysis.data[f] && { data: _analysis.data[f][id] })
      };

      layerGroups.push({
        id,
        dataset: id,
        name: _intl.formatMessage({ id: name || '-' }) + (metadata && metadata.dateOfContent ? ` (${metadata.dateOfContent})` : ''),
        description,
        metadata,
        analysis: analysisParams,
        layers: [{
          ...layer,
          name: _intl.formatMessage({ id: name || '-' }) + (metadata && metadata.dateOfContent ? ` (${metadata.dateOfContent})` : ''),
          opacity: 1,
          active: true,
          legendConfig: {
            ...legendConfig,
            ...(legendConfig.items && {
              items: legendConfig.items.map(i => ({
                ...i,
                ...(i.name && { name: _intl.formatMessage({ id: i.name || '-' }) }),
                ...(i.items && {
                  items: i.items.map(ii => ({
                    ...ii,
                    ...(ii.name && { name: _intl.formatMessage({ id: ii.name || '-' }) })
                  }))
                })

              }))
            })
          },
          ...lSettings,
          ...(!!paramsConfig && {
            params
          }),

          ...(!!sqlConfig && {
            sqlParams
          }),

          ...(!!decodeConfig && {
            decodeParams
          }),

          ...(!!timelineConfig && {
            timelineParams: {
              ...JSON.parse(replace(JSON.stringify(timelineConfig), { ...params, ...decodeParams })),
              ...getParams(paramsConfig, lSettings.params),
              ...getParams(decodeConfig, lSettings.decodeParams),
              ...lSettings.timelineParams
            }
          })
        }],
        visibility: true,
        ...lSettings
      });
    });

    return layerGroups;
  }
);

export const getPopup = createSelector([latlng], getPopupSelector);

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
