import React from 'react';
import { createSelector } from 'reselect';

import { isEmpty } from 'utils/general';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';

import { replace } from 'layer-manager';

import Fuse from 'fuse.js';

// Utils
import { getParams } from '../utils';
import { HELPERS_DOC } from 'utils/documentation';
import { SEARCH_OPTIONS } from 'constants/general';
import { LAYERS } from 'constants/layers';

import OperatorsCertificationsTd from 'components/operators/certificationsTd';

const intl = (state, props) => props.intl;

const data = state => state.operatorsRanking.data;
const filters = state => state.operatorsRanking.filters;

const layersActive = state => state.operatorsRanking.layersActive;
const layers = () => LAYERS;
const layersSettings = state => state.operatorsRanking.layersSettings;

const interactions = state => state.operatorsRanking.interactions;
const hoverInteractions = state => state.operatorsRanking.hoverInteractions;
const latlng = state => state.operatorsRanking.latlng;

const countryOptions = state => state.operatorsRanking.filters.options.country;
const countryActive = state => state.operatorsRanking.filters.data.country;

export const getActiveCountries = createSelector(countryOptions, countryActive, (_countryOptions, _countryActive) => {
  return _countryOptions.map((c) => {
    if (!_countryActive || !_countryActive.length) {
      return c.iso;
    }

    if (_countryActive.includes(c.value)) {
      return c.iso;
    }
    return null;
  }).filter(x => !!x);
});

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, interactions, hoverInteractions, getActiveCountries,
  (_layersActive, _layers, _layersSettings, _interactions, _hoverInteractions, cIsoCodes) => {
    // Layers
    const aLayers = _layers.map((l) => {
      const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
      const settings = _layersSettings[id] || {};
      const hoverInteractionParams = _hoverInteractions[id] ? { hoverId: _hoverInteractions[id].data.cartodb_id || _hoverInteractions[id].data.id } : {};

      if (_layersActive.includes(id)) {
        return {
          id,
          ...l.config,
          ...settings,

          ...(!!paramsConfig && {
            params: getParams(paramsConfig, { ...settings.params, ...hoverInteractionParams, country_iso_codes: cIsoCodes })
          }),

          ...(!!decodeConfig && {
            decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams }),
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
  [layers, layersSettings, layersActive],
  (_layers, _layersSettings, _layersActive) => {
    if (!_layers) return [];

    const getIds = (layer) => {
      const { id, config, interactionConfig } = layer;
      if (isEmpty(config) || isEmpty(interactionConfig)) return null;

      const { render = {} } = config;
      const { layers } = render;
      if (!layers) return null;

      return layers.map((l, i) => {
        const {
          id: vectorLayerId,
          type: vectorLayerType
        } = l;

        return vectorLayerId || `${id}-${vectorLayerType}-${i}`;
      });
    };

    return _layersActive.map((kActive) => {
      const layer = _layers.find(l => l.id === kActive);

      if (!layer) {
        return null;
      }

      const { slug, config } = layer;
      const { type } = config;

      if (type === 'group') {
        const { layers: configLayers, default: defaultLayer } = config;
        const current = (_layersSettings[slug] && _layersSettings[slug].current) ?
          _layersSettings[slug].current :
          defaultLayer;

        const layer1 = configLayers.find(l => l.id === current);

        return getIds(layer1);
      }

      return getIds(layer);
    }).filter(l => !!l).flat();
  }
);

export const getActiveInteractiveLayers = createSelector(
  [layers, interactions],
  (_layers, _interactions) => {
    if (!_layers || isEmpty(_interactions)) return {};

    const allLayers = uniqBy(_layers.map((l) => {
      const { config, name } = l;
      const { type } = config;

      if (type === 'group') {
        return config.layers.map(lc => ({ ...lc, name: `${name} - ${lc.name}` }));
      }

      return l;
    }).flat(), 'id');

    const interactiveLayerKeys = Object.keys(_interactions);
    const interactiveLayers = allLayers.filter(l => interactiveLayerKeys.includes(l.id));

    return interactiveLayers.map(l => ({ ...l, data: _interactions[l.id] }));
  }
);

export const getLegendLayers = createSelector(
  [layers, layersSettings, layersActive, intl], (_layers, _layersSettings, _layersActive, _intl) => {
    if (!_layers) return [];
    const legendLayers = _layers.filter(l => l.legendConfig && !isEmpty(l.legendConfig));

    const layerGroups = [];

    _layersActive.forEach((lid) => {
      const layer = legendLayers.find(r => r.id === lid);
      if (!layer) return false;

      const { id, name, description, metadata, legendConfig, paramsConfig, sqlConfig, decodeConfig, timelineConfig } = layer;

      const lSettings = _layersSettings[id] || {};

      const params = (!!paramsConfig) && getParams(paramsConfig, lSettings.params);
      const sqlParams = (!!sqlConfig) && getParams(sqlConfig, lSettings.sqlParams);
      const decodeParams = (!!decodeConfig) && getParams(decodeConfig, { ...timelineConfig, ...lSettings.decodeParams });

      layerGroups.push({
        id,
        dataset: id,
        name: _intl.formatMessage({ id: name || '-' }) + (metadata && metadata.dateOfContent ? ` (${metadata.dateOfContent})` : ''),
        description,
        metadata,
        layers: [{
          ...layer,
          name: _intl.formatMessage({ id: name || '-' }) + (metadata && metadata.dateOfContent ? ` (${metadata.dateOfContent})` : ''),
          opacity: 1,
          active: true,
          legendConfig: {
            ...legendConfig,
            ...(legendConfig.items && {
              items: sortBy(legendConfig.items.map(i => ({
                ...i,
                ...(i.name && { name: _intl.formatMessage({ id: i.name || '-' }) }),
                ...(i.items && {
                  items: i.items.map(ii => ({
                    ...ii,
                    ...(ii.name && { name: _intl.formatMessage({ id: ii.name || '-' }) })
                  }))
                })

              })), 'name')
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

export const getPopup = createSelector(
  [latlng],
  (_latlng) => {
    if (isEmpty(_latlng) || !_latlng.lat || !_latlng.lng) {
      return {};
    }

    const popup = {
      latitude: _latlng.lat,
      longitude: _latlng.lng
    };

    return popup;
  }
);

export const getTable = createSelector(
  [data, filters],
  (_data, _filters) => {
    const activeCountries = _filters.data.country.length ? _filters.data.country : null;
    const activeCertifications = _filters.data.certification.length ? _filters.data.certification : null;
    const activeOperatorSearch = _filters.data.operator.length ? _filters.data.operator : null;
    const activeFMUSearch = _filters.data.fmu.length ? _filters.data.fmu : null;

    let operatorsTable = null;

    // Filter by country
    if (activeCountries) {
      operatorsTable = (operatorsTable || _data).filter(o => {
        return activeCountries.indexOf(Number(o.country.id)) !== -1;
      });
    }

    // Filter by certification
    if (activeCertifications) {
      operatorsTable = (operatorsTable || _data).filter(o => {
        return o.fmus.some(f => {
          return activeCertifications.some(ac => {
            return f[`certification-${ac}`];
          });
        });
      });
    }

    if (activeOperatorSearch) {
      const fuse = new Fuse(operatorsTable || _data, SEARCH_OPTIONS);
      operatorsTable = fuse.search(activeOperatorSearch).map(r => r.item);
    }

    if (activeFMUSearch) {
      const fuse = new Fuse(operatorsTable || _data, {
        ...SEARCH_OPTIONS,
        keys: ['fmus.name'],
        distance: 100,
        threshold: 0.15
      });
      operatorsTable = fuse.search(activeFMUSearch).map(r => r.item);
    }

    operatorsTable = (operatorsTable || _data).map(o => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      certification: <OperatorsCertificationsTd fmus={o.fmus} />,
      ranking: o.ranking,
      score: o.score || 0,
      observations: o.observations,
      obsPerVisit: o['obs-per-visit'],
      documentation: HELPERS_DOC.getPercentage(o),
      fmus: o.fmus,
      fmusLenght: o.fmus ? o.fmus.length : 0,
      country: o.country.name
    }));



    // Filter by producer name



    return operatorsTable;
  }
);
