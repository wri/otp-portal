import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
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
  const store = createStore(
    createReducer(),
    {},
    compose(
      applyMiddleware(thunk),
      /* Redux dev tool, install chrome extension in
       * https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en */
      typeof window === 'object' &&
        typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    )
  );

  store.asyncReducers = {};
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  }

  return store;
}

export default createWrapper(makeStore);

