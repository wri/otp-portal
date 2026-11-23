/**
 * Redux Toolkit helper utilities to reduce boilerplate in API reducers
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from 'services/fetch-api';

/**
 * Creates standard API extra reducers for fetch operations
 * @param {Object} action - The async thunk action
 * @param {string} stateKey - Optional nested state key (e.g., 'filters' for state.filters.data)
 */
export function addApiCases(action, stateKey = null) {
  return (builder) => {
    const setState = (state, key, value) => {
      if (stateKey) {
        if (!state[stateKey]) {
          state[stateKey] = {};
        }
        state[stateKey][key] = value;
      } else {
        state[key] = value;
      }
    }
    const getState = (state, key) => {
      if (stateKey) return state[stateKey][key];
      return state[key]
    }

    builder
      .addCase(action.pending, (state, action) => {
        setState(state, 'loading', true);
        setState(state, 'error', false);
        setState(state, 'requestId', action.meta.requestId)
      })
      .addCase(action.fulfilled, (state, action) => {
        if (notLatestAction(getState(state, 'requestId'), action)) return;
        Object.assign(stateKey ? state[stateKey] : state, action.payload) // assign whole payload
        setState(state, 'loading', false);
        setState(state, 'error', false);
      })
      .addCase(action.rejected, (state, action) => {
        if (notLatestAction(getState(state, 'requestId'), action)) return;
        setState(state, 'error', true);
        setState(state, 'loading', false);
      });
  };
}

export function notLatestAction(stateRequestId, action) {
  if (stateRequestId !== action.meta.requestId) {
    if (process.env.ENV !== 'production') {
      console.warn('Not latest action: skipping', { type: action.type, meta: action.meta });
    }
    return true;
  }

  return false;
}

/**
 * Creates multiple API extra reducers at once
 * @param {Array} configs - Array of {action, stateKey} objects
 */
export function createMultipleApiExtraReducers(configs) {
  return (builder) => {
    configs.forEach(({ action, stateKey }) => {
      addApiCases(action, stateKey)(builder);
    });
  };
}

/**
 * Creates a simple API async thunk
 * @param {string} typePrefix - The action type prefix (e.g., 'help/getHowtos')
 * @param {string|Function} endpoint - The API endpoint or function that returns endpoint
 * @param {Object} options - Additional options
 */
export function createApiThunk(typePrefix, endpoint, options = {}) {
  const {
    useLanguage = true,
    auth = false,
    requestOptions = {},
    params = {},
    // the response passed in only carries `meta`
    transformResponse = (data, _response, _arg) => ({ data })
  } = options;

  return createAsyncThunk(
    typePrefix,
    async (arg, { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const finalEndpoint = typeof endpoint === 'function' ? endpoint(arg, state) : endpoint;
        const finalParams = typeof params === 'function' ? params(arg, state) : params;

        // Page data is public unless the thunk asks for `auth: true`; without that
        // a logged-in user would get their own view of every list on the site.
        const { data, meta } = await fetchApi(finalEndpoint, {
          ...requestOptions,
          locale: useLanguage ? state.language : undefined,
          params: finalParams,
          auth,
          meta: true
        });
        return transformResponse(data, { meta }, arg);
      } catch (err) {
        console.error(err);
        return rejectWithValue(err.message);
      }
    },
  );
}

/**
 * Wraps a service call as a thunk: `fn(arg, state)` resolves with the payload.
 * @param {string} typePrefix - The action type prefix
 * @param {Function} fn - Returns a promise of the payload
 */
export function createServiceThunk(typePrefix, fn) {
  return createAsyncThunk(
    typePrefix,
    async (arg, { getState, rejectWithValue }) => {
      try {
        return await fn(arg, getState());
      } catch (err) {
        console.error(err);
        return rejectWithValue(err.message);
      }
    },
  );
}

/**
 * Creates initial state for nested API resources
 * @param {Array} keys - Array of state keys (e.g., ['howtos', 'tools', 'faqs'])
 * @param {*} initialData - Initial data value (default: [])
 * @param {*} dataKey - Data key (default: data)
 */
export function createNestedApiInitialState(keys, initialData = [], dataKey = 'data') {
  const state = {};
  keys.forEach(key => {
    state[key] = createApiInitialState(initialData, dataKey)
  });
  return state;
}

export function createApiInitialState(initialData = [], dataKey = 'data') {
  return {
    [dataKey]: initialData,
    loading: false,
    error: false
  }
}
