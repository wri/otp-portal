import dayjs from 'dayjs';

import { fetchIntegratedAlertsMetadata } from 'services/layers';
import { sumBy } from 'utils/general';

const GET_FMU_ANALYSIS_SUCCESS = 'GET_FMU_ANALYSIS_SUCCESS';
const GET_FMU_ANALYSIS_LOADING = 'GET_FMU_ANALYSIS_LOADING';
const GET_FMU_ANALYSIS_ERROR = 'GET_FMU_ANALYSIS_ERROR';

const SET_OPERATORS_DETAIL_FMU_SELECTED = 'SET_OPERATORS_DETAIL_FMU_SELECTED';
const SET_OPERATORS_DETAIL_FMU_BOUNDS = 'SET_OPERATORS_DETAIL_FMU_BOUNDS';

const SET_OPERATORS_DETAIL_MAP_LOCATION = 'SET_OPERATORS_DETAIL_MAP_LOCATION';
const SET_OPERATORS_DETAIL_MAP_INTERACTIONS = 'SET_OPERATORS_DETAIL_MAP_INTERACTIONS';
const SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS = 'SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS';
const SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS = 'SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS';
const SET_OPERATORS_DETAIL_MAP_LAYERS_ACTIVE = 'SET_OPERATORS_DETAIL_MAP_LAYERS_ACTIVE';

/* Initial state */
const initialState = {
  map: {
    zoom: 5,
    latitude: 0,
    longitude: 20,
    scrollZoom: false
  },

  latlng: {},
  hoverLatLng: {},

  interactions: {},

  hoverInteractions: {},

  layersActive: [
    'gain',
    'loss',
    // 'integrated-alerts', //activate when metadata is loaded
    // 'aac-cog',
    // 'aac-cod',
    // 'aac-cmr',
    'fmusdetail'
  ],
  layersSettings: {},

  fmu: undefined,
  fmusBounds: undefined,
  analysis: {
    data: {},
    loading: false,
    error: false
  }
};

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_FMU_ANALYSIS_SUCCESS: {
      const analysis = {
        data: { ...state.analysis.data, ...action.payload.data },
        loading: {
          ...state.analysis.loading,
          [action.payload.type]: false
        },
        error: {
          ...state.analysis.error,
          [action.payload.type]: false
        }
      };
      return Object.assign({}, state, { analysis });
    }
    case GET_FMU_ANALYSIS_ERROR: {
      const analysis = {
        ...state.analysis,
        loading: {
          ...state.analysis.loading,
          [action.payload.type]: false
        },
        error: {
          ...state.analysis.error,
          [action.payload.type]: true
        }
      };
      return Object.assign({}, state, { analysis });
    }
    case GET_FMU_ANALYSIS_LOADING: {
      const analysis = {
        ...state.analysis,
        loading: {
          ...state.analysis.loading,
          [action.payload.type]: true
        },
        error: {
          ...state.analysis.error,
          [action.payload.type]: false
        }
      };
      return Object.assign({}, state, { analysis });
    }
    case SET_OPERATORS_DETAIL_MAP_LOCATION: {
      const map = Object.assign({}, state.map, action.payload);
      return Object.assign({}, state, { map });
    }

    case SET_OPERATORS_DETAIL_FMU_SELECTED: {
      return Object.assign({}, state, { fmu: action.payload });
    }

    case SET_OPERATORS_DETAIL_FMU_BOUNDS: {
      return Object.assign({}, state, { fmuBounds: action.payload });
    }

    case SET_OPERATORS_DETAIL_MAP_INTERACTIONS: {
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
    case SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS: {
      const { features = [], lngLat = {} } = action.payload;
      const hoverInteractions = features.slice().reverse().reduce(
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
        hoverLatLng: lngLat,
        hoverInteractions
      };
    }
    case SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS: {
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
    case SET_OPERATORS_DETAIL_MAP_LAYERS_ACTIVE: {
      return {
        ...state,
        layersActive: action.payload
      };
    }
    default:
      return state;
  }
}

// SETTERS
// - setMapLocation
// - setFmuSelected
// - setAnalysis
export function setOperatorsDetailMapLocation(mapLocation) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_LOCATION,
    payload: mapLocation
  };
}

export function setOperatorsDetailFmu(fmu) {
  return {
    type: SET_OPERATORS_DETAIL_FMU_SELECTED,
    payload: fmu
  };
}

export function setOperatorsDetailFmuBounds(payload) {
  return {
    type: SET_OPERATORS_DETAIL_FMU_BOUNDS,
    payload
  };
}

function fetchIntegratedAlertsAnalysis(dispatch, getState, data, fmu, type) {
  const geostoreId = data.id;
  const { startDate, trimEndDate } = fmu['integrated-alerts'];

  // if trimEndDate is not valid, that means we probably did not download layer metadata yet, do not fetch analysis
  if (isNaN(Date.parse(trimEndDate))) return null;

  const sql = `
    SELECT count(*), SUM(area__ha)
    FROM data
    WHERE gfw_integrated_alerts__date >= '${startDate}' AND
          gfw_integrated_alerts__date <= '${trimEndDate}'
    GROUP BY gfw_integrated_alerts__confidence
  `
  const url = new URL(`${process.env.GFW_PROXY_API}/dataset/gfw_integrated_alerts/latest/query`);

  url.searchParams.set('geostore_id', geostoreId);
  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('sql', sql);

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then((response) => {
      const { operatorsDetailFmus } = getState();
      const { analysis } = operatorsDetailFmus;
      const { data: analysisData } = analysis;

      // response data array element example
      // { gfw_integrated_alerts__confidence: 'high', count: 1232, area__ha: 15.151760000000001 }

      dispatch({
        type: GET_FMU_ANALYSIS_SUCCESS,
        payload: {
          type,
          data: {
            [fmu.id]: {
              geostore: data.id,
              ...analysisData[fmu.id],
              'integrated-alerts': response && response.data
            }
          }
        }
      });
    })
    .catch(error => dispatch({ type: GET_FMU_ANALYSIS_ERROR, payload: { type } }));
}

const ANALYSIS = {
  'gain': {
    sum: 'area__ha',
    filters: 'is__umd_tree_cover_gain',
    group_by: 'is__umd_tree_cover_gain'
  },
  'loss': {
    sum: 'area__ha',
    filters: 'umd_tree_cover_density_2000__30', // extentYear: 2000, threshold: 30
    group_by: 'umd_tree_cover_loss__year'
  }
}

function fetchZonalAnalysis(geostoreId, startDate, endDate, analysis) {
  const url = new URL(`${process.env.GFW_PROXY_API}/analysis/zonal/${geostoreId}`);

  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set('sum', ANALYSIS[analysis].sum);
  url.searchParams.set('filters', ANALYSIS[analysis].filters);
  url.searchParams.set('group_by', ANALYSIS[analysis].group_by);

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (response.ok) return response.json();
    throw new Error(response.statusText);
  });
}

function fetchAnalysis(dispatch, getState, data, fmu, type) {
  dispatch({ type: GET_FMU_ANALYSIS_LOADING, payload: { type } });

  if (type === 'integrated-alerts') return fetchIntegratedAlertsAnalysis(dispatch, getState, data, fmu, type);

  const { startDate, trimEndDate } = fmu[type];
  const geostoreId = data.id;

  return Promise.all([
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'gain'),
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'loss'),
  ])
    .then(([gainResponse, lossResponse]) => {
      const gain = (gainResponse.data && gainResponse.data[0] && gainResponse.data[0].area__ha) || 0;
      const loss = sumBy(lossResponse.data, 'area__ha') || 0;

      const { operatorsDetailFmus } = getState();
      const { analysis } = operatorsDetailFmus;
      const { data: analysisData } = analysis;

      dispatch({
        type: GET_FMU_ANALYSIS_SUCCESS,
        payload: {
          type,
          data: {
            [fmu.id]: {
              geostore: data.id,
              ...analysisData[fmu.id],
              loss: { loss },
              gain: { gain }
            }
          }
        }
      });
    })
    .catch(error => {
      dispatch({ type: GET_FMU_ANALYSIS_ERROR, payload: { type } });
    });
}

// GEOSTORE
export function setOperatorsDetailAnalysis(fmu, type) {
  return (dispatch, getState) => {
    const { operatorsDetailFmus } = getState();
    const { analysis } = operatorsDetailFmus;
    const { data: analysisData } = analysis;

    if (!fmu.geojson) {
      return null;
    }

    if (analysisData && analysisData[fmu.id] && analysisData[fmu.id].geostore) {
      return fetchAnalysis(dispatch, getState, { id: analysisData[fmu.id].geostore }, fmu, type);
    }

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FMU_ANALYSIS_LOADING, payload: { type } });

    fetch(`${process.env.RW_API}/geostore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ geojson: fmu.geojson })
    }).then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    }).then(({ data }) => {
      return fetchAnalysis(dispatch, getState, data, fmu, type);
    }).catch((error) => dispatch({ type: GET_FMU_ANALYSIS_ERROR, payload: { type } }));
  };
}

export function setOperatorsDetailMapLayersSettings(payload) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS,
    payload
  };
}

export function setOperatorsDetailMapInteractions(payload) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_INTERACTIONS,
    payload
  };
}

export function setOperatorsDetailMapHoverInteractions(payload) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS,
    payload
  };
}

export function getIntegratedAlertsMetadata() {
  return (dispatch, state) => {
    return fetchIntegratedAlertsMetadata().then(({ minDataDate, maxDataDate }) => {
      const activeLayers = state().operatorsDetailFmus.layersActive;

      if (!minDataDate || !maxDataDate) {
        dispatch({
          type: SET_OPERATORS_DETAIL_MAP_LAYERS_ACTIVE,
          payload: activeLayers.filter(l => l !== 'integrated-alerts')
        });
        return;
      }

      const startDate = dayjs(maxDataDate).subtract(2, 'years').format('YYYY-MM-DD');

      dispatch({
        type: SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS,
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

      // put integrated-alerts before fmusdetail
      dispatch({
        type: SET_OPERATORS_DETAIL_MAP_LAYERS_ACTIVE,
        payload: [... new Set([
          ...activeLayers.slice(0, activeLayers.indexOf('fmusdetail')),
          'integrated-alerts',
          ...activeLayers.slice(activeLayers.indexOf('fmusdetail'))
        ])]
      });
    })
  };
}
