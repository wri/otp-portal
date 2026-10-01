import { describe, it, expect, vi } from 'vitest';

import {
  encode,
  decode,
  parseSelectOptions,
  parseObjectSelectOptions,
  omit,
  omitBy,
  isEmpty,
  sumBy,
  sortBy,
  uniqBy,
  debounce,
  transformValues,
  groupBy,
  removeDiacritics,
  htmlToText,
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

  it('skips undefined values', () => {
    expect(sumBy([{ n: 1 }, {}, { n: 2 }], 'n')).toBe(3);
  });
});

describe('sortBy', () => {
  it('sorts by key, nested path and function', () => {
    const items = [{ name: 'b', fmu: { name: 'y' } }, { name: 'a', fmu: { name: 'z' } }, { name: 'c', fmu: { name: 'x' } }];

    expect(sortBy(items, 'name').map((i) => i.name)).toEqual(['a', 'b', 'c']);
    expect(sortBy(items, 'fmu.name').map((i) => i.name)).toEqual(['c', 'b', 'a']);
    expect(sortBy(items, (i) => -i.name.charCodeAt(0)).map((i) => i.name)).toEqual(['c', 'b', 'a']);
  });

  it('sorts primitives when no iteratee is given', () => {
    expect(sortBy(['b', 'c', 'a'])).toEqual(['a', 'b', 'c']);
  });

  it('breaks ties with the next key and keeps the original order otherwise', () => {
    const items = [{ id: 1, p: 2, t: 'b' }, { id: 2, p: 1, t: 'z' }, { id: 3, p: 2, t: 'a' }, { id: 4, p: 2, t: 'a' }];

    expect(sortBy(items, ['p', 't']).map((i) => i.id)).toEqual([2, 3, 4, 1]);
  });

  it('puts null, then undefined, then NaN last, as lodash does', () => {
    expect(sortBy([NaN, undefined, 2, null, 1])).toEqual([1, 2, null, undefined, NaN]);
  });

  it('returns an empty array for a missing collection and does not mutate the input', () => {
    const input = [3, 1, 2];

    expect(sortBy(undefined, 'name')).toEqual([]);
    expect(sortBy(input)).toEqual([1, 2, 3]);
    expect(input).toEqual([3, 1, 2]);
  });
});

describe('uniqBy', () => {
  it('keeps the first item per key or function result', () => {
    const items = [{ id: 1, k: 'a' }, { id: 2, k: 'b' }, { id: 3, k: 'a' }];

    expect(uniqBy(items, 'k').map((i) => i.id)).toEqual([1, 2]);
    expect(uniqBy(items, (i) => i.id % 2).map((i) => i.id)).toEqual([1, 2]);
    expect(uniqBy(undefined, 'k')).toEqual([]);
  });
});

describe('debounce', () => {
  it('calls once with the last arguments after the wait', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 250);

    debounced(1);
    debounced(2);
    vi.advanceTimersByTime(249);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(2);

    debounced(3);
    debounced.cancel();
    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledOnce();
    vi.useRealTimers();
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

describe('htmlToText', () => {
  it('drops inline tags and keeps their text', () => {
    expect(htmlToText('See <a href="https://example.org">the <strong>guide</strong></a>.')).toBe('See the guide.');
  });

  it('separates block elements with a space', () => {
    expect(htmlToText('<p>First.</p><p>Second</p><ul><li>one</li><li>two</li></ul>line<br/>break'))
      .toBe('First. Second one two line break');
  });

  it('removes embedded frames, scripts and styles entirely', () => {
    expect(htmlToText('<p>Watch:</p><iframe src="https://www.youtube.com/embed/x">fallback</iframe><script>alert(1)</script>'))
      .toBe('Watch:');
  });

  it('decodes common entities', () => {
    expect(htmlToText('A&nbsp;&amp;&nbsp;B &lt;tag&gt; &quot;q&quot; it&#39;s &#x41; &eacute;')).toBe('A & B <tag> "q" it\'s A &eacute;');
  });

  it('handles empty values', () => {
    expect(htmlToText(null)).toBe('');
    expect(htmlToText(undefined)).toBe('');
  });
});

describe('getApiFiltersParams', () => {
  it('builds filter params and skips empty filters', () => {
    expect(getApiFiltersParams({ country: [7, 47], operator: [], fmu: undefined })).toEqual({
      'filter[country]': '7,47'
    });
  });
});
