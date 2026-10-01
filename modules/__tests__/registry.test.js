import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { HYDRATE } from 'next-redux-wrapper';

import { makeStore, serializeState } from '../../store';

const GLOBAL_SLICES = ['countries', 'language', 'notifications', 'operators', 'search', 'user'];

describe('store', () => {
  it('starts with only the global slices', () => {
    expect(Object.keys(makeStore().getState()).sort()).toEqual(GLOBAL_SLICES);
  });

  it('gains a page slice once its module is imported', async () => {
    await import('modules/observations');

    expect(Object.keys(makeStore().getState())).toContain('observations');
  });

  it('hydrates state for known slices and ignores slices it has no reducer for', async () => {
    await import('modules/observations');
    const store = makeStore();

    store.dispatch({
      type: HYDRATE,
      payload: {
        language: 'fr',
        observations: { ...store.getState().observations, hydrated: true },
        operatorsRanking: { data: [1, 2, 3] }
      }
    });

    expect(store.getState().language).toBe('fr');
    expect(store.getState().observations.hydrated).toBe(true);
    expect(store.getState()).not.toHaveProperty('operatorsRanking');
  });
});

describe('serializeState', () => {
  it('sends global slices and page slices the request changed, not untouched page slices', async () => {
    const { setFilters } = await import('modules/operators-ranking');
    await import('modules/observations');
    const store = makeStore();

    store.dispatch(setFilters({ fmu: 'abc' }));
    const sent = serializeState(store.getState());

    expect(Object.keys(sent)).toEqual(expect.arrayContaining(['language', 'user', 'operatorsRanking']));
    expect(sent).not.toHaveProperty('observations');
  });
});

// A page-specific slice only exists in the store if something the page imports pulls its module
// in. Reading `state.<slice>` on a page that never imports it would be undefined at runtime.
describe('page slices', () => {
  const ROOT = path.resolve(__dirname, '../..');
  const DIRS = ['components', 'constants', 'hooks', 'modules', 'selectors', 'services', 'utils', 'pages'];

  const sliceOf = {};
  fs.readdirSync(path.join(ROOT, 'modules')).filter((f) => f.endsWith('.js')).forEach((f) => {
    const match = fs.readFileSync(path.join(ROOT, 'modules', f), 'utf8').match(/registerReducer\('(\w+)'/);
    if (match) sliceOf[path.join(ROOT, 'modules', f)] = match[1];
  });
  const keys = Object.values(sliceOf);

  const resolve = (spec, from) => {
    let base;
    if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
    else if (spec.startsWith('~/')) base = path.join(ROOT, spec.slice(2));
    else if (DIRS.includes(spec.split('/')[0]) || spec === 'store') base = path.join(ROOT, spec);
    else return null;
    return [base, `${base}.js`, `${base}/index.js`].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
  };

  const cache = {};
  const analyse = (file) => {
    if (!cache[file]) {
      const source = fs.readFileSync(file, 'utf8');
      cache[file] = {
        imports: [...source.matchAll(/(?:from\s+|import\(\s*|require\(\s*)['"]([^'"]+)['"]/g)]
          .map((m) => resolve(m[1], file))
          .filter((f) => f && f.endsWith('.js')),
        reads: keys.filter((key) => sliceOf[file] !== key
          && new RegExp(`(state|getState\\(\\))\\.${key}\\b|\\{[^}]*\\b${key}\\b[^}]*\\}\\s*=\\s*(getState\\(\\)|state)\\b`).test(source))
      };
    }
    return cache[file];
  };

  const pages = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'api') walk(full);
    } else if (entry.name.endsWith('.js') && !/^_(document|error)/.test(entry.name)) {
      pages.push(full);
    }
  });
  walk(path.join(ROOT, 'pages'));

  it('finds the registered slices', () => {
    expect(keys.length).toBeGreaterThan(5);
  });

  it.each(pages.map((page) => [path.relative(ROOT, page), page]))('%s imports every slice it reads', (_name, page) => {
    const seen = new Set();
    const registered = new Set();
    const read = new Set();
    const stack = [page];

    while (stack.length) {
      const file = stack.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      if (sliceOf[file]) registered.add(sliceOf[file]);
      const { imports, reads } = analyse(file);
      reads.forEach((key) => read.add(key));
      stack.push(...imports);
    }

    expect([...read].filter((key) => !registered.has(key))).toEqual([]);
  });
});
