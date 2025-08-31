import { configureStore, combineReducers } from '@reduxjs/toolkit';
import * as staticReducers from 'modules';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';

function createReducer(asyncReducers) {
  const combinedReducers = combineReducers({
    ...staticReducers,
    ...asyncReducers
  });

  const allReducers = (state, action) => {
    if (action.type === HYDRATE) {
      const nextState = {
        ...state,
        ...action.payload,
      };
      return nextState;
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

