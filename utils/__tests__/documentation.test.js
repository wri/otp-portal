import { describe, it, expect, vi, afterEach } from 'vitest';

import { HELPERS_DOC, STATUSES, getTodayDate } from '../documentation';

describe('getTodayDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is evaluated on every call', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12));
    expect(getTodayDate()).toBe('2026-01-01');

    vi.setSystemTime(new Date(2026, 0, 2, 12));
    expect(getTodayDate()).toBe('2026-01-02');
  });
});

describe('HELPERS_DOC.getPercentage', () => {
  it('prefers the percentage of all documents', () => {
    expect(HELPERS_DOC.getPercentage({
      'percentage-valid-documents-all': 0.4567,
      'percentage-valid-documents': 0.9
    })).toBe('45.67');
  });

  it('falls back to the percentage of valid documents and drops trailing zeros', () => {
    expect(HELPERS_DOC.getPercentage({ 'percentage-valid-documents': 0.5 })).toBe('50');
  });

  it('is 0 without percentages', () => {
    expect(HELPERS_DOC.getPercentage({})).toBe(0);
    expect(HELPERS_DOC.getPercentage({ 'percentage-valid-documents-all': 0 })).toBe(0);
  });
});

describe('HELPERS_DOC grouping', () => {
  const docs = [
    { id: 1, type: 'operator', category: 'Legal', categoryPosition: 2, subCategory: 'Tax', subCategoryPosition: 1, status: 'doc_valid' },
    { id: 2, type: 'fmu', category: 'Forest', categoryPosition: 1, subCategory: 'Plans', subCategoryPosition: 3, status: 'doc_valid' },
    { id: 3, type: 'fmu', category: 'Legal', categoryPosition: 2, subCategory: 'Permits', subCategoryPosition: 2, status: 'doc_expired' },
    { id: 4, type: 'operator', category: 'Legal', categoryPosition: 2, subCategory: 'Tax', subCategoryPosition: 1, status: 'doc_not_provided' }
  ];
  const ids = (group) => Object.fromEntries(Object.entries(group).map(([k, v]) => [k, v.map((d) => d.id)]));

  it('groups by type and status', () => {
    expect(ids(HELPERS_DOC.getGroupedByType(docs))).toEqual({ operator: [1, 4], fmu: [2, 3] });
    expect(ids(HELPERS_DOC.getGroupedByStatus(docs))).toEqual({ doc_valid: [1, 2], doc_expired: [3], doc_not_provided: [4] });
  });

  it('orders categories and subcategories by their position', () => {
    const byCategory = HELPERS_DOC.getGroupedByCategory(docs);
    const bySubCategory = HELPERS_DOC.getGroupedBySubCategory(docs);

    expect(Object.keys(byCategory)).toEqual(['Forest', 'Legal']);
    expect(byCategory.Legal.map((d) => d.id)).toEqual([1, 3, 4]);
    expect(Object.keys(bySubCategory)).toEqual(['Tax', 'Permits', 'Plans']);
  });

  it('builds status chart slices as percentages', () => {
    const chart = HELPERS_DOC.getGroupedByStatusChart(docs.slice(0, 3));

    expect(chart).toEqual([
      { id: 'doc_valid', label: 'Provided (valid)', value: 66.67, fill: STATUSES.doc_valid.fill, stroke: STATUSES.doc_valid.stroke },
      { id: 'doc_expired', label: 'Expired', value: 33.33, fill: STATUSES.doc_expired.fill, stroke: STATUSES.doc_expired.stroke }
    ]);
    expect(HELPERS_DOC.getGroupedByStatusChart([])).toEqual([]);
  });
});
