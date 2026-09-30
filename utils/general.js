export function encode(obj) {
  return btoa(JSON.stringify(obj));
}

export function decode(obj) {
  try {
    return JSON.parse(atob(obj));
  } catch (e) {
    return {};
  }
}

export function parseSelectOptions(options) {
  return options.map(o => (
    { ...o, label: o.name, value: o.id }
  ));
}

export function parseObjectSelectOptions(object) {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    newObject[key] = parseSelectOptions(object[key]);
  });
  return newObject;
}

export function omit(obj, _keys) {
  const keys = [_keys].flat();
  const newObj = { ...obj };
  keys.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
}

export function omitBy(obj, fn) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!fn(obj[key])) acc[key] = obj[key];
    return acc;
  }, {});
}

export function isEmpty(obj) {
  if (obj?.length || obj?.size) return false;
  if (typeof obj !== 'object') return true;
  for (const key in obj) if (Object.hasOwn(obj, key)) return false;
  return true;
}

// like lodash, undefined values are skipped rather than turning the sum into NaN
export function sumBy(arr, funcOrKey) {
  const iteratee = toIteratee(funcOrKey);
  return arr.reduce((acc, item) => {
    const value = iteratee(item);
    return value === undefined ? acc : acc + value;
  }, 0);
}

function toIteratee(iteratee) {
  if (typeof iteratee === 'function') return iteratee;
  if (iteratee === undefined) return (item) => item;
  const path = String(iteratee).split('.');
  return (item) => path.reduce((value, key) => value?.[key], item);
}

// lodash's order: null, then undefined, then NaN sort after every other value
function sortRank(value) {
  if (value === null) return 1;
  if (value === undefined) return 2;
  if (value !== value) return 3; // eslint-disable-line no-self-compare
  return 0;
}

function compareAscending(a, b) {
  const rankA = sortRank(a);
  const rankB = sortRank(b);
  if (rankA || rankB) return rankA - rankB;
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

// Stable ascending sort by one or more keys (property paths or functions), as lodash/sortBy.
export function sortBy(collection, iteratees) {
  const fns = [iteratees].flat().map(toIteratee);
  const items = collection ? Object.values(collection) : [];

  return items
    .map((item) => ({ item, keys: fns.map((fn) => fn(item)) }))
    .sort((a, b) => {
      for (let i = 0; i < fns.length; i++) {
        const result = compareAscending(a.keys[i], b.keys[i]);
        if (result) return result;
      }
      return 0;
    })
    .map(({ item }) => item);
}

export function uniqBy(arr, iteratee) {
  const fn = toIteratee(iteratee);
  const seen = new Set();
  return (arr || []).filter((item) => {
    const key = fn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Trailing-edge only, which is lodash/debounce's default and all this app uses.
export function debounce(fn, wait = 0) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

export function transformValues(obj, func) {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[key] = func(obj[key]);
  });
  return newObj;
}

export function groupBy(arr, criteria) {
  return arr.reduce((obj, item) => {
    const key = typeof criteria === 'function' ? criteria(item) : item[criteria];
    if (!obj.hasOwnProperty(key)) {
      obj[key] = [];
    }
    obj[key].push(item);
    return obj;
  }, {});
}

export function removeDiacritics(str) {
  return (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function getApiFiltersParams(filters) {
  return {
    ...Object.keys(filters).reduce((acc, key) => {
      if (isEmpty(filters[key])) return acc;
      return {
        ...acc,
        [`filter[${key}]`]: filters[key].join(',')
      }
    }, {})
  }
}
