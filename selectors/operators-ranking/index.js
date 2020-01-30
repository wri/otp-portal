import { createSelector } from 'reselect';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';

import { getParams } from './utils';

// Get the datasets and filters from state
const layersActive = state => state.operatorsRanking.layersActive;
const layers = state => state.operatorsRanking.layers;
const layersSettings = state => state.operatorsRanking.layersSettings;

const countryOptions = state => state.operatorsRanking.filters.options.country;
const countryActive = state => state.operatorsRanking.filters.data.country;

const interactions = state => state.operatorsRanking.interactions;
const latlng = state => state.operatorsRanking.latlng;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, countryOptions, countryActive,
  (_layersActive, _layers, _layersSettings, _countryOptions, _countryActive) => {
    // Country layers
    const cLayers = _countryOptions.map((c) => {
      let opacity = 1;

      if (_countryActive && _countryActive.length) {
        opacity = Number(_countryActive.includes(c.value));
      }

      return {
        id: c.iso,
        type: 'geojson',
        opacity,
        source: {
          type: 'geojson',
          data: `https://api.resourcewatch.org/v2/geostore/admin/${c.iso}?simplify=0.0000001`,
          parse: data => data.data.attributes.geojson
        },
        render: {
          layers: [{
            type: 'line',
            paint: {
              'line-color': '#333333',
              'line-width': 2,
              'line-opacity': 0.8
            }
          }]
        }
      };
    });

    // Layers
    const aLayers = _layers.map((l) => {
      const { id, paramsConfig, decodeConfig, decodeFunction } = l;
      const settings = _layersSettings[id] || {};

      if (_layersActive.includes(id)) {
        return {
          id,
          ...l.config,

          ...(!!paramsConfig) && {
            params: getParams(paramsConfig, settings.params)
          },

          ...(!!decodeConfig) && {
            decodeParams: getParams(decodeConfig, settings.decodeParams),
            decodeFunction
          }
        };
      }

      return null;
    });

    return compact([
      ...cLayers,
      ...aLayers
    ]);
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

    return flatten(compact(_layersActive.map((kActive) => {
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
    })));
  }
);

export const getActiveInteractiveLayers = createSelector(
  [layers, interactions],
  (_layers, _interactions) => {
    if (!_layers || isEmpty(_interactions)) return {};

    const allLayers = uniqBy(flatten(_layers.map((l) => {
      const { config, name } = l;
      const { type } = config;

      if (type === 'group') {
        return config.layers.map(lc => ({ ...lc, name: `${name} - ${lc.name}` }));
      }

      return l;
    })), 'id');

    const interactiveLayerKeys = Object.keys(_interactions);
    const interactiveLayers = allLayers.filter(l => interactiveLayerKeys.includes(l.id));

    return interactiveLayers.map(l => ({ ...l, data: _interactions[l.id] }));
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
