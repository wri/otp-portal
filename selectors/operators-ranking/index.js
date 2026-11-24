import React from 'react';
import { createSelector } from '@reduxjs/toolkit';
import Fuse from 'fuse.js';

import { getInteractiveLayersIds, getParams, collectInteractiveLayerIds, getClickedLayers, getPopupPosition, buildLegendLayers } from 'components/map/layers';
import { HELPERS_DOC } from 'utils/documentation';
import searchFMUs from 'utils/search-fmus';
import { SEARCH_OPTIONS } from 'constants/general';
import { LAYERS } from 'constants/layers';

import OperatorsCertificationsTd from 'components/operators/certificationsTd';

// ISO codes of the countries the ranking filter selects, or all of them with no country filter
export const getActiveCountryIsos = (countryOptions, activeCountries) => countryOptions
  .filter((c) => !activeCountries || !activeCountries.length || activeCountries.includes(c.value))
  .map((c) => c.iso);

// Map layers for the active layer ids, restricted to the selected countries
export const buildRankingLayers = (layersActive, layersSettings, countryIsoCodes) => layersActive
  .map((id) => LAYERS.find(l => l.id === id))
  .filter(x => !!x)
  .map((l) => {
    const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
    const interactiveLayersIds = getInteractiveLayersIds(l);
    const settings = layersSettings[id] || {};

    return {
      id,
      interactiveLayersIds,
      ...l.config,
      ...settings,

      ...(!!paramsConfig && {
        params: getParams(paramsConfig, { ...settings.params, country_iso_codes: countryIsoCodes })
      }),

      ...(!!decodeConfig && {
        decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams }),
        decodeFunction
      })
    };
  });

// Ranking rows for the operators that pass the sidebar filters (country, certification, searches)
export function filterRankingRows(operators, filters) {
  const activeCountries = filters.country.length ? filters.country : null;
  const activeCertifications = filters.certification.length ? filters.certification : null;
  const activeOperatorSearch = filters.operator.length ? filters.operator : null;
  const activeFMUSearch = filters.fmu.length ? filters.fmu : null;

  let operatorsTable = operators;

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

// Selectors

const intl = (state, props) => props.intl;

const data = state => state.operatorsRanking.data;
const filtersData = state => state.operatorsRanking.filters.data;

const layersActive = state => state.operatorsRanking.layersActive;
const layers = () => LAYERS;
const layersSettings = state => state.operatorsRanking.layersSettings;

const interactions = state => state.operatorsRanking.interactions;
const latlng = state => state.operatorsRanking.latlng;

const countryOptions = state => state.operatorsRanking.filters.options.country;
const countryActive = state => state.operatorsRanking.filters.data.country;

export const getActiveCountries = createSelector(countryOptions, countryActive, getActiveCountryIsos);

export const getActiveLayers = createSelector(layersActive, layersSettings, getActiveCountries, buildRankingLayers);

export const getActiveInteractiveLayersIds = createSelector([getActiveLayers], collectInteractiveLayerIds);
export const getActiveInteractiveLayers = createSelector([layers, interactions], getClickedLayers);

export const getLegendLayers = createSelector([layers, layersSettings, layersActive, intl], buildLegendLayers);

export const getPopup = createSelector([latlng], getPopupPosition);

export const getTable = createSelector([data, filtersData], filterRankingRows);
