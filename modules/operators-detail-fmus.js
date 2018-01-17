const GET_FMU_ANALYSIS_SUCCESS = 'GET_FMU_ANALYSIS_SUCCESS';
const GET_FMU_ANALYSIS_LOADING = 'GET_FMU_ANALYSIS_LOADING';
const GET_FMU_ANALYSIS_ERROR = 'GET_FMU_ANALYSIS_ERROR';

const SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION = 'SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION';
const SET_OPERATORS_DETAIL_FMU_SELECTED = 'SET_OPERATORS_DETAIL_FMU_SELECTED';

/* Initial state */
const initialState = {
  map: {
    zoom: 5,
    center: {
      lat: 0,
      lng: 18
    },
    scrollZoom: false
  },
  fmu: {},
  analysis: {
    data: {},
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_FMU_ANALYSIS_SUCCESS: {
      const analysis = {
        data: { ...state.analysis.data, ...action.payload },
        loading: false,
        error: false
      };
      return Object.assign({}, state, { analysis });
    }
    case GET_FMU_ANALYSIS_ERROR: {
      const analysis = { ...state.analysis, error: true, loading: false };
      return Object.assign({}, state, { analysis });
    }
    case GET_FMU_ANALYSIS_LOADING: {
      const analysis = { ...state.analysis, loading: true, error: false };
      return Object.assign({}, state, { analysis });
    }
    case SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION: {
      const map = Object.assign({}, state.map, action.payload);
      return Object.assign({}, state, { map });
    }

    case SET_OPERATORS_DETAIL_FMU_SELECTED: {
      return Object.assign({}, state, { fmu: action.payload });
    }
    default:
      return state;
  }
}

// SETTERS
// - setMapLocation
// - setFmuSelected
// - setAnalysis
export function setMapLocation(mapLocation) {
  return {
    type: SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION,
    payload: mapLocation
  };
}

export function setFmuSelected(fmu) {
  return {
    type: SET_OPERATORS_DETAIL_FMU_SELECTED,
    payload: fmu
  };
}

// GEOSTORE
export function setAnalysis(fmu) {
  const requestSettings = [{ path: 'umd-loss-gain' }, { path: 'glad-alerts' }];
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FMU_ANALYSIS_LOADING });

    fetch(`${process.env.RW_API}/geostore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ geojson: fmu.geojson })
    })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then(({ data }) => {
      Promise.all(
        requestSettings.map(config => fetch(`${process.env.RW_API}/${config.path}?geostore=${data.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error(response.statusText);
        }))
      )
      .then((values) => {
        const [lossGains, gladAlerts] = values;

        dispatch({
          type: GET_FMU_ANALYSIS_SUCCESS,
          payload: {
            [fmu.id]: {
              lossGains: lossGains.data.attributes,
              gladAlerts: gladAlerts.data.attributes
            }
          }
        });
      });
    })
    .catch(error => console.error(error.message));
  };
}

