import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';

import { dayjsLocale } from 'utils/dayjs-locales';
import { SOURCES } from 'utils/translations';

describe('dayjs locales', () => {
  // an unregistered locale silently falls back to English
  it.each(Object.keys(SOURCES))('is registered for "%s"', (language) => {
    expect(dayjs('2026-01-05').locale(dayjsLocale(language)).locale()).toBe(dayjsLocale(language));
  });

  it('maps Chinese to the name dayjs uses', () => {
    expect(dayjsLocale('zh')).toBe('zh-cn');
    expect(dayjs('2026-01-05').locale(dayjsLocale('zh')).format('MMMM')).toBe('一月');
  });
});
