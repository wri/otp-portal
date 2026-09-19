import { describe, it, expect } from 'vitest';

import {
  encode,
  decode,
  parseSelectOptions,
  parseObjectSelectOptions,
  omit,
  omitBy,
  isEmpty,
  sumBy,
  transformValues,
  groupBy,
  removeDiacritics,
  getApiFiltersParams
} from '../general';

describe('encode / decode', () => {
  it('round trips an object', () => {
    const obj = { operator: [1, 2], country: 'CMR' };

    expect(decode(encode(obj))).toEqual(obj);
  });

  it('decodes garbage to an empty object', () => {
    expect(decode('not base64 json')).toEqual({});
  });
});

describe('select options', () => {
  it('adds label and value from name and id', () => {
    expect(parseSelectOptions([{ id: 1, name: 'Cameroon', iso: 'CMR' }])).toEqual([
      { id: 1, name: 'Cameroon', iso: 'CMR', label: 'Cameroon', value: 1 }
    ]);
  });

  it('parses every list of an object', () => {
    expect(parseObjectSelectOptions({ country: [{ id: 1, name: 'Gabon' }], operator: [] })).toEqual({
      country: [{ id: 1, name: 'Gabon', label: 'Gabon', value: 1 }],
      operator: []
    });
  });
});

describe('omit / omitBy', () => {
  it('omits a single key or a list of keys without mutating', () => {
    const obj = { a: 1, b: 2, c: 3 };

    expect(omit(obj, 'a')).toEqual({ b: 2, c: 3 });
    expect(omit(obj, ['a', 'c'])).toEqual({ b: 2 });
    expect(obj).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('omits values matching the predicate', () => {
    expect(omitBy({ a: 1, b: null, c: 0 }, (v) => v === null)).toEqual({ a: 1, c: 0 });
  });
});

describe('isEmpty', () => {
  it.each([
    [null, true],
    [undefined, true],
    [0, true],
    ['', true],
    [[], true],
    [{}, true],
    [new Map(), true],
    ['a', false],
    [[1], false],
    [{ a: 1 }, false],
    [new Set([1]), false]
  ])('isEmpty(%o) is %s', (value, expected) => {
    expect(isEmpty(value)).toBe(expected);
  });
});

describe('sumBy', () => {
  it('sums by key', () => {
    expect(sumBy([{ n: 1 }, { n: 2.5 }], 'n')).toBe(3.5);
  });

  it('sums by function', () => {
    expect(sumBy([{ n: 1 }, { n: 2 }], (item) => item.n * 2)).toBe(6);
  });
});

describe('transformValues', () => {
  it('maps every value', () => {
    expect(transformValues({ a: [1, 2], b: [] }, (v) => v.length)).toEqual({ a: 2, b: 0 });
  });
});

describe('groupBy', () => {
  it('groups by key or function', () => {
    const items = [{ type: 'a', n: 1 }, { type: 'b', n: 2 }, { type: 'a', n: 3 }];

    expect(groupBy(items, 'type')).toEqual({ a: [items[0], items[2]], b: [items[1]] });
    expect(groupBy(items, (i) => i.n % 2)).toEqual({ 1: [items[0], items[2]], 0: [items[1]] });
  });
});

describe('removeDiacritics', () => {
  it('strips accents and handles empty values', () => {
    expect(removeDiacritics('Société Forestière')).toBe('Societe Forestiere');
    expect(removeDiacritics(null)).toBe('');
  });
});

describe('getApiFiltersParams', () => {
  it('builds filter params and skips empty filters', () => {
    expect(getApiFiltersParams({ country: [7, 47], operator: [], fmu: undefined })).toEqual({
      'filter[country]': '7,47'
    });
  });
});
