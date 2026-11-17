import Router from 'next/router';

import { CERTIFICATIONS } from 'constants/fmu';
import { withIntegratedAlerts } from 'services/integrated-alerts-layer';

const COUNTRIES = [
  { label: 'Congo', value: 47, iso: 'COG' },
  { label: 'Democratic Republic of the Congo', value: 7, iso: 'COD' },
  { label: 'Cameroon', value: 45, iso: 'CMR' },
  { label: 'Central African Republic', value: 188, iso: 'CAF' },
  { label: 'Gabon', value: 53, iso: 'GAB' }
];

export const FILTER_OPTIONS = {
  country: process.env.OTP_COUNTRIES.split(',').map(iso => COUNTRIES.find(c => c.iso === iso)),
  certification: CERTIFICATIONS
};

const DEFAULT_MAP = { zoom: 4, latitude: 0, longitude: 20 };

export function getOperatorsUrl(query) {
  const { zoom, lat, lng, latitude, longitude } = query;

  return {
    zoom: +zoom || DEFAULT_MAP.zoom,
    latitude: +latitude || +lat || DEFAULT_MAP.latitude,
    longitude: +longitude || +lng || DEFAULT_MAP.longitude
  };
}

export function setOperatorsUrl(mapLocation) {
  Router.replace({
    pathname: '/operators',
    query: {
      latitude: mapLocation.latitude.toFixed(2),
      longitude: mapLocation.longitude.toFixed(2),
      zoom: mapLocation.zoom.toFixed(2)
    }
  }, null, { shallow: true });
}

export function initRankingState({ query, isMobile }) {
  return {
    map: getOperatorsUrl(query),
    latlng: {},
    interactions: {},
    layersActive: ['gain', 'loss', 'fmus', 'protected-areas'],
    layersSettings: {},
    sidebar: { open: !isMobile, width: 600 },
    filters: { fa: true, country: [], certification: [], operator: '', fmu: '' }
  };
}

export function rankingReducer(state, { type, payload }) {
  switch (type) {
    case 'map':
      return { ...state, map: payload };
    case 'interactions': {
      const { features = [], lngLat = {} } = payload;
      // could be more features for the same layer; the first one wins
      const interactions = features.slice().reverse().reduce((obj, next) => ({
        ...obj,
        [next.layer.source]: { id: next.id, data: next.properties, geometry: next.geometry }
      }), {});
      return { ...state, interactions, latlng: lngLat };
    }
    case 'layerSettings': {
      const { id, settings } = payload;
      return {
        ...state,
        layersSettings: { ...state.layersSettings, [id]: { ...state.layersSettings[id], ...settings } }
      };
    }
    case 'integratedAlerts':
      return { ...state, ...withIntegratedAlerts(state, payload, 'fmus') };
    case 'sidebar':
      return { ...state, sidebar: { ...state.sidebar, ...payload } };
    case 'filter':
      return { ...state, filters: { ...state.filters, ...payload } };
    default:
      return state;
  }
}
