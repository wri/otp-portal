import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';

// Messages reach the browser precompiled (utils/translations.js), and a compiled message that
// fails to format renders its id instead of the text. These checks keep that from shipping.

const ROOT = path.resolve(__dirname, '../..');
const LANG_DIR = path.join(ROOT, 'lang');
const LOCALES = Object.fromEntries(
  fs.readdirSync(LANG_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f, JSON.parse(fs.readFileSync(path.join(LANG_DIR, f), 'utf8'))])
);
const EN = LOCALES['en.json'];

// The only messages allowed to contain tags, and the tags the code rendering them has handlers for.
// Adding a tag anywhere else means adding a handler first, then an entry here.
const TAG_HANDLERS = [
  { ids: ['home.intro'], tags: ['span'] }, // pages/index.js
  { ids: ['signup.user.form.field.producer.newsletter'], tags: ['link'] }, // components/users/new.js
  { ids: ['operator-detail.license.doc_not_provided'], tags: ['a'] }, // documents-publication-authorization.js
  { ids: ['layer.tree-cover-loss.metadata.disclaimer'], tags: ['highlight'] }, // legend-list renderDisclaimer
  { ids: /^layer\..+\.metadata\.(subtitle|overview|source)$/, tags: ['p', 'h4'] } // components/map/layer-info.js
];

function handledTags(id) {
  const entry = TAG_HANDLERS.find(({ ids }) => (Array.isArray(ids) ? ids.includes(id) : ids.test(id)));
  return entry ? entry.tags : [];
}

// messages that don't parse are reported by the compile check, not here
function tryParse(message) {
  try {
    return parse(message);
  } catch {
    return [];
  }
}

function collect(ast, found = { tags: new Set(), args: new Set() }) {
  ast.forEach((el) => {
    if (el.type === TYPE.tag) {
      found.tags.add(el.value);
      collect(el.children, found);
    } else if (el.type !== TYPE.literal && el.type !== TYPE.pound) {
      found.args.add(el.value);
    }
    if (el.options) Object.values(el.options).forEach((option) => collect(option.value, found));
  });
  return found;
}

describe.each(Object.keys(LOCALES))('%s', (file) => {
  const messages = LOCALES[file];

  it('has only messages that compile', () => {
    const invalid = Object.entries(messages).flatMap(([id, message]) => {
      try {
        parse(message);
        return [];
      } catch (error) {
        return [`${id}: ${error.message}`];
      }
    });

    expect(invalid).toEqual([]);
  });

  it('uses only tags the rendering code handles', () => {
    const unhandled = Object.entries(messages).flatMap(([id, message]) => {
      const allowed = handledTags(id);
      return [...collect(tryParse(message)).tags].filter((tag) => !allowed.includes(tag)).map((tag) => `${id}: <${tag}>`);
    });

    expect(unhandled).toEqual([]);
  });

  it('uses the same placeholders as English', () => {
    const mismatched = Object.entries(messages)
      .filter(([id]) => id in EN)
      .flatMap(([id, message]) => {
        const expected = [...collect(tryParse(EN[id])).args].sort();
        const actual = [...collect(tryParse(message)).args].sort();
        return String(actual) === String(expected) ? [] : [`${id}: {${actual}} instead of {${expected}}`];
      });

    expect(mismatched).toEqual([]);
  });
});

describe('message ids used in code', () => {
  // Without a message, react-intl falls back to defaultMessage, which the browser bundle can no
  // longer parse, or to the raw id.
  it('all exist in en.json', () => {
    const files = [];
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__') walk(full);
      } else if (entry.name.endsWith('.js')) {
        files.push(full);
      }
    });
    ['components', 'constants', 'hooks', 'modules', 'pages', 'selectors', 'services', 'utils']
      .forEach((dir) => walk(path.join(ROOT, dir)));

    // literal ids only; `'annex_' + status` and template strings are built at runtime
    const LITERAL_ID = /formatMessage\(\s*\{\s*id:\s*(['"])([^'"]+)\1(?!\s*\+)/g;
    const missing = files.flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return [...source.matchAll(LITERAL_ID)]
        .filter(([, , id]) => !(id in EN))
        .map(([, , id]) => `${id} (${path.relative(ROOT, file)})`);
    });

    expect(missing).toEqual([]);
  });
});
