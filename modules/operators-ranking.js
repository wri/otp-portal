import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import compact from 'lodash/compact';

/* Constants */
const GET_OPERATORS_RANKING_SUCCESS = 'GET_OPERATORS_RANKING_SUCCESS';
const GET_OPERATORS_RANKING_ERROR = 'GET_OPERATORS_RANKING_ERROR';
const GET_OPERATORS_RANKING_LOADING = 'GET_OPERATORS_RANKING_LOADING';

const SET_OPERATORS_RANKING_MAP_LOCATION = 'SET_OPERATORS_RANKING_MAP_LOCATION';
const SET_FILTERS_RANKING = 'SET_FILTERS_RANKING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,
  map: {
    zoom: 5,
    center: {
      lat: 0,
      lng: 18
    }
  },
  filters: {
    data: {},
    // TODO: get them from API
    options: {
      country: [
        { label: 'Congo', value: 47 },
        { label: 'Democratic Republic of the Congo', value: 7 }
      ],
      certification: [
        { label: 'FSC', value: 'fsc' },
        { label: 'PEF', value: 'pef' },
        { label: 'OLB', value: 'olb' }
      ]
    },
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OPERATORS_RANKING_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_OPERATORS_RANKING_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATORS_RANKING_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    case SET_OPERATORS_RANKING_MAP_LOCATION:
      return Object.assign({}, state, { map: action.payload });
    case SET_FILTERS_RANKING: {
      const newFilters = Object.assign({}, state.filters, { data: action.payload });
      return Object.assign({}, state, { filters: newFilters });
    }
    default:
      return state;
  }
}

/* Helpers */
const getSQLFilters = (filters) => {
  const sql = compact(Object.keys(filters).map((f) => {
    if ((Array.isArray(filters[f]) && filters[f].length)) {
      return `filter[${f}]=${filters[f]}`;
    }

    if (!(Array.isArray(filters[f]) && !!filters[f])) {
      return `filter[${f}]=${filters[f]}`;
    }

    return null;
  })).join('&');

  return (sql) ? `&${sql}` : '';
};

/* Action creators */
export function getOperatorsRanking() {
  return (dispatch, getState) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_RANKING_LOADING });

    // Filters
    const includes = [
      'observations',
      'fmus'
    ].join(',');

    // Fields
    const currentFields = { fmus: ['certification-fsc', 'certification-olb', 'certification-pefc'] };
    const fields = Object.keys(currentFields).map(f => `fields[${f}]=${currentFields[f]}`).join('&');

    // Filters
    const filters = getSQLFilters(getState().operatorsRanking.filters.data);


    fetch(`${process.env.OTP_API}/operators?page[size]=2000&${fields}&include=${includes}${filters}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operatorsRanking) => {
        const dataParsed = JSONA.deserialize(operatorsRanking);

        dispatch({
          type: GET_OPERATORS_RANKING_SUCCESS,
          payload: dataParsed
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

export function setOperatorsUrl() {
  return (dispatch, getState) => {
    const { operatorsRanking } = getState();

    const location = {
      pathname: '/operators',
      query: {
        lat: operatorsRanking.map.center.lat.toFixed(2),
        lng: operatorsRanking.map.center.lng.toFixed(2),
        zoom: operatorsRanking.map.zoom.toFixed(2)
      }
    };

    Router.replace(location);
  };
}

export function getOperatorsUrl(url) {
  const { zoom, lat, lng } = url.query;

  return {
    zoom: +zoom || initialState.map.zoom,
    center: {
      lat: +lat || initialState.map.center.lat,
      lng: +lng || initialState.map.center.lng
    }
  };
}


// SETTERS
export function setOperatorsMapLocation(mapLocation) {
  return {
    type: SET_OPERATORS_RANKING_MAP_LOCATION,
    payload: mapLocation
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

    dispatch(getOperatorsRanking());
  };
}
