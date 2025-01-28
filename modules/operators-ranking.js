import Router from 'next/router';

import dayjs from 'dayjs';

import API from 'services/api';
import { fetchIntegratedAlertsMetadata } from 'services/layers';
import { groupBy } from 'utils/general';

import { CERTIFICATIONS } from 'constants/fmu';

/* Constants */
const GET_OPERATORS_RANKING_SUCCESS = 'GET_OPERATORS_RANKING_SUCCESS';
const GET_OPERATORS_RANKING_ERROR = 'GET_OPERATORS_RANKING_ERROR';
const GET_OPERATORS_RANKING_LOADING = 'GET_OPERATORS_RANKING_LOADING';

const SET_OPERATORS_RANKING_MAP_LOCATION = 'SET_OPERATORS_RANKING_MAP_LOCATION';
const SET_OPERATORS_MAP_INTERACTIONS = 'SET_OPERATORS_MAP_INTERACTIONS';
const SET_OPERATORS_MAP_LAYERS_ACTIVE = 'SET_OPERATORS_MAP_LAYERS_ACTIVE';
const SET_OPERATORS_MAP_LAYERS_SETTINGS = 'SET_OPERATORS_MAP_LAYERS_SETTINGS';
const SET_OPERATORS_SIDEBAR = 'SET_OPERATORS_SIDEBAR';
const SET_FILTERS_RANKING = 'SET_FILTERS_RANKING';

const COUNTRIES = [
  { label: 'Congo', value: 47, iso: 'COG' },
  { label: 'Democratic Republic of the Congo', value: 7, iso: 'COD' },
  { label: 'Cameroon', value: 45, iso: 'CMR' },
  { label: 'Central African Republic', value: 188, iso: 'CAF' },
  { label: 'Gabon', value: 53, iso: 'GAB' }
];

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,

  map: {
    zoom: 4,
    latitude: 0,
    longitude: 20
  },

  latlng: {},

  interactions: {},

  // LAYERS
  layersActive: [
    'gain',
    'loss',
    // 'integrated-alerts', // this should be activated when metadata is loaded
    'fmus',
    'protected-areas'
  ],
  layersSettings: {},

  // SIDEBAR
  sidebar: {
    open: false,
    width: 600
  },

  // FILTERS
  filters: {
    data: {
      fa: true,
      country: [],
      certification: [],
      operator: '',
      fmu: ''
    },

    options: {
      // TODO: refactor this eventually, remove COUNTRIES and OTP_COUNTRIES
      country: process.env.OTP_COUNTRIES.split(',').map(iso =>
        COUNTRIES.find(c => c.iso === iso)
      ),
      certification: CERTIFICATIONS
    },
    loading: false,
    error: false
  }
};

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_OPERATORS_RANKING_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_OPERATORS_RANKING_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATORS_RANKING_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    case SET_OPERATORS_RANKING_MAP_LOCATION:
      return Object.assign({}, state, { map: action.payload });
    case SET_OPERATORS_MAP_LAYERS_ACTIVE:
      return Object.assign({}, state, { layersActive: action.payload });
    case SET_OPERATORS_MAP_INTERACTIONS: {
      const { features = [], lngLat = {} } = action.payload;

      // could be more features for the same layer we reverse array
      // as the last one overrides the previous we will get the first on
      const interactions = features.slice().reverse().reduce(
        (obj, next) => ({
          ...obj,
          [next.layer.source]: {
            id: next.id,
            data: next.properties,
            geometry: next.geometry
          }
        }),
        {}
      );

      return {
        ...state,
        latlng: lngLat,
        interactions
      };
    }

    case SET_OPERATORS_MAP_LAYERS_SETTINGS: {
      const { id, settings } = action.payload;

      const layersSettings = {
        ...state.layersSettings,
        [id]: {
          ...state.layersSettings[id],
          ...settings
        }
      };

      return {
        ...state,
        layersSettings
      };
    }

    case SET_OPERATORS_SIDEBAR: {
      const { open, width } = action.payload;

      const sidebar = {
        open, width
      };

      return {
        ...state,
        sidebar
      };
    }

    case SET_FILTERS_RANKING: {
      const newFilters = Object.assign({}, state.filters, { data: action.payload });
      return Object.assign({}, state, { filters: newFilters });
    }

    default:
      return state;
  }
}

/* Action creators */
export function getOperatorsRanking() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_RANKING_LOADING });

    const includes = [
      'observations',
      'fmus',
      'country'
    ];
    const fields = {
      fmus: [
        'name',
        'forest-type',
        'certification-fsc',
        'certification-olb',
        'certification-pefc',
        'certification-pafc',
        'certification-fsc-cw',
        'certification-tlv',
        'certification-ls'
      ],
      operators: [
        'name',
        'slug',
        'obs-per-visit',
        'percentage-valid-documents-all',
        'score',
        'country',
        'fmus',
        'observations'
      ],
      countries: [
        'name'
      ],
      observations: [
        'country-id',
        'fmu-id'
      ]
    };

    return API.get('operators', {
      locale: language,
      'page[size]': 3000,
      include: includes.join(','),
      'filter[fa]': true,
      'filter[country]': process.env.OTP_COUNTRIES_IDS,
      'fields[fmus]': fields.fmus.join(','),
      'fields[countries]': fields.countries.join(','),
      'fields[operators]': fields.operators.join(','),
      'fields[observations]': fields.observations.join(','),
    }).then(({ data }) => {
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

      dispatch({
        type: GET_OPERATORS_RANKING_SUCCESS,
        payload: rankedData
      });
    })
    .catch((err) => {
      console.error(err);
      // Fetch from server ko -> Dispatch error
      dispatch({
        type: GET_OPERATORS_RANKING_ERROR,
        payload: err.message
      });
    });
  };
}

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


// SETTERS
export function setOperatorsMapLocation(payload) {
  return {
    type: SET_OPERATORS_RANKING_MAP_LOCATION,
    payload
  };
}

export function setOperatorsMapInteractions(payload) {
  return {
    type: SET_OPERATORS_MAP_INTERACTIONS,
    payload
  };
}

export function setOperatorsMapLayersActive(payload) {
  return {
    type: SET_OPERATORS_MAP_LAYERS_ACTIVE,
    payload
  };
}

export function setOperatorsMapLayersSettings(payload) {
  return {
    type: SET_OPERATORS_MAP_LAYERS_SETTINGS,
    payload
  };
}

export function setOperatorsSidebar(payload) {
  return {
    type: SET_OPERATORS_SIDEBAR,
    payload
  };
}

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().operatorsRanking.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    dispatch({
      type: SET_FILTERS_RANKING,
      payload: newFilters
    });
  };
}

export function getIntegratedAlertsMetadata() {
  return (dispatch, state) => {
    return fetchIntegratedAlertsMetadata().then(({ minDataDate, maxDataDate }) => {
      const activeLayers = state().operatorsRanking.layersActive;

      if (!minDataDate || !maxDataDate) {
        dispatch({
          type: SET_OPERATORS_MAP_LAYERS_ACTIVE,
          payload: activeLayers.filter(l => l !== 'integrated-alerts')
        });
        return;
      }

      const startDate = dayjs(maxDataDate).subtract(2, 'years').format('YYYY-MM-DD');

      dispatch({
        type: SET_OPERATORS_MAP_LAYERS_SETTINGS,
        payload: {
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
        }
      });

      // put integrated-alerts before fmus
      dispatch({
        type: SET_OPERATORS_MAP_LAYERS_ACTIVE,
        payload: [...new Set([
          ...activeLayers.slice(0, activeLayers.indexOf('fmus')),
         'integrated-alerts',
          ...activeLayers.slice(activeLayers.indexOf('fmus'))
        ])]
      });
    })
  };
}
