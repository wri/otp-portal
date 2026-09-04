import { configureStore, combineReducers } from '@reduxjs/toolkit';
import * as staticReducers from 'modules';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';

// HYDRATE seeds the client store from the server payload on first load. Later
// navigations already dispatch into the live store via getInitialProps, so the
// payload is redundant - and for a prerendered page it is a build-time snapshot
// whose empty slices would wipe what the client has since fetched.
let clientHydrated = false;

function createReducer(asyncReducers) {
  const combinedReducers = combineReducers({
    ...staticReducers,
    ...asyncReducers
  });

  const allReducers = (state, action) => {
    if (action.type === HYDRATE) {
      if (typeof window !== 'undefined') {
        if (clientHydrated) return state;
        clientHydrated = true;
      }

      return {
        ...state,
        ...action.payload,
      };
    }
    else {
      return combinedReducers(state, action);
    }
  }

  return allReducers;
}

const makeStore = (context) => {
  const store = configureStore({
    reducer: createReducer(),
    devTools: process.env.NODE_ENV !== 'production',
  });

  store.asyncReducers = {};
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  }

  return store;
}

export default createWrapper(makeStore);

