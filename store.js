import { configureStore, combineReducers } from '@reduxjs/toolkit';
import * as globalReducers from 'modules/index';
import { getRegisteredReducers, onReducerRegistered } from 'modules/registry';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';

function createReducer(asyncReducers) {
  const reducers = {
    ...globalReducers,
    ...getRegisteredReducers(),
    ...asyncReducers
  };
  const combinedReducers = combineReducers(reducers);

  const allReducers = (state, action) => {
    if (action.type === HYDRATE) {
      // The server process may know slices this page never imported; keeping their state would
      // only have combineReducers drop it (and warn) on the next action.
      const payload = Object.fromEntries(Object.entries(action.payload).filter(([key]) => key in reducers));
      const nextState = {
        ...state,
        ...payload,
      };
      return nextState;
    }
    else {
      return combinedReducers(state, action);
    }
  }

  return allReducers;
}

export const makeStore = (context) => {
  const store = configureStore({
    reducer: createReducer(),
    devTools: process.env.NODE_ENV !== 'production',
  });

  store.asyncReducers = {};
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  }

  // Slices imported after the store exists: the next page on client navigation, lazy chunks.
  // Server stores live for one request and are created after the page's modules have loaded.
  if (typeof window !== 'undefined') {
    onReducerRegistered(() => store.replaceReducer(createReducer(store.asyncReducers)));
  }

  return store;
}

// The registry is shared by the whole server process, so a request's store also holds slices that
// other pages registered. Those are still at their initial state, which the browser creates
// itself where a page uses them, so only slices this request changed are sent.
export const serializeState = (state) => {
  const registered = getRegisteredReducers();
  return Object.fromEntries(Object.entries(state).filter(([key, value]) => (
    !registered[key] || value !== registered[key](undefined, { type: '@@otp/INIT' })
  )));
};

export default createWrapper(makeStore, { serializeState });
