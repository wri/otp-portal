// Recomputes only when an argument changes identity, like a reselect selector caching one result.
// Map layers depend on this: an unchanged layer object lets react-map-gl skip its deep compare.
export function memoizeOne(fn) {
  let lastArgs = null;
  let lastResult;

  return (...args) => {
    if (lastArgs && args.length === lastArgs.length && args.every((arg, i) => arg === lastArgs[i])) {
      return lastResult;
    }
    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  };
}
