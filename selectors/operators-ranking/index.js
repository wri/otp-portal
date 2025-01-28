import React from 'react';
import { createSelector } from 'reselect';

import { isEmpty } from 'utils/general';
import uniqBy from 'lodash/uniqBy';

import Fuse from 'fuse.js';

// Utils
import { getLayerId, getParams, getPopupSelector, getLegendLayersSelector } from '../utils';
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
  layersActive, layers, layersSettings, interactions, getActiveCountries,
  (_layersActive, _layers, _layersSettings, _interactions, cIsoCodes) => {
    // Layers
    const aLayers = _layers.map((l) => {
      const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
      const settings = _layersSettings[id] || {};

      if (_layersActive.includes(id)) {
        return {
          id,
          ...l.config,
          ...settings,

          ...(!!paramsConfig && {
            params: getParams(paramsConfig, { ...settings.params, country_iso_codes: cIsoCodes })
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

    return _layersActive.map((layerId) => {
      const layer = _layers.find(l => l.id === layerId);
      if (!layer) return null;

      return getLayerId(layer);
    }).filter(l => !!l).flat();
  }
);

export const getActiveInteractiveLayers = createSelector(
  [layers, interactions],
  (_layers, _interactions) => {
    if (!_layers || isEmpty(_interactions)) return {};

    const allLayers = uniqBy(_layers, 'id');

    const interactiveLayerKeys = Object.keys(_interactions);
    const interactiveLayers = allLayers.filter(l => interactiveLayerKeys.includes(l.id));

    return interactiveLayers.map(l => ({ ...l, data: _interactions[l.id] }));
  }
);

export const getLegendLayers = createSelector(
  [layers, layersSettings, layersActive, intl],
  getLegendLayersSelector
);

export const getPopup = createSelector([latlng], getPopupSelector);

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
