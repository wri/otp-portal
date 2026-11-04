import { describe, expect, it, vi } from 'vitest';

// es.json as Transifex returns it before a new key is pushed
vi.mock('lang/es.json', () => ({ default: { 'Address': 'Dirección' } }));
vi.mock('lang/zu.json', () => ({ default: { 'Address': 'Address', 'database.page_of': 'Page {page} of {pages}' } }));

const { translations } = await import('utils/translations');

describe('translations', () => {
  it('keeps the locale text where it has a key', () => {
    expect(translations.es.Address).toEqual([{ type: 0, value: 'Dirección' }]);
  });

  it('fills keys missing from a locale with zu, compiled', () => {
    expect(translations.es['database.page_of']).toEqual(expect.arrayContaining([{ type: 1, value: 'page' }]));
  });
});
