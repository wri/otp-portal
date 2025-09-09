import React from 'react';
import { createSelector } from '@reduxjs/toolkit';

import Fuse from 'fuse.js';

// Utils
import { getInteractiveLayersIds, getActiveInteractiveLayersSelector, getParams, getPopupSelector, getLegendLayersSelector } from '../utils';
import { HELPERS_DOC } from 'utils/documentation';
import searchFMUs from 'utils/search-fmus';
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
    if (!_countryActive || !_countryActive.length) return c.iso;
    if (_countryActive.includes(c.value)) return c.iso;

    return null;
  }).filter(x => !!x);
});

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, interactions, getActiveCountries,
  (_layersActive, _layers, _layersSettings, _interactions, cIsoCodes) => {
    // Layers
    return _layersActive
      .map((id) => _layers.find(l => l.id === id))
      .filter(x => !!x)
      .map((l) => {
        const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
        const interactiveLayersIds = getInteractiveLayersIds(l);
        const settings = _layersSettings[id] || {};

        return {
          id,
          interactiveLayersIds,
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
      });
  }
);

export const getActiveInteractiveLayersIds = createSelector([getActiveLayers], (layers) => layers.map(l => l.interactiveLayersIds).flat().filter(x => !!x));
export const getActiveInteractiveLayers = createSelector([layers, interactions], getActiveInteractiveLayersSelector);

export const getLegendLayers = createSelector([layers, layersSettings, layersActive, intl], getLegendLayersSelector);

export const getPopup = createSelector([latlng], getPopupSelector);

export const getTable = createSelector(
  [data, filters],
  (_data, _filters) => {
    const activeCountries = _filters.data.country.length ? _filters.data.country : null;
    const activeCertifications = _filters.data.certification.length ? _filters.data.certification : null;
    const activeOperatorSearch = _filters.data.operator.length ? _filters.data.operator : null;
    const activeFMUSearch = _filters.data.fmu.length ? _filters.data.fmu : null;

    let operatorsTable = _data;

    // Filter by country
    if (activeCountries) {
      operatorsTable = operatorsTable.filter(o => {
        return activeCountries.indexOf(Number(o.country.id)) !== -1;
      });
    }

    // Filter by certification
    if (activeCertifications) {
      operatorsTable = operatorsTable.filter(o => {
        return o.fmus.some(f => {
          return activeCertifications.some(ac => {
            return f[`certification-${ac}`];
          });
        });
      });
    }

    if (activeOperatorSearch) {
      const fuse = new Fuse(operatorsTable, SEARCH_OPTIONS);
      operatorsTable = fuse.search(activeOperatorSearch).map(r => r.item);
    }

    if (activeFMUSearch) {
      operatorsTable = searchFMUs(operatorsTable, activeFMUSearch, 'fmus.name');
    }

    operatorsTable = operatorsTable.map(o => ({
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

    return operatorsTable;
  }
);
