// Reducers of page-specific slices. A slice registers itself when its module is imported, so a
// page's bundle carries only the slices its own code uses, instead of all of them living in _app.
// store.js combines these with the global slices exported from modules/index.js.
const reducers = {};
const listeners = new Set();

export function registerReducer(key, reducer) {
  if (reducers[key] === reducer) return;
  reducers[key] = reducer;
  listeners.forEach((listener) => listener());
}

export function getRegisteredReducers() {
  return reducers;
}

// for the browser store, which outlives the page that created it
export function onReducerRegistered(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
