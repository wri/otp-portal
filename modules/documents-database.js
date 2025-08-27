import { createSlice, isPending } from '@reduxjs/toolkit';

// Utils
import { encode, decode, parseObjectSelectOptions, getApiFiltersParams } from 'utils/general';
import { setUrlParam } from 'utils/url';
import { addApiCases, createApiThunk } from 'utils/redux-helpers';

export const getDocumentsDatabase = createApiThunk(
  'database/getDocumentsDatabase',
  'operator-documents',
  {
    params: (_arg, { database }) => {
       const includes = [
        'operator',
        'operator.country',
        'fmu',
        'operator-document-annexes',
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
      ];
      const filters = database.filters.data;
      const { page, pageSize } = database;

      return {
        'page[number]': page + 1,
        'page[size]': pageSize,
        include: includes.join(','),
        'fields[fmus]': 'name,forest-type',
        'fields[operators]': 'name,country',
        'fields[countries]': 'name,iso',
        ...getApiFiltersParams(filters)
      }
    },
    transformResponse: (data, response) => {
      return { data, pageCount: response.meta['page-count'] }
    }
  }
)

export const getFilters = createApiThunk('database/getFilters', 'operator_document_filters_tree', {
  requestOptions: { deserialize: false },
  transformResponse: (data) => ({ options: parseObjectSelectOptions(data) })
});

const databaseSlice = createSlice({
  name: 'database',
  initialState: {
    data: [],
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
    addApiCases(getFilters, 'filters')(builder);
    addApiCases(getDocumentsDatabase)(builder);

    builder
      .addMatcher(isPending(getDocumentsDatabase), (state, action) => {
        if (action.meta.arg?.reload) {
          state.data = [];
          state.page = 0;
          state.pageCount = -1;
        }
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
