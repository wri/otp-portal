import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

// Utils
import { encode, decode, parseObjectSelectOptions, isEmpty } from 'utils/general';
import { setUrlParam } from 'utils/url';
import { addApiCases, createApiThunk } from 'utils/redux-helpers';

export const getDocumentsDatabase = createAsyncThunk(
  'database/getDocumentsDatabase',
  async (options = { reload: false }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { language, database } = getState();
      const filters = database.filters.data;
      const { page, pageSize } = database;

      const includes = [
        'operator',
        'operator.country',
        'fmu',
        'operator-document-annexes',
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
      ];
      const metadata = { timestamp: new Date().getTime() };

      const { data, response } = await API.get('operator-documents', {
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
      });

      return { data, pageCount: response.meta['page-count'], metadata };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getFilters = createApiThunk('database/getFilters', 'operator_document_filters_tree', {
  requestOptions: { deserialize: false },
  transformResponse: (data) => parseObjectSelectOptions(data)
});

function isLatestAction(state, action) {
  return action.payload?.metadata?.timestamp >= state.timestamp;
}

const databaseSlice = createSlice({
  name: 'database',
  initialState: {
    data: [],
    timestamp: null,
    page: 0,
    pageSize: 30,
    pageCount: -1, // react-table needs -1 by default
    loading: false,
    error: false,
    filters: {
      data: {},
      options: {},
      loading: false,
      error: false,
    },
    columns: ['country', 'document', 'forest-type', 'document-name', 'status', 'operator', 'fmu'],
  },
  reducers: {
    setFiltersDocuments: (state, action) => {
      state.filters.data = action.payload;
    },
    setActiveColumnsDocuments: (state, action) => {
      state.columns = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    addApiCases(getFilters, 'filters', 'options')(builder);

    builder
      .addCase(getDocumentsDatabase.pending, (state, action) => {
        if (action.meta.arg?.reload) {
          state.data = [];
          state.page = 0;
          state.pageCount = -1;
        }

        state.loading = true;
        state.error = false;
        state.timestamp = action.payload?.metadata?.timestamp || Date.now();
      })
      .addCase(getDocumentsDatabase.fulfilled, (state, action) => {
        if (!isLatestAction(state, action)) return;
        state.data = action.payload.data;
        state.pageCount = action.payload.pageCount;
        state.loading = false;
        state.error = false;
      })
      .addCase(getDocumentsDatabase.rejected, (state, action) => {
        if (!isLatestAction(state, action)) return;
        state.error = true;
        state.loading = false;
      })
  },
});

export const { setFiltersDocuments, setActiveColumnsDocuments, setPage } = databaseSlice.actions;


export function setActiveColumns(activeColumns) {
  return (dispatch) => {
    dispatch(setActiveColumnsDocuments(activeColumns));
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
  return (dispatch, getState) => {
    const newFilters = { ...getState().database.filters.data };
    Object.keys(filter).forEach((key) => {
      newFilters[key] = filter[key];
    });
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
    dispatch(setFiltersDocuments(payload));
  };
}

export default databaseSlice.reducer;
