import API from 'services/api';

// Utils
import { encode, decode, parseObjectSelectOptions, isEmpty } from 'utils/general';
import { setUrlParam } from 'utils/url';

/* Constants */
const GET_DOCUMENTS_DB_SUCCESS = 'GET_DOCUMENTS_DB_SUCCESS';
const GET_DOCUMENTS_DB_ERROR = 'GET_DOCUMENTS_DB_ERROR';
const GET_DOCUMENTS_DB_LOADING = 'GET_DOCUMENTS_DB_LOADING';

const GET_FILTERS_DOCUMENTS_DB_SUCCESS = 'GET_FILTERS_DOCUMENTS_DB_SUCCESS';
const GET_FILTERS_DOCUMENTS_DB_ERROR = 'GET_FILTERS_DOCUMENTS_DB_ERROR';
const GET_FILTERS_DOCUMENTS_DB_LOADING = 'GET_FILTERS_DOCUMENTS_DB_LOADING';
const SET_FILTERS_DOCUMENTS_DB = 'SET_FILTERS_DOCUMENTS_DB';
const SET_ACTIVE_COLUMNS_DOCUMENTS_DB = 'SET_ACTIVE_COLUMNS_DOCUMENTS_DB';
const SET_PAGE_COUNT = 'SET_PAGE_COUNT';
const SET_PAGE = 'SET_PAGE';
const RELOAD_DOCUMENTS = 'RELOAD_DOCUMENTS';

/* Initial state */
const initialState = {
  data: [],
  timestamp: null,
  page: 0,
  pageSize: 30,
  pageCount: -1, // react-table needs -1 by default
  loading: false,
  error: false,
  filters: {
    data: {
      forest_types: [],
      type: [],
      status: [],
      country_ids: [],
      operator_id: [],
      fmu_id: [],
      required_operator_document_id: [],
      source: [],
      legal_categories: []
    },
    options: {},
    loading: false,
    error: false,
  },
  columns: ['country', 'document', 'forest-type', 'document-name', 'status', 'operator', 'fmu'],
};

function isLatestAction(state, action) {
  return action.metadata.timestamp >= state.timestamp;
}

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case RELOAD_DOCUMENTS:
      return Object.assign({}, state, {
        data: [],
        loading: false,
        error: false,
        timestamp: null,
        pageCount: -1,
        page: 0
      });
    case GET_DOCUMENTS_DB_SUCCESS:
      if (!isLatestAction(state, action)) return state;

      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    case GET_DOCUMENTS_DB_ERROR:
      if (!isLatestAction(state, action)) return state;

      return Object.assign({}, state, { error: true, loading: false });
    case GET_DOCUMENTS_DB_LOADING:
      return Object.assign({}, state, { loading: true, error: false, timestamp: action.metadata.timestamp });
    // Filters
    case GET_FILTERS_DOCUMENTS_DB_SUCCESS: {
      const newFilters = Object.assign({}, state.filters, {
        options: action.payload,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_DOCUMENTS_DB_ERROR: {
      const newFilters = Object.assign({}, state.filters, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_DOCUMENTS_DB_LOADING: {
      const newFilters = Object.assign({}, state.filters, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_FILTERS_DOCUMENTS_DB: {
      const newFilters = Object.assign({}, state.filters, {
        data: action.payload,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_ACTIVE_COLUMNS_DOCUMENTS_DB: {
      return Object.assign({}, state, { columns: action.payload });
    }
    case SET_PAGE: {
      return Object.assign({}, state, { page: action.payload });
    }
    case SET_PAGE_COUNT:
      if (!isLatestAction(state, action)) return state;

      return Object.assign({}, state, { pageCount: action.payload });
    default:
      return state;
  }
}

/* Action creators */
export function getDocumentsDatabase(options = { reload: false }) {
  return (dispatch, getState) => {
    if (options.reload) {
      dispatch({
        type: RELOAD_DOCUMENTS
      });
    }

    const { language } = getState();
    const filters = getState().database.filters.data;
    const { page, pageSize } = getState().database;

    const includes = [
      'operator',
      'operator.country',
      'fmu',
      'operator-document-annexes',
      'required-operator-document',
      'required-operator-document.required-operator-document-group',
    ];
    const metadata = { timestamp: new Date() };

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_DOCUMENTS_DB_LOADING, metadata });

    return API.get('operator-documents', {
      locale: language,
      'page[number]': page + 1,
      'page[size]': pageSize,
      include: includes.join(','),
      'fields[fmus]': 'name,forest-type',
      'fields[operators]': 'name,country',
      'fields[countries]': 'name,iso',
      ...Object.keys(filters).reduce((acc, key) => {
        if (isEmpty(filters[key])) return acc;
        return {
          ...acc,
          [`filter[${key}]`]: filters[key].join(',')
        }
      }, {})
    })
      .then(({ data, response }) => {
        dispatch({
          type: GET_DOCUMENTS_DB_SUCCESS,
          payload: data,
          metadata
        });

        dispatch({
          type: SET_PAGE_COUNT,
          payload: response.meta['page-count'],
          metadata
        })
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_DOCUMENTS_DB_ERROR,
          payload: err.message,
          metadata
        });
      });
  };
}

export function getFilters() {
  return (dispatch, getState) => {
    const { language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FILTERS_DOCUMENTS_DB_LOADING });

    return API.get('operator_document_filters_tree', {
      locale: language
    }, { deserialize: false })
      .then(({ data }) => {
        dispatch({
          type: GET_FILTERS_DOCUMENTS_DB_SUCCESS,
          payload: parseObjectSelectOptions(data),
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FILTERS_DOCUMENTS_DB_ERROR,
          payload: err.message,
        });
      });
  };
}

export function setActiveColumns(activeColumns) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_COLUMNS_DOCUMENTS_DB,
      payload: activeColumns,
    });
  };
}

export function setPage(page) {
  return (dispatch) => {
    dispatch({
      type: SET_PAGE,
      payload: page,
    });
  };
}

function setUrlFilters(filters) {
  const queryFiltersObj = {};

  Object.keys(filters).forEach((key) => {
    if (filters[key] && filters[key].length) queryFiltersObj[key] = filters[key];
  });

  setUrlParam('filters', Object.keys(queryFiltersObj).length ? encode(queryFiltersObj) : null);
}

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().database.filters.data);
    Object.keys(filter).forEach((key) => {
      newFilters[key] = filter[key];
    })
    setUrlFilters(newFilters);
  };
}

export function getDocumentsDatabaseUrl(url) {
  return (dispatch) => {
    const filters = url.query.filters;
    let payload = {};
    if (filters) {
      payload = {
        ...decode(url.query.filters),
      };
    }
    dispatch({
      type: SET_FILTERS_DOCUMENTS_DB,
      payload,
    });
  };
}
