// Server-only. Every locale is parsed once here, so the browser receives ready ASTs and its bundle
// can use @formatjs/icu-messageformat-parser/no-parser (see next.config.js) instead of the full
// parser. Dev and production go through the same path, so a missing tag handler shows up in dev too.
import { parse } from '@formatjs/icu-messageformat-parser';

import en from 'lang/en.json';
import es from 'lang/es.json';
import fr from 'lang/fr.json';
import pt from 'lang/pt.json';
import ja from 'lang/ja.json';
import ko from 'lang/ko.json';
import vi from 'lang/vi.json';
import zh from 'lang/zh_CN.json';

export const SOURCES = { en, es, fr, pt, ja, ko, vi, zh };

export function compileMessages(messages, locale) {
  return Object.fromEntries(Object.entries(messages).map(([id, message]) => {
    try {
      return [id, parse(message)];
    } catch (error) {
      // Kept as a string, which react-intl returns as-is: how every message rendered before
      // compilation. utils/__tests__/translations.test.js fails on this, so it can't ship unnoticed.
      console.error(`Invalid translation "${id}" (${locale}): ${error.message}`);
      return [id, message];
    }
  }));
}

export const translations = Object.fromEntries(
  Object.entries(SOURCES).map(([locale, messages]) => [locale, compileMessages(messages, locale)])
);
