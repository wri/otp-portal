import dayjs from 'dayjs';

import API from 'services/api';
import { parseDocument } from 'utils/documents';

/* Constants */
const GET_OPERATOR_SUCCESS = 'GET_OPERATOR_SUCCESS';
const GET_OPERATOR_ERROR = 'GET_OPERATOR_ERROR';
const GET_OPERATOR_LOADING = 'GET_OPERATOR_LOADING';

const GET_OPERATOR_OBSERVATIONS_SUCCESS = 'GET_OPERATOR_OBSERVATIONS_SUCCESS';
const GET_OPERATOR_OBSERVATIONS_ERROR = 'GET_OPERATOR_OBSERVATIONS_ERROR';
const GET_OPERATOR_OBSERVATIONS_LOADING = 'GET_OPERATOR_OBSERVATIONS_LOADING';

const GET_OPERATOR_DOCUMENTATION_SUCCESS = 'GET_OPERATOR_DOCUMENTATION_SUCCESS';
const GET_OPERATOR_DOCUMENTATION_ERROR = 'GET_OPERATOR_DOCUMENTATION_ERROR';
const GET_OPERATOR_DOCUMENTATION_LOADING = 'GET_OPERATOR_DOCUMENTATION_LOADING';

const GET_OPERATOR_PUBLICATION_AUTHORIZATION_SUCCESS = 'GET_OPERATOR_PUBLICATION_AUTHORIZATION_SUCCESS';
const GET_OPERATOR_PUBLICATION_AUTHORIZATION_ERROR = 'GET_OPERATOR_PUBLICATION_AUTHORIZATION_ERROR';

const GET_OPERATOR_TIMELINE_SUCCESS = 'GET_OPERATOR_TIMELINE_SUCCESS';
const GET_OPERATOR_TIMELINE_ERROR = 'GET_OPERATOR_TIMELINE_ERROR';
const GET_OPERATOR_TIMELINE_LOADING = 'GET_OPERATOR_TIMELINE_LOADING';

const SET_OPERATOR_DOCUMENTATION_DATE = 'SET_OPERATOR_DOCUMENTATION_DATE';
const SET_OPERATOR_DOCUMENTATION_FMU = 'SET_OPERATOR_DOCUMENTATION_FMU';

/* Constants sawmills */
const GET_SAWMILLS_SUCCESS = 'GET_SAWMILLS_SUCCESS';
const GET_SAWMILLS_ERROR = 'GET_SAWMILLS_ERROR';
const GET_SAWMILLS_LOADING = 'GET_SAWMILLS_LOADING';

const GET_SAWMILLS_LOCATIONS_SUCCESS = 'GET_SAWMILLS_LOCATION_SUCCESS';
const GET_SAWMILLS_LOCATIONS_LOADING = 'GET_SAWMILLS_LOCATION_LOADING';
const GET_SAWMILLS_LOCATIONS_ERROR = 'GET_SAWMILLS_LOCATION_ERROR';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false,
  observations: {
    operatorId: null,
    data: [],
    loading: false,
    error: false,
    timestamp: null
  },
  documentation: {
    operatorId: null,
    data: [],
    loading: false,
    error: false,
    timestamp: null
  },
  publicationAuthorization: null,
  date: dayjs().format('YYYY-MM-DD'),
  fmu: null,
  timeline: [],
  sawmills: {
    data: [],
    loading: false,
    error: false,
  },
  sawmillsLocations: {
    data: [],
    loading: false,
    error: false,
  },
};

function isLatestAction(state, action) {
  return action.metadata.timestamp >= state.timestamp;
}

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_OPERATOR_SUCCESS: {
      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    }
    case GET_OPERATOR_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_OPERATOR_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    case SET_OPERATOR_DOCUMENTATION_DATE: {
      const documentation = Object.assign({}, state, {
        date: action.payload,
      });
      return Object.assign({}, state, documentation);
    }
    case SET_OPERATOR_DOCUMENTATION_FMU: {
      const documentation = Object.assign({}, state, {
        fmu: action.payload,
      });
      return Object.assign({}, state, documentation);
    }
    case GET_OPERATOR_TIMELINE_SUCCESS: {
      return Object.assign({}, state, {
        timeline: action.payload,
        loading: false,
        error: false,
      });
    }
    case GET_OPERATOR_TIMELINE_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_OPERATOR_TIMELINE_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    case GET_OPERATOR_DOCUMENTATION_SUCCESS: {
      if (!isLatestAction(state.documentation, action)) return state;

      const documentation = Object.assign({}, state.documentation, {
        data: action.payload,
        operatorId: action.metadata.operatorId,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_OPERATOR_DOCUMENTATION_ERROR: {
      if (!isLatestAction(state.documentation, action)) return state;

      const documentation = Object.assign({}, state.documentation, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_OPERATOR_DOCUMENTATION_LOADING: {
      const documentation = Object.assign({}, state.documentation, {
        loading: true,
        error: false,
        timestamp: action.metadata.timestamp
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_OPERATOR_OBSERVATIONS_LOADING: {
      const observations = Object.assign({}, state.observations, {
        timestamp: action.metadata.timestamp,
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { observations });
    }
    case GET_OPERATOR_OBSERVATIONS_SUCCESS: {
      if (!isLatestAction(state.observations, action)) return state;

      const observations = Object.assign({}, state.observations, {
        data: action.payload,
        operatorId: action.metadata.operatorId,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { observations });
    }
    case GET_OPERATOR_OBSERVATIONS_ERROR: {
      if (!isLatestAction(state.observations, action)) return state;

      const observations = Object.assign({}, state.observations, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { observations });
    }
    case GET_OPERATOR_PUBLICATION_AUTHORIZATION_SUCCESS: {
      return Object.assign({}, state, { publicationAuthorization: action.payload });
    }
    case GET_OPERATOR_PUBLICATION_AUTHORIZATION_ERROR: {
      return Object.assign({}, state, { publicationAuthorization: null });
    }
    case GET_SAWMILLS_SUCCESS: {
      const sawmills = Object.assign({}, state.sawmills, {
        data: action.payload,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { sawmills });
    }
    case GET_SAWMILLS_ERROR: {
      const sawmills = Object.assign({}, state.sawmills, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { sawmills });
    }
    case GET_SAWMILLS_LOADING: {
      const sawmills = Object.assign({}, state.sawmills, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { sawmills });
    }

      // Get all sawmills geojson by Operator ID
    case GET_SAWMILLS_LOCATIONS_SUCCESS: {
      const sawmillsLocations = Object.assign({}, state.sawmillsLocations, {
        data: action.payload.features,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { sawmillsLocations });
    }
    case GET_SAWMILLS_LOCATIONS_LOADING: {
      const sawmillsLocations = Object.assign({}, state.sawmillsLocations, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { sawmillsLocations });
    }
    case GET_SAWMILLS_LOCATIONS_ERROR: {
      const sawmillsLocations = Object.assign({}, state.sawmillsLocations, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { sawmillsLocations });
    }

    default:
      return state;
  }
}

export function getOperatorBySlug(slug, loadFMUS = false) {
  return (dispatch, getState) => {
    const { user, language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATOR_LOADING });

    const includes = [
      'country',
      'fmus',
      'observations'
    ];
    const fields = {
      'fields[countries]': 'name,id,iso',
      'fields[observations]': 'id,hidden'
    }
    if (!loadFMUS) {
      fields['fields[fmus]'] = 'name,id';
    }

    return API.get(`operators`, {
      locale: language,
      include: includes.join(','),
      ...fields,
      'filter[slug]': slug
    }, {
      token: user.token
    })
      .then(({ data }) => {
        const operator = data[0];
        if (!operator) throw new Error('Operator not found');
        operator.loadedFMUS = loadFMUS;

        dispatch({
          type: GET_OPERATOR_SUCCESS,
          payload: operator,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_ERROR,
          payload: err.message,
        });
      });
  };
}

/* Action creators */
export function getOperator(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATOR_LOADING });

    const includeFields = [
      'country',
      'fmus',
    ];

    return API.get(`operators/${id}`, {
      locale: language,
      include: includeFields.join(','),
    }, {
      token: user.token
    })
      .then(({ data }) => {
        dispatch({
          type: GET_OPERATOR_SUCCESS,
          payload: data,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_ERROR,
          payload: err.message,
        });
      });
  };
}

export function getOperatorDocumentation(id) {
  return (dispatch, getState) => {
    const { user, language, operatorsDetail } = getState();
    const date = operatorsDetail.date;
    const metadata = { timestamp: new Date(), operatorId: id };

    dispatch({ type: GET_OPERATOR_DOCUMENTATION_LOADING, metadata });

    const includeFields = [
      'required-operator-document',
      'required-operator-document.required-operator-document-group',
      'operator-document-annexes',
      'fmu',
    ];

    return API.get('operator-document-histories', {
      locale: language,
      include: includeFields.join(','),
      'fields[fmus]': 'name',
      'filter[operator-id]': id,
      'filter[date]': date,
    }, {
      token: user.token
    })
      .then(({ data }) => {
        dispatch({
          type: GET_OPERATOR_DOCUMENTATION_SUCCESS,
          payload: data,
          metadata
        });
      })
      .catch((err) => {
        dispatch({
          type: GET_OPERATOR_DOCUMENTATION_ERROR,
          payload: err.message,
          metadata
        });
      });
  };
}

export function getOperatorObservations(operatorId) {
  return (dispatch, getState) => {
    const { language } = getState();

    const includes = [
      'country',
      'fmu',
      'observers',
      'severity',
      'subcategory',
      'subcategory.category',
      'observation-report',
      'observation-documents',
      'relevant-operators',
      'operator',
    ];

    const timestamp = new Date();
    const metadata = { timestamp, operatorId };
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATOR_OBSERVATIONS_LOADING, metadata });

    return API.get('observations', {
      locale: language,
      include: includes.join(','),
      'fields[fmus]': 'name',
      'filter[operator]': operatorId,
      'filter[hidden]': 'all'
    })
      .then(({ data }) => {
        dispatch({
          type: GET_OPERATOR_OBSERVATIONS_SUCCESS,
          payload: data,
          metadata
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_OBSERVATIONS_ERROR,
          payload: err.message,
          metadata
        });
      });
  };
}

export function getOperatorPublicationAuthorization(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();

    const includeFields = [
      'required-operator-document',
      'required-operator-document.required-operator-document-group',
    ];

    return API.get('operator-documents', {
      locale: language,
      include: includeFields.join(','),
      'filter[operator-id]': id,
      'filter[contract-signature]': true,
    }, {
      token: user.token,
    })
      .then(({ data }) => {
        const doc = data.find((doc) => doc['required-operator-document']['contract-signature']);

        dispatch({
          type: GET_OPERATOR_PUBLICATION_AUTHORIZATION_SUCCESS,
          payload: parseDocument(doc)
        });
      })
      .catch((_err) => {
        dispatch({
          type: GET_OPERATOR_PUBLICATION_AUTHORIZATION_ERROR
        });
      });
  };
}

export function getOperatorTimeline(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();
    dispatch({ type: GET_OPERATOR_TIMELINE_LOADING });

    return API.get('score-operator-documents', {
      locale: language,
      'filter[operator]': id,
    }, {
      token: user.token
    })
      .then(({ data }) => {
        dispatch({
          type: GET_OPERATOR_TIMELINE_SUCCESS,
          payload: data,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_TIMELINE_ERROR,
          payload: err.message,
        });
      });
  };
}

/* Action creators */
export function getSawMillsByOperatorId(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_SAWMILLS_LOADING });

    return API.get('sawmills', {
      'filter[operator]': id
    })
      .then(({ data }) => {
        dispatch({
          type: GET_SAWMILLS_SUCCESS,
          payload: data,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_SAWMILLS_ERROR,
          payload: err.message,
        });
      });
  };
}

export function getSawMillsLocationByOperatorId(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_SAWMILLS_LOCATIONS_LOADING });

    return API.get('sawmills', {
      'filter[operator]': id,
      format: 'geojson'
    }, { deserialize: false })
      .then(({ data }) => {
        // Fetch from server ok -> Dispatch geojson sawmill data
        dispatch({
          type: GET_SAWMILLS_LOCATIONS_SUCCESS,
          payload: data,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_SAWMILLS_LOCATIONS_ERROR,
          payload: err.message,
        });
      });
  };
}

export function setOperatorDocumentationDate(date) {
  return (dispatch) => {
    dispatch({
      type: SET_OPERATOR_DOCUMENTATION_DATE,
      payload: date,
    });
  };
}

export function setOperatorDocumentationFMU(fmu) {
  return (dispatch) => {
    dispatch({
      type: SET_OPERATOR_DOCUMENTATION_FMU,
      payload: fmu,
    });
  };
}
