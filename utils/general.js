export function toBase64(file, cb) {
  const reader = new FileReader();
  reader.onload = (event) => {
    cb && cb(event.target.result);
  };
  reader.readAsDataURL(file);
}

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

export function sumBy(arr, funcOrKey) {
  if (typeof funcOrKey === 'string') {
    return arr.reduce((acc, item) => acc + item[funcOrKey], 0);
  }

  return arr.reduce((acc, item) => acc + func(item), 0);
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
