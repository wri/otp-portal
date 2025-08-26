/**
 * Redux Toolkit helper utilities to reduce boilerplate in API reducers
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

/**
 * Creates standard API extra reducers for fetch operations
 * @param {Object} action - The async thunk action
 * @param {string} stateKey - Optional nested state key (e.g., 'filters' for state.filters.data)
 * @param {string} dataKey - Optional data key (e.g., 'data' for state.data)
 */
export function addApiCases(action, stateKey = null, dataKey = 'data') {
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
        setState(state, dataKey, action.payload.data);
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
    console.warn('Not latest action: skipping', { type: action.type, meta: action.meta });
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
    useUserToken = false,
    requestOptions = {},
    params = {},
    transformResponse = (data, _response, _arg) => ({ data })
  } = options;

  return createAsyncThunk(
    typePrefix,
    async (arg, { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const finalEndpoint = typeof endpoint === 'function' ? endpoint(arg, state) : endpoint;
        const finalParams = typeof params === 'function' ? params(arg, state) : params;

        const apiParams = {
          ...(useLanguage && { locale: state.language }),
          ...finalParams
        };

        const apiOptions = { ...requestOptions };
        if (useUserToken) {
          apiOptions.token = state.user.token;
        }

        const { data, response } = await API.get(finalEndpoint, apiParams, apiOptions);
        return transformResponse(data, response, arg);
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
 */
export function createNestedApiInitialState(keys, initialData = [], dataKey = 'data') {
  const state = {};
  keys.forEach(key => {
    state[key] = createApiInitialState(initialData)
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
