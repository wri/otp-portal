import { createSlice } from '@reduxjs/toolkit';
import Router from 'next/router';
import dayjs from 'dayjs';

import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import { fetchIntegratedAlertsMetadata } from 'services/layers';
import { groupBy } from 'utils/general';
import { CERTIFICATIONS } from 'constants/fmu';

const COUNTRIES = [
  { label: 'Congo', value: 47, iso: 'COG' },
  { label: 'Democratic Republic of the Congo', value: 7, iso: 'COD' },
  { label: 'Cameroon', value: 45, iso: 'CMR' },
  { label: 'Central African Republic', value: 188, iso: 'CAF' },
  { label: 'Gabon', value: 53, iso: 'GAB' }
];

const initialState = {
  ...createApiInitialState([]),
  map: {
    zoom: 4,
    latitude: 0,
    longitude: 20
  },
  latlng: {},
  interactions: {},
  layersActive: [
    'gain',
    'loss',
    'fmus',
    'protected-areas'
  ],
  layersSettings: {},
  sidebar: {
    open: false,
    width: 600
  },
  filters: {
    data: {
      fa: true,
      country: [],
      certification: [],
      operator: '',
      fmu: ''
    },
    options: {
      country: process.env.OTP_COUNTRIES.split(',').map(iso =>
        COUNTRIES.find(c => c.iso === iso)
      ),
      certification: CERTIFICATIONS
    },
    loading: false,
    error: false
  }
};

export const getOperatorsRanking = createApiThunk('operatorsRanking/getOperatorsRanking', 'operators', {
  params: {
    'page[size]': 3000,
    include: 'observations,fmus,country',
    'filter[fa]': true,
    'filter[country]': process.env.OTP_COUNTRIES_IDS,
    'fields[fmus]': 'name,forest-type,certification-fsc,certification-olb,certification-pefc,certification-pbn,certification-pafc,certification-fsc-cw,certification-tlv,certification-ls',
    'fields[countries]': 'name',
    'fields[operators]': 'name,slug,obs-per-visit,percentage-valid-documents-all,score,country,fmus,observations',
    'fields[observations]': 'country-id,fmu-id',
  },
  transformResponse: (data) => {
    const groupByDocPercentage = groupBy(data, (o) => {
      if (typeof o['percentage-valid-documents-all'] !== 'number') return 0;
      return o['percentage-valid-documents-all'];
    });

    const groupByDocPercentageKeys = Object.keys(groupByDocPercentage).sort().reverse();
    const rankedData = groupByDocPercentageKeys.map((k, i) => {
      return groupByDocPercentage[k].map(o => ({
        ...o,
        ranking: i
      }));
    }).flat();

    return { data: rankedData };
  }
});

const operatorsRankingSlice = createSlice({
  name: 'operatorsRanking',
  initialState,
  reducers: {
    setOperatorsMapLocation: (state, action) => {
      state.map = action.payload;
    },
    setOperatorsMapInteractions: (state, action) => {
      const { features = [], lngLat = {} } = action.payload;
      state.interactions = {
        features,
        latlng: lngLat
      };
    },
    setOperatorsMapLayersActive: (state, action) => {
      state.layersActive = action.payload;
    },
    setOperatorsMapLayersSettings: (state, action) => {
      const { id, settings } = action.payload;
      state.layersSettings[id] = {
        ...state.layersSettings[id],
        ...settings
      };
    },
    setOperatorsSidebar: (state, action) => {
      const { open, width } = action.payload;
      state.sidebar = { open, width };
    },
    setFiltersRanking: (state, action) => {
      state.filters.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    addApiCases(getOperatorsRanking)(builder);
  },
});

export const {
  setOperatorsMapLocation,
  setOperatorsMapInteractions,
  setOperatorsMapLayersActive,
  setOperatorsMapLayersSettings,
  setOperatorsSidebar,
  setFiltersRanking
} = operatorsRankingSlice.actions;

export function setOperatorsUrl(mapLocation) {
  return () => {
    const location = {
      pathname: '/operators',
      query: {
        latitude: mapLocation.latitude.toFixed(2),
        longitude: mapLocation.longitude.toFixed(2),
        zoom: mapLocation.zoom.toFixed(2)
      }
    };

    Router.replace(location, null, { shallow: true });
  };
}

export function getOperatorsUrl(url) {
  const { zoom, lat, lng, latitude, longitude } = url.query;

  return {
    zoom: +zoom || initialState.map.zoom,
    latitude: +latitude || +lat || initialState.map.latitude,
    longitude: +longitude || +lng || initialState.map.longitude
  };
}

export function setFilters(filter) {
  return (dispatch, getState) => {
    const state = getState();
    const newFilters = { ...state.operatorsRanking.filters.data };
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    dispatch(setFiltersRanking(newFilters));
  };
}

export function getIntegratedAlertsMetadata() {
  return (dispatch, getState) => {
    return fetchIntegratedAlertsMetadata().then(({ minDataDate, maxDataDate }) => {
      const state = getState();
      const activeLayers = state.operatorsRanking.layersActive;

      if (!minDataDate || !maxDataDate) {
        dispatch(setOperatorsMapLayersActive(
          activeLayers.filter(l => l !== 'integrated-alerts')
        ));
        return;
      }

      const startDate = dayjs(maxDataDate).subtract(2, 'years').format('YYYY-MM-DD');

      dispatch(setOperatorsMapLayersSettings({
        id: 'integrated-alerts',
        settings: {
          decodeParams: {
            startDate,
            endDate: maxDataDate,
            trimEndDate: maxDataDate,
            maxDate: maxDataDate
          },
          timelineParams: {
            minDate: startDate,
            maxDate: maxDataDate,
            minDataDate
          }
        }
      }));

      dispatch(setOperatorsMapLayersActive([
        ...new Set([
          ...activeLayers.slice(0, activeLayers.indexOf('fmus')),
          'integrated-alerts',
          ...activeLayers.slice(activeLayers.indexOf('fmus'))
        ])
      ]));
    });
  };
}

export default operatorsRankingSlice.reducer;
